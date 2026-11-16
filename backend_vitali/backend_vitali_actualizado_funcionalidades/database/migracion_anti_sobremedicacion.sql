-- ============================================================
-- Migración: base_anti_sobremedicacion  ->  vitali.db
-- Ejecutar CONECTADO a vitali.db (haz backup antes).
-- Ajusta la ruta del ATTACH si el archivo está en otra carpeta.
-- Es idempotente: se puede correr más de una vez sin duplicar.
-- ============================================================
PRAGMA foreign_keys = OFF;
ATTACH DATABASE 'base_anti_sobremedicacion.db' AS src;

BEGIN;

-- ---------- 1) Tablas de referencia (con datos) ----------
CREATE TABLE IF NOT EXISTS alertas_medicamentos (
  "medicamento" TEXT NOT NULL PRIMARY KEY, "active_ingredient" TEXT, "purpose" TEXT,
  "dosage_and_administration" TEXT, "overdosage" TEXT, "boxed_warning" TEXT, "warnings" TEXT,
  "contraindications" TEXT, "do_not_use" TEXT, "drug_interactions" TEXT, "stop_use" TEXT,
  "abuse" TEXT, "drug_abuse_and_dependence" TEXT, "pregnancy_or_breast_feeding" TEXT,
  "keep_out_of_reach_of_children" TEXT, "active_ingredient_normalized" TEXT,
  "strength_value" REAL, "strength_unit" TEXT, "strength_denominator" TEXT,
  "dosage_form" TEXT, "route" TEXT,
  "structured_data_status" TEXT NOT NULL DEFAULT 'PENDIENTE_PRESENTACION',
  "structured_data_notes" TEXT, "concentraciones_disponibles" TEXT,
  "fuente_etiqueta_oficial" TEXT, "alcance_presentacion" TEXT
);

CREATE TABLE IF NOT EXISTS presentaciones_medicamento (
  "id" INTEGER PRIMARY KEY, "medicamento" TEXT NOT NULL, "forma" TEXT NOT NULL, "via" TEXT NOT NULL,
  "concentration_value" REAL NOT NULL, "concentration_unit" TEXT NOT NULL, "denominator" TEXT NOT NULL,
  "salt_or_release" TEXT, "source_label" TEXT NOT NULL, "source_url" TEXT NOT NULL,
  "source_scope" TEXT NOT NULL DEFAULT 'Presentación de referencia descrita en etiqueta DailyMed; confirmar producto real',
  FOREIGN KEY ("medicamento") REFERENCES "alertas_medicamentos"("medicamento")
);

CREATE TABLE IF NOT EXISTS reglas_dosis (
  "rule_id" INTEGER PRIMARY KEY, "medicamento" TEXT NOT NULL,
  "dose_min_mg_per_administration" REAL, "dose_max_mg_per_administration" REAL,
  "max_daily_dose_mg" REAL, "max_daily_dose_mg_per_kg" REAL, "frequency" TEXT,
  "target_population" TEXT, "indication" TEXT, "max_duration_days" INTEGER,
  "duration_limit_text" TEXT, "rule_kind" TEXT NOT NULL,
  "source_field" TEXT NOT NULL DEFAULT 'dosage_and_administration', "source_note" TEXT,
  "structured_status" TEXT NOT NULL DEFAULT 'PARCIAL',
  "dose_min_mg_per_day" REAL, "dose_max_mg_per_day" REAL, "max_doses_per_24h" INTEGER,
  "source_url" TEXT, "duration_class" TEXT, "dose_per_administration" REAL,
  "dose_unit_label" TEXT, "max_daily_dose_units" REAL, "unit_limit_period_hours" INTEGER,
  FOREIGN KEY ("medicamento") REFERENCES "alertas_medicamentos"("medicamento")
);

INSERT OR IGNORE INTO alertas_medicamentos       SELECT * FROM src.alertas_medicamentos;
INSERT OR IGNORE INTO presentaciones_medicamento SELECT * FROM src.presentaciones_medicamento;
INSERT OR IGNORE INTO reglas_dosis               SELECT * FROM src.reglas_dosis;

