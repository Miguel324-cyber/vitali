package com.example.backend_vitali.medication;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Cambios de esquema del módulo de recetas y consultas.
 * Hibernate crea las tablas base (ddl-auto=update), y estas migraciones
 * agregan columnas adicionales solo si faltan:
 *  - consulta_medica: fecha_respuesta y leida_paciente (notificaciones).
 *  - receta: id_medico (tratamientos asignados por el médico).
 *  - receta_documento: fotos / PDF de recetas subidas por el paciente.
 */
@Component
public class ConsultationSchema {

    private final JdbcTemplate jdbc;

    public ConsultationSchema(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostConstruct
    void migrate() {
        // Verificar si la tabla consulta_medica existe antes de intentar modificarla
        if (tableExists("consulta_medica")) {
            List<String> consulta = columns("consulta_medica");
            if (!consulta.contains("fecha_respuesta")) {
                jdbc.execute("ALTER TABLE consulta_medica ADD COLUMN fecha_respuesta TEXT");
            }
            if (!consulta.contains("leida_paciente")) {
                jdbc.execute("ALTER TABLE consulta_medica ADD COLUMN leida_paciente INTEGER NOT NULL DEFAULT 0");
                // Las respuestas que ya existían no se notifican como nuevas.
                jdbc.update("UPDATE consulta_medica SET leida_paciente = 1 WHERE respuesta_medico IS NOT NULL");
            }
        }

        // Verificar si la tabla receta existe antes de intentar modificarla
        if (tableExists("receta") && !columns("receta").contains("id_medico")) {
            jdbc.execute("ALTER TABLE receta ADD COLUMN id_medico INTEGER REFERENCES users(id)");
        }

        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS receta_documento (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              id_paciente INTEGER NOT NULL,
              id_receta INTEGER,
              nombre_archivo TEXT NOT NULL,
              tipo_contenido TEXT NOT NULL,
              tamano_bytes INTEGER NOT NULL,
              contenido_base64 TEXT NOT NULL,
              texto_extraido TEXT,
              fecha_subida TEXT NOT NULL,
              FOREIGN KEY (id_paciente) REFERENCES users(id),
              FOREIGN KEY (id_receta) REFERENCES receta(id)
            )""");

        // Índices para las búsquedas más frecuentes (solo si las tablas existen).
        if (tableExists("patient_profiles")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_patient_profiles_doctor ON patient_profiles(assigned_doctor_id)");
        }
        if (tableExists("family_links")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_family_links_patient ON family_links(patient_user_id)");
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_family_links_family ON family_links(family_user_id)");
        }
        if (tableExists("receta")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_receta_paciente ON receta(id_paciente)");
        }
        if (tableExists("detalle_receta")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_detalle_receta_receta ON detalle_receta(id_receta)");
        }
        if (tableExists("consulta_medica")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_consulta_paciente ON consulta_medica(id_paciente, estado)");
        }
        // receta_documento siempre existe porque se crea arriba con CREATE TABLE IF NOT EXISTS
        jdbc.execute("CREATE INDEX IF NOT EXISTS idx_receta_documento_paciente ON receta_documento(id_paciente)");
        if (tableExists("users")) {
            jdbc.execute("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role, status)");
        }
    }

    private List<String> columns(String table) {
        return jdbc.query("PRAGMA table_info(" + table + ")", (rs, i) -> rs.getString("name"));
    }

    private boolean tableExists(String table) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",
            Integer.class,
            table
        );
        return count != null && count > 0;
    }
}
