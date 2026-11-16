package com.example.backend_vitali.doctor;

import com.example.backend_vitali.user.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Cupo de pacientes por médico: el administrador puede asignar como máximo
 * {@code app.doctor.max-patients} (5 por defecto) pacientes a un mismo médico.
 */
@Service
public class DoctorCapacityService {

    private final JdbcTemplate jdbc;
    private final int maxPatients;

    public DoctorCapacityService(JdbcTemplate jdbc, @Value("${app.doctor.max-patients:5}") int maxPatients) {
        this.jdbc = jdbc;
        this.maxPatients = maxPatients;
    }

    public int maxPatients() {
        return maxPatients;
    }

    public long assignedCount(Long doctorId) {
        Long n = jdbc.queryForObject("SELECT COUNT(*) FROM patient_profiles WHERE assigned_doctor_id = ?", Long.class, doctorId);
        return n == null ? 0 : n;
    }

    /**
     * Lanza 409 si el médico ya completó su cupo. Reasignar al mismo médico que
     * el paciente ya tiene no ocupa un cupo nuevo.
     */
    public void assertCanAccept(AppUser doctor, Long patientCurrentDoctorId) {
        if (doctor.getId().equals(patientCurrentDoctorId)) return;
        long assigned = assignedCount(doctor.getId());
        if (assigned >= maxPatients) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El médico " + doctor.getFullName() + " ya tiene " + assigned + " pacientes asignados (máximo "
                            + maxPatients + "). Quita un paciente de su lista o elige otro médico.");
        }
    }

    /** Médicos con su número de pacientes asignados y el cupo disponible. */
    public List<Map<String, Object>> load() {
        return jdbc.queryForList("""
            SELECT u.id, u.full_name AS fullName, u.email, u.status,
                   (SELECT COUNT(*) FROM patient_profiles p WHERE p.assigned_doctor_id = u.id) AS assignedPatients
              FROM users u
             WHERE u.role = 'DOCTOR'
             ORDER BY u.created_at DESC, u.id DESC
            """).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>(r);
            long assigned = ((Number) r.get("assignedPatients")).longValue();
            m.put("assignedPatients", assigned);
            m.put("maxPatients", maxPatients);
            m.put("full", assigned >= maxPatients);
            return m;
        }).toList();
    }
}
