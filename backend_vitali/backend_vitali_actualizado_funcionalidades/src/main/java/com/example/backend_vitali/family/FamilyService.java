package com.example.backend_vitali.family;

import com.example.backend_vitali.doctor.DoctorProfile;
import com.example.backend_vitali.doctor.DoctorRepository;
import com.example.backend_vitali.patient.PatientProfile;
import com.example.backend_vitali.patient.PatientRepository;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class FamilyService {

    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final FamilyLinkRepository linkRepository;

    public FamilyService(
            FamilyRepository familyRepository,
            UserRepository userRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            FamilyLinkRepository linkRepository
    ) {
        this.familyRepository = familyRepository;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.linkRepository = linkRepository;
    }

    /**
     * Obtiene el perfil familiar del usuario autenticado.
     *
     * GET /api/family/me
     */
    public FamilyProfile getMyProfile() {

        Long userId = CurrentUser.getId();

        AppUser user = getActiveFamilyUser(userId);

        return familyRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new FamilyProfileNotFoundException(
                                "El usuario todavía no tiene un perfil familiar."
                        )
                );
    }

    /**
     * Actualiza el perfil familiar.
     *
     * PUT /api/family/me
     */
    @Transactional
    public FamilyProfile updateMyProfile(
            FamilyDtos.UpdateFamilyProfileRequest request
    ) {

        Long userId = CurrentUser.getId();

        AppUser user = getActiveFamilyUser(userId);

        /*
         * Actualizar nombre.
         */
        if (request.fullName() != null
                && !request.fullName().isBlank()) {

            user.setFullName(
                    request.fullName().trim()
            );
        }

        /*
         * Actualizar correo.
         */
        if (request.email() != null
                && !request.email().isBlank()) {

            String email = normalizeEmail(request.email());

            userRepository.findByEmailIgnoreCase(email)
                    .ifPresent(existing -> {

                        if (!existing.getId().equals(userId)) {
                            throw new IllegalArgumentException(
                                    "El correo electrónico ya está asociado a otra cuenta."
                            );
                        }
                    });

            user.setEmail(email);
        }

        FamilyProfile profile =
                familyRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new FamilyProfileNotFoundException(
                                        "El perfil familiar no existe."
                                )
                        );

        /*
         * Actualizar teléfono.
         */
        if (request.phone() == null) {
            profile.updatePhone(null);
        } else {

            String phone = request.phone().trim();

            profile.updatePhone(
                    phone.isBlank() ? null : phone
            );
        }

        return profile;
    }

    /**
     * Obtiene el paciente vinculado al familiar.
     *
     * GET /api/family/patient
     *
     * Un familiar solamente puede tener un vínculo activo.
     */
    public FamilyDtos.FamilyPatientResponse getLinkedPatient() {

        Long familyId = CurrentUser.getId();

        AppUser family = getActiveFamilyUser(familyId);

        FamilyLink link =
                linkRepository.findFirstByFamilyIdAndActiveTrue(familyId)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "No tienes un paciente vinculado."
                                )
                        );

        AppUser patient = link.getPatient();

        if (patient == null) {
            throw new AccessDeniedException(
                    "El vínculo familiar no tiene un paciente válido."
            );
        }

        if (patient.getRole() != Role.PATIENT) {
            throw new AccessDeniedException(
                    "La cuenta vinculada no corresponde a un paciente."
            );
        }

        if (patient.getStatus() != AccountStatus.ACTIVE) {
            throw new AccessDeniedException(
                    "La cuenta del paciente no está disponible."
            );
        }

        PatientProfile profile =
                patientRepository.findByUserId(patient.getId())
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "El perfil del paciente no existe."
                                )
                        );

        /*
         * Médico asignado.
         */
        AppUser doctor = profile.getAssignedDoctor();

        String doctorSpecialty = null;

        if (doctor != null) {

            doctorSpecialty =
                    doctorRepository.findByUserId(doctor.getId())
                            .map(DoctorProfile::getSpecialty)
                            .orElse(null);
        }

        /*
         * Por ahora mantenemos estas listas vacías.
         *
         * Esto permite que el DTO sea compatible con el frontend
         * mientras posteriormente conectamos:
         * - citas
         * - consultas
         * - tratamientos
         */
        List<Map<String, Object>> appointments = List.of();
        List<Map<String, Object>> consultations = List.of();
        List<Map<String, Object>> treatments = List.of();

        return new FamilyDtos.FamilyPatientResponse(

                patient.getId(),

                patient.getFullName(),

                patient.getEmail(),

                profile.getAvatarUrl(),

                profile.getBirthDate(),

                profile.getPhone(),

                profile.getWeight(),

                profile.getHeight(),

                profile.getConditions(),

                profile.getMedications(),

                doctor == null
                        ? null
                        : doctor.getId(),

                doctor == null
                        ? null
                        : doctor.getFullName(),

                doctorSpecialty,

                appointments,

                consultations,

                treatments
        );
    }

    /**
     * Obtiene y valida el usuario familiar autenticado.
     */
    private AppUser getActiveFamilyUser(Long userId) {

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new AccessDeniedException(
                                "No se encontró el usuario autenticado."
                        )
                );

        if (user.getRole() != Role.FAMILY) {
            throw new AccessDeniedException(
                    "Solo los usuarios familiares pueden acceder a esta sección."
            );
        }

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AccessDeniedException(
                    "La cuenta familiar no está activa."
            );
        }

        return user;
    }

    /**
     * Normaliza correos electrónicos.
     */
    private String normalizeEmail(String email) {

        if (email == null) {
            return null;
        }

        return email.trim().toLowerCase();
    }

    /**
     * Excepción específica cuando no existe el perfil familiar.
     */
    public static class FamilyProfileNotFoundException
            extends RuntimeException {

        public FamilyProfileNotFoundException(String message) {
            super(message);
        }
    }
}
