
package com.example.backend_vitali.doctor;

import com.example.backend_vitali.user.AccountStatus;

import java.time.LocalDateTime;

public final class DoctorDtos {

    private DoctorDtos() {
    }

    public record DoctorProfileResponse(
            Long userId,
            String fullName,
            String email,
            String professionalRegistration,
            String specialty,
            String documentType, String documentNumber, String phone,
            java.time.LocalDate birthDate, String university, Integer graduationYear,
            Integer yearsExperience, String consultationMode, String professionalBio,
            AccountStatus status,
            LocalDateTime reviewedAt
    ) {
    }

    public record DoctorReviewResponse(
            Long userId,
            String fullName,
            String email,
            String professionalRegistration,
            String specialty,
            String documentType, String documentNumber, String phone,
            java.time.LocalDate birthDate, String university, Integer graduationYear,
            Integer yearsExperience, String consultationMode, String professionalBio,
            AccountStatus status,
            LocalDateTime reviewedAt,
            Long reviewedBy
    ) {
    }

    public record DoctorPatientSummary(
            Long patientId, String fullName, String email, String avatarUrl,
            java.time.LocalDate birthDate, String phone, Double weight, Double height,
            String conditions, String medications
    ) {}
}