-- ---------- 2) Tablas transaccionales (vacías) ----------
-- La tabla "usuario" de la otra BD NO se importa: se reutiliza "users".
-- Las FK de paciente/médico ahora apuntan a users(id).
CREATE TABLE IF NOT EXISTS receta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_paciente INTEGER NOT NULL,
  fecha_subida TEXT,
  estado_analisis TEXT,
  FOREIGN KEY (id_paciente) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS detalle_receta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_receta INTEGER NOT NULL,
  nombre_medicamento TEXT,
  dosis_indicada TEXT,
  presentacion_id INTEGER,
  unidades_por_dia REAL,
  unidad_consumo TEXT,
  indicacion TEXT,
  dias_tratamiento INTEGER,
  FOREIGN KEY (id_receta) REFERENCES receta(id),
  FOREIGN KEY (presentacion_id) REFERENCES presentaciones_medicamento(id)
);

CREATE TABLE IF NOT EXISTS consulta_medica (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_paciente INTEGER NOT NULL,
  id_medico INTEGER,
  id_receta INTEGER,
  mensaje_duda TEXT CHECK (mensaje_duda IS NULL OR length(mensaje_duda) <= 1000),
  respuesta_medico TEXT CHECK (respuesta_medico IS NULL OR length(respuesta_medico) <= 1000),
  estado TEXT,
  fecha_consulta TEXT,
  FOREIGN KEY (id_paciente) REFERENCES users(id),
  FOREIGN KEY (id_medico)   REFERENCES users(id),
  FOREIGN KEY (id_receta)   REFERENCES receta(id)
);

-- ---------- 3) Índices ----------
CREATE INDEX IF NOT EXISTS idx_presentaciones_medicamento ON presentaciones_medicamento(medicamento);
CREATE INDEX IF NOT EXISTS idx_reglas_dosis_medicamento   ON reglas_dosis(medicamento);
CREATE INDEX IF NOT EXISTS idx_receta_paciente            ON receta(id_paciente);
CREATE INDEX IF NOT EXISTS idx_detalle_receta_receta      ON detalle_receta(id_receta);
CREATE INDEX IF NOT EXISTS idx_consulta_paciente          ON consulta_medica(id_paciente);
CREATE INDEX IF NOT EXISTS idx_consulta_medico            ON consulta_medica(id_medico);

-- ---------- 4) Notas de la base original (advertencias de uso) ----------
CREATE TABLE IF NOT EXISTS anti_sobremedicacion_readme (clave TEXT PRIMARY KEY, valor TEXT NOT NULL);
INSERT OR IGNORE INTO anti_sobremedicacion_readme SELECT * FROM src._base_readme;

COMMIT;

-- Las vistas no pueden crearse dentro de la misma transacción con ATTACH en algunos clientes
DROP VIEW IF EXISTS vw_detalle_receta_dosis;
CREATE VIEW vw_detalle_receta_dosis AS
 SELECT d.id AS detalle_id, d.id_receta, d.nombre_medicamento,
        d.presentacion_id, p.forma, p.via, p.concentration_value,
        p.concentration_unit, p.denominator, d.unidades_por_dia,
        d.unidad_consumo, d.indicacion, d.dias_tratamiento,
        CASE
          WHEN p.concentration_unit='mg' AND p.denominator IN ('tableta','cápsula','supositorio')
               AND d.unidad_consumo IN ('tableta','cápsula','supositorio')
            THEN p.concentration_value * d.unidades_por_dia
          WHEN p.concentration_unit='mg' AND p.denominator='5 mL' AND d.unidad_consumo='mL'
            THEN p.concentration_value * d.unidades_por_dia / 5.0
          ELSE NULL
        END AS cantidad_mg_por_dia,
        CASE
          WHEN p.concentration_unit='% p/p' THEN 'La concentración porcentual en gotas no permite calcular mg sin volumen/masa administrada.'
          WHEN p.concentration_unit='mg' AND p.denominator='5 mL' AND d.unidad_consumo<>'mL' THEN 'Ingrese volumen diario en mL para convertir esta suspensión a mg/día.'
          WHEN p.concentration_unit='mg' AND p.denominator IN ('tableta','cápsula','supositorio') AND d.unidad_consumo NOT IN ('tableta','cápsula','supositorio') THEN 'La unidad ingresada no corresponde a la presentación.'
          ELSE NULL
        END AS nota_conversion
 FROM detalle_receta d
 LEFT JOIN presentaciones_medicamento p ON p.id=d.presentacion_id;

DETACH DATABASE src;
PRAGMA foreign_keys = ON;
