
package com.example.backend_vitali.patient;

import com.example.backend_vitali.patient.PatientDtos.PatientProfileResponse;
import com.example.backend_vitali.patient.PatientDtos.UpdatePatientProfileRequest;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbc;

    public PatientService(
            PatientRepository patientRepository,
            UserRepository userRepository,
            org.springframework.jdbc.core.JdbcTemplate jdbc
    ) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
        this.jdbc = jdbc;
    }

    private String doctorRepositorySpecialty(Long id) {
        return jdbc.query("SELECT specialty FROM doctor_profiles WHERE user_id = ?", rs -> rs.next() ? rs.getString(1) : null, id);
    }
    private String doctorRepositoryRegistration(Long id) {
        return jdbc.query("SELECT professional_registration FROM doctor_profiles WHERE user_id = ?", rs -> rs.next() ? rs.getString(1) : null, id);
    }

    @Transactional(readOnly = true)
    public PatientProfileResponse getMyProfile() {
        Long userId = CurrentUser.getId();
        AppUser user = getActivePatient(userId);
        PatientProfile profile = getProfile(userId);

        return toResponse(profile, user);
    }

    @Transactional
    public PatientProfileResponse updateMyProfile(
            UpdatePatientProfileRequest request
    ) {
        Long userId = CurrentUser.getId();
        AppUser user = getActivePatient(userId);
        PatientProfile profile = getProfile(userId);

        // Actualizar el nombre solo si se proporciona uno no vacío.
        if (request.fullName() != null
                && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
            userRepository.save(user);
        }

        // Si un campo llega como null, conservar el valor actual.
        profile.updateProfile(
                request.birthDate() != null
                        ? request.birthDate()
                        : profile.getBirthDate(),

                request.phone() != null
                        ? normalize(request.phone())
                        : profile.getPhone(),

                request.avatarUrl() != null
                        ? normalize(request.avatarUrl())
                        : profile.getAvatarUrl(),

                request.documentType() != null
                        ? normalize(request.documentType())
                        : profile.getDocumentType(),

                request.documentNumber() != null
                        ? normalize(request.documentNumber())
                        : profile.getDocumentNumber(),

                request.weight() != null
                        ? request.weight()
                        : profile.getWeight(),

                request.height() != null
                        ? request.height()
                        : profile.getHeight(),

                request.conditions() != null
                        ? normalize(request.conditions())
                        : profile.getConditions(),

                request.medications() != null
                        ? normalize(request.medications())
                        : profile.getMedications()
        );

        PatientProfile saved = patientRepository.save(profile);

        return toResponse(saved, user);
    }

    private AppUser getActivePatient(Long userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                ));

        if (user.getRole() != Role.PATIENT
                || user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para acceder a este perfil"
            );
        }

        return user;
    }

    private PatientProfile getProfile(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "El perfil del paciente no existe"
                ));
    }

    private PatientProfileResponse toResponse(
            PatientProfile profile,
            AppUser user
    ) {
        String doctorName = "Sin médico asignado";

        if (profile.getAssignedDoctor() != null) {
            doctorName = profile.getAssignedDoctor().getFullName();
        }

        Object[] family = jdbc.query("""
                SELECT u.id, u.full_name, u.email
                FROM family_links f JOIN users u ON u.id = f.family_user_id
                WHERE f.patient_user_id = ? AND f.active = 1
                LIMIT 1
                """, rs -> rs.next() ? new Object[]{rs.getLong(1), rs.getString(2), rs.getString(3)} : null, user.getId());

        return new PatientProfileResponse(
                profile.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                profile.getAvatarUrl(),
                profile.getDocumentType(),
                profile.getDocumentNumber(),
                profile.getBirthDate(),
                profile.getPhone(),
                profile.getWeight(),
                profile.getHeight(),
                profile.getConditions(),
                profile.getMedications(),
                doctorName,
                profile.getAssignedDoctor() != null ? profile.getAssignedDoctor().getEmail() : null,
                profile.getAssignedDoctor() != null ? doctorRepositorySpecialty(profile.getAssignedDoctor().getId()) : null,
                profile.getAssignedDoctor() != null ? doctorRepositoryRegistration(profile.getAssignedDoctor().getId()) : null,
                family == null ? null : (Long) family[0],
                family == null ? null : (String) family[1],
                family == null ? null : (String) family[2],
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
