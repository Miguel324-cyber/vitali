package com.example.backend_vitali.medication;

import com.example.backend_vitali.security.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Quién puede ver los datos clínicos de un paciente: el propio paciente,
 * su médico asignado o un familiar con vínculo activo.
 */
@Component
public class PatientAccessGuard {

    private final JdbcTemplate jdbc;

    public PatientAccessGuard(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void check(Long patientId) {
        Long current = CurrentUser.getId();
        String role = jdbc.queryForObject("SELECT role FROM users WHERE id = ?", String.class, current);
        if ("PATIENT".equals(role) && !current.equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes consultar otro paciente.");
        }
        if ("DOCTOR".equals(role) && !isAssignedDoctor(current, patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El paciente no está asignado a este médico.");
        }
        if ("FAMILY".equals(role)) {
            Integer c = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM family_links WHERE patient_user_id = ? AND family_user_id = ? AND active = 1",
                    Integer.class, patientId, current);
            if (c == null || c == 0) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No existe un vínculo familiar activo.");
            }
        }
    }

    public boolean isAssignedDoctor(Long doctorId, Long patientId) {
        Integer c = jdbc.queryForObject(
                "SELECT COUNT(*) FROM patient_profiles WHERE user_id = ? AND assigned_doctor_id = ?",
                Integer.class, patientId, doctorId);
        return c != null && c > 0;
    }
}
