package com.example.backend_vitali.medication;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Endpoints del catálogo de medicamentos incorporado desde el segundo backend.
 * La autenticación y autorización siguen siendo las del backend principal (JWT).
 *
 * IMPORTANTE: estos endpoints exponen información de referencia. No sustituyen
 * la valoración de un médico ni emiten una autorización clínica de dosis.
 */
@RestController
@RequestMapping("/api/medicamentos")
public class MedicationController {
    private final JdbcTemplate jdbc;

    public MedicationController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public List<Map<String, Object>> listarMedicamentos(
            @RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return jdbc.queryForList("""
                SELECT medicamento, active_ingredient, purpose, dosage_form, route,
                       structured_data_status, concentraciones_disponibles,
                       fuente_etiqueta_oficial, alcance_presentacion
                FROM alertas_medicamentos
                ORDER BY medicamento
                LIMIT 500
                """);
        }
        return jdbc.queryForList("""
            SELECT medicamento, active_ingredient, purpose, dosage_form, route,
                   structured_data_status, concentraciones_disponibles,
                   fuente_etiqueta_oficial, alcance_presentacion
            FROM alertas_medicamentos
            WHERE medicamento LIKE ? OR active_ingredient LIKE ?
            ORDER BY medicamento
            LIMIT 100
            """, "%" + q.trim() + "%", "%" + q.trim() + "%");
    }

    @GetMapping("/presentaciones")
    public List<Map<String, Object>> listarPresentaciones(
            @RequestParam(required = false) String medicamento) {
        if (medicamento == null || medicamento.isBlank()) {
            return jdbc.queryForList("""
                SELECT id, medicamento, forma, via, concentration_value,
                       concentration_unit, denominator, salt_or_release,
                       source_label, source_url, source_scope
                FROM presentaciones_medicamento
                ORDER BY medicamento, forma
                LIMIT 1000
                """);
        }
        return jdbc.queryForList("""
            SELECT id, medicamento, forma, via, concentration_value,
                   concentration_unit, denominator, salt_or_release,
                   source_label, source_url, source_scope
            FROM presentaciones_medicamento
            WHERE medicamento = ? COLLATE NOCASE
            ORDER BY forma
            """, medicamento.trim());
    }

    @GetMapping("/reglas")
    public List<Map<String, Object>> listarReglas(
            @RequestParam String medicamento) {
        if (medicamento == null || medicamento.isBlank()) {
            throw new IllegalArgumentException("Debe indicar el medicamento.");
        }
        return jdbc.queryForList("""
            SELECT rule_id, medicamento, dose_min_mg_per_administration,
                   dose_max_mg_per_administration, max_daily_dose_mg,
                   max_daily_dose_mg_per_kg, frequency, target_population,
                   indication, max_duration_days, duration_limit_text,
                   rule_kind, structured_status, source_url
            FROM reglas_dosis
            WHERE medicamento = ? COLLATE NOCASE
            ORDER BY rule_id
            """, medicamento.trim());
    }

    @GetMapping("/buscar")
    public List<Map<String, Object>> buscar(
            @RequestParam String nombre) {
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("Debe indicar un nombre para buscar.");
        }
        return jdbc.queryForList("""
            SELECT p.id, p.medicamento, p.forma, p.via, p.concentration_value,
                   p.concentration_unit, p.denominator, p.source_label, p.source_url
            FROM presentaciones_medicamento p
            WHERE p.medicamento LIKE ?
            ORDER BY p.medicamento
            LIMIT 100
            """, "%" + nombre.trim() + "%");
    }
}
