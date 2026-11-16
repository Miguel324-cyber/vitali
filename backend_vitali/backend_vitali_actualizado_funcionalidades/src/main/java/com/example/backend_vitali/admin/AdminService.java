
package com.example.backend_vitali.admin;

import com.example.backend_vitali.admin.AdminDtos.AdminOverviewResponse;
import com.example.backend_vitali.auth.AuthDtos;
import com.example.backend_vitali.doctor.DoctorApprovalService;
import com.example.backend_vitali.doctor.DoctorDtos.DoctorReviewResponse;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.patient.PatientRepository;
import com.example.backend_vitali.family.FamilyLinkRepository;
import com.example.backend_vitali.doctor.DoctorRepository;
import com.example.backend_vitali.family.FamilyLink;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.backend_vitali.security.CurrentUser;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@PreAuthorize("hasRole('ADMIN')")
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorApprovalService doctorApprovalService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final FamilyLinkRepository familyLinkRepository;
    private final JdbcTemplate jdbc;
    private final com.example.backend_vitali.patient.PatientTreatmentReader treatmentReader;
    private final com.example.backend_vitali.doctor.DoctorCapacityService doctorCapacity;

    /** Médicos con su número de pacientes y cupo (máximo configurable, 5 por defecto). */
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getDoctorLoad() {
        return doctorCapacity.load();
    }

    public AdminService(
            UserRepository userRepository,
            DoctorApprovalService doctorApprovalService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            FamilyLinkRepository familyLinkRepository,
            JdbcTemplate jdbc,
            com.example.backend_vitali.patient.PatientTreatmentReader treatmentReader,
            com.example.backend_vitali.doctor.DoctorCapacityService doctorCapacity
    ) {
        this.treatmentReader = treatmentReader;
        this.doctorCapacity = doctorCapacity;
        this.jdbc = jdbc;
        this.userRepository = userRepository;
        this.doctorApprovalService = doctorApprovalService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.familyLinkRepository = familyLinkRepository;
    }
    @Transactional(readOnly = true)
    public List<AuthDtos.UserResponse> searchUsers(String search, Role role, AccountStatus status) {
        return userRepository.findAll().stream()
                .filter(u -> search == null || search.isBlank() ||
                        u.getFullName().toLowerCase().contains(search.toLowerCase()) ||
                        u.getEmail().toLowerCase().contains(search.toLowerCase()))
                .filter(u -> role == null || u.getRole() == role)
                .filter(u -> status == null || u.getStatus() == status)
                .sorted(AppUser.NEWEST_FIRST)
                .map(u -> new AuthDtos.UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getStatus()))
                .toList();
    }

    @Transactional
    public AuthDtos.UserResponse updateUser(Long id, com.example.backend_vitali.admin.AdminDtos.UpdateUserRequest request) {
        AppUser u = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
        if (request.fullName() != null && !request.fullName().isBlank()) u.setFullName(request.fullName().trim());
        if (request.email() != null && !request.email().isBlank()) {
            if (userRepository.existsByEmailIgnoreCase(request.email()) && !u.getEmail().equalsIgnoreCase(request.email())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado.");
            }
            u.setEmail(request.email().trim());
        }
        if (request.role() != null) u.setRole(request.role());
        if (request.status() != null) u.setStatus(request.status());
        userRepository.save(u);
        return new AuthDtos.UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getStatus());
    }

    @Transactional
    public void deleteUser(Long id) {
        AppUser target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));

        if (id.equals(CurrentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes eliminar tu propia cuenta de administrador.");
        }

        if (target.getRole() == Role.ADMIN
                && userRepository.countByRoleAndStatus(Role.ADMIN, AccountStatus.ACTIVE) <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede eliminar al último administrador activo.");
        }

        // SQLite no aplica ON DELETE CASCADE en este esquema: se limpian los
        // registros dependientes para no dejar vínculos ni perfiles huérfanos.
        jdbc.update("UPDATE patient_profiles SET assigned_doctor_id = NULL WHERE assigned_doctor_id = ?", id);
        jdbc.update("DELETE FROM family_links WHERE patient_user_id = ? OR family_user_id = ?", id, id);
        jdbc.update("DELETE FROM family_invitations WHERE patient_user_id = ? OR LOWER(family_email) = LOWER(?)", id, target.getEmail());
        jdbc.update("DELETE FROM patient_reminders WHERE patient_user_id = ?", id);
        jdbc.update("DELETE FROM password_reset_tokens WHERE user_id = ?", id);
        jdbc.update("DELETE FROM receta_documento WHERE id_paciente = ?", id);
        jdbc.update("UPDATE receta SET id_medico = NULL WHERE id_medico = ?", id);
        jdbc.update("DELETE FROM detalle_receta WHERE id_receta IN (SELECT id FROM receta WHERE id_paciente = ?)", id);
        jdbc.update("UPDATE consulta_medica SET id_receta = NULL WHERE id_receta IN (SELECT id FROM receta WHERE id_paciente = ?)", id);
        jdbc.update("DELETE FROM receta WHERE id_paciente = ?", id);
        jdbc.update("DELETE FROM consulta_medica WHERE id_paciente = ?", id);
        jdbc.update("UPDATE consulta_medica SET id_medico = NULL WHERE id_medico = ?", id);
        jdbc.update("DELETE FROM appointments WHERE doctor_id = ? OR patient_profile_id IN (SELECT id FROM patient_profiles WHERE user_id = ?)", id, id);
        jdbc.update("DELETE FROM patient_profiles WHERE user_id = ?", id);
        jdbc.update("DELETE FROM family_profiles WHERE user_id = ?", id);
        jdbc.update("DELETE FROM doctor_profiles WHERE user_id = ?", id);
        jdbc.update("DELETE FROM users WHERE id = ?", id);
    }

    /** Pacientes asignados a un médico, con sus tratamientos. */
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getDoctorPatients(Long doctorId) {
        userRepository.findById(doctorId)
                .filter(u -> u.getRole() == Role.DOCTOR)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Médico no encontrado."));
        return patientRepository.findByAssignedDoctor_Id(doctorId).stream()
                .sorted((a, b) -> AppUser.NEWEST_FIRST.compare(a.getUser(), b.getUser()))
                .map(p -> treatmentReader.summary(p, false))
                .toList();
    }

    /** Asigna un médico activo al paciente; con doctorId nulo, quita la asignación. */
    @Transactional
    public void assignDoctor(Long patientId, Long doctorId) {
        var patient = patientRepository.findByUserId(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado."));
        if (doctorId == null) {
            patient.setAssignedDoctor(null);
            patientRepository.save(patient);
            return;
        }
        var doctor = userRepository.findById(doctorId)
                .filter(u -> u.getRole() == Role.DOCTOR && u.getStatus() == AccountStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Médico no disponible."));
        doctorCapacity.assertCanAccept(doctor, patient.getAssignedDoctor() == null ? null : patient.getAssignedDoctor().getId());
        patient.setAssignedDoctor(doctor);
        patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public List<com.example.backend_vitali.admin.AdminDtos.AdminLinkResponse> getLinks() {
        // Médico asignado de todos los pacientes en una sola consulta (antes era una por vínculo).
        java.util.Map<Long, AppUser> doctorByPatient = new java.util.HashMap<>();
        patientRepository.findAll().forEach(p -> {
            if (p.getAssignedDoctor() != null) doctorByPatient.put(p.getUser().getId(), p.getAssignedDoctor());
        });
        return familyLinkRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(FamilyLink::getId).reversed())
                .filter(link -> {
            try {
                link.getPatient().getFullName();
                link.getFamily().getFullName();
                return true;
            } catch (RuntimeException exception) {
                return false; // vínculo huérfano: el usuario ya no existe
            }
        }).map(link -> {
            var patient = link.getPatient();
            var family = link.getFamily();
            var doctor = doctorByPatient.get(patient.getId());
            return new com.example.backend_vitali.admin.AdminDtos.AdminLinkResponse(
                    link.getId(), patient.getId(), patient.getFullName(),
                    doctor == null ? null : doctor.getId(), doctor == null ? null : doctor.getFullName(),
                    family.getId(), family.getFullName(), link.isActive(), link.getRelationship());
        }).toList();
    }

    @Transactional(readOnly = true)
    public AdminOverviewResponse getOverview() {
        long totalUsers = userRepository.count();

        long activePatients = userRepository.countByRoleAndStatus(
                Role.PATIENT,
                AccountStatus.ACTIVE
        );

        long pendingDoctors = userRepository.countByRoleAndStatus(
                Role.DOCTOR,
                AccountStatus.PENDING
        );

        long activeDoctors = userRepository.countByRoleAndStatus(
                Role.DOCTOR,
                AccountStatus.ACTIVE
        );

        long activeFamilies = userRepository.countByRoleAndStatus(
                Role.FAMILY,
                AccountStatus.ACTIVE
        );

        long suspendedUsers = userRepository.countByStatus(
                AccountStatus.SUSPENDED
        );

        return new AdminOverviewResponse(
                totalUsers,
                activePatients,
                pendingDoctors,
                activeDoctors,
                activeFamilies,
                suspendedUsers
        );
    }

    @Transactional(readOnly = true)
    public List<DoctorReviewResponse> listPendingDoctors() {
        return doctorApprovalService.listPendingDoctors();
    }

    @Transactional
    public DoctorReviewResponse approveDoctor(Long userId) {
        return doctorApprovalService.approveDoctor(userId);
    }

    @Transactional
    public DoctorReviewResponse rejectDoctor(Long userId) {
        return doctorApprovalService.rejectDoctor(userId);
    }
}
