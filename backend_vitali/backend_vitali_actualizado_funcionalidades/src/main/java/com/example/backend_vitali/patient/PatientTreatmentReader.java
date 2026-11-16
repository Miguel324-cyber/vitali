package com.example.backend_vitali.patient;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Arma el resumen de un paciente con sus tratamientos (recetas registradas)
 * y el número de dudas pendientes. Lo usan el panel del médico y el del admin.
 */
@Component
public class PatientTreatmentReader {

    private final JdbcTemplate jdbc;

    public PatientTreatmentReader(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Medicamentos de las recetas del paciente, la más reciente primero. */
    public List<Map<String, Object>> treatments(Long patientId) {
        return jdbc.queryForList("""
                SELECT r.id AS recipeId, r.fecha_subida AS uploadedAt, r.estado_analisis AS status,
                       r.id_medico AS doctorId,
                       d.id AS itemId, d.nombre_medicamento AS medicine, d.dosis_indicada AS dose,
                       d.unidades_por_dia AS unitsPerDay, d.unidad_consumo AS unit,
                       d.indicacion AS indication, d.dias_tratamiento AS treatmentDays
                  FROM receta r
                  JOIN detalle_receta d ON d.id_receta = r.id
                 WHERE r.id_paciente = ?
                 ORDER BY r.id DESC, d.id
                """, patientId);
    }

    public int pendingQuestions(Long patientId) {
        Integer n = jdbc.queryForObject(
                "SELECT COUNT(*) FROM consulta_medica WHERE id_paciente = ? AND estado = 'PENDIENTE'",
                Integer.class, patientId);
        return n == null ? 0 : n;
    }

    public Map<String, Object> summary(PatientProfile p, boolean includeAvatar) {
        Map<String, Object> m = new LinkedHashMap<>();
        Long id = p.getUser().getId();
        m.put("patientId", id);
        m.put("fullName", p.getUser().getFullName());
        m.put("email", p.getUser().getEmail());
        m.put("status", p.getUser().getStatus());
        if (includeAvatar) m.put("avatarUrl", p.getAvatarUrl());
        m.put("birthDate", p.getBirthDate());
        m.put("phone", p.getPhone());
        m.put("weight", p.getWeight());
        m.put("height", p.getHeight());
        m.put("conditions", p.getConditions());
        m.put("medications", p.getMedications());
        m.put("treatments", treatments(id));
        m.put("pendingQuestions", pendingQuestions(id));
        return m;
    }
}
