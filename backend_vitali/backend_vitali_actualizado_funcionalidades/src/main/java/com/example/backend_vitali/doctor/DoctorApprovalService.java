
package com.example.backend_vitali.doctor;

import com.example.backend_vitali.audit.AuditService;
import com.example.backend_vitali.doctor.DoctorDtos.DoctorReviewResponse;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DoctorApprovalService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public DoctorApprovalService(
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            AuditService auditService
    ) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public List<DoctorReviewResponse> listPendingDoctors() {
        return doctorRepository
                .findByUser_Status(AccountStatus.PENDING)
                .stream()
                .sorted((a, b) -> AppUser.NEWEST_FIRST.compare(a.getUser(), b.getUser()))
                .map(this::toReviewResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorReviewResponse approveDoctor(Long doctorUserId) {
        AppUser doctorUser = getPendingDoctor(doctorUserId);
        DoctorProfile profile = getDoctorProfile(doctorUserId);

        Long administratorId = CurrentUser.getId();

        doctorUser.setStatus(AccountStatus.ACTIVE);
        profile.markReviewed(administratorId);

        userRepository.save(doctorUser);
        doctorRepository.save(profile);

        auditService.record(
                administratorId,
                "DOCTOR_APPROVED",
                "DOCTOR",
                doctorUserId,
                "SUCCESS"
        );

        return toReviewResponse(profile);
    }

    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorReviewResponse rejectDoctor(Long doctorUserId) {
        AppUser doctorUser = getPendingDoctor(doctorUserId);
        DoctorProfile profile = getDoctorProfile(doctorUserId);

        Long administratorId = CurrentUser.getId();

        doctorUser.setStatus(AccountStatus.REJECTED);
        profile.markReviewed(administratorId);

        userRepository.save(doctorUser);
        doctorRepository.save(profile);

        auditService.record(
                administratorId,
                "DOCTOR_REJECTED",
                "DOCTOR",
                doctorUserId,
                "SUCCESS"
        );

        return toReviewResponse(profile);
    }

    private AppUser getPendingDoctor(Long doctorUserId) {
        AppUser user = userRepository.findById(doctorUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la cuenta solicitada."
                ));

        if (user.getRole() != Role.DOCTOR) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cuenta indicada no pertenece a un médico."
            );
        }

        if (user.getStatus() != AccountStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La solicitud ya fue procesada o no está pendiente."
            );
        }

        return user;
    }

    private DoctorProfile getDoctorProfile(Long doctorUserId) {
        return doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el perfil médico."
                ));
    }

    private DoctorReviewResponse toReviewResponse(DoctorProfile profile) {
        AppUser user = profile.getUser();

        return new DoctorReviewResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                profile.getProfessionalRegistration(),
                profile.getSpecialty(), profile.getDocumentType(), profile.getDocumentNumber(),
                profile.getPhone(), profile.getBirthDate(), profile.getUniversity(),
                profile.getGraduationYear(), profile.getYearsExperience(),
                profile.getConsultationMode(), profile.getProfessionalBio(),
                user.getStatus(),
                profile.getReviewedAt(),
                profile.getReviewedBy()
        );
    }
}
