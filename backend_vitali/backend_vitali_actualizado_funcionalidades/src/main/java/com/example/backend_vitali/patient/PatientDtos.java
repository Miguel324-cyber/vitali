package com.example.backend_vitali.patient;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class PatientDtos {

    private PatientDtos() {
    }

    public record UpdatePatientProfileRequest(
            @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
            String fullName,

            @Size(max = 2000000, message = "La imagen es demasiado grande")
            String avatarUrl,

            @Size(max = 20, message = "Tipo de documento no válido")
            String documentType,

            @Size(max = 50, message = "El número de documento no puede superar 50 caracteres")
            String documentNumber,

            @Past(message = "La fecha de nacimiento debe estar en el pasado")
            LocalDate birthDate,

            @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
            String phone,

            Double weight,

            Double height,

            @Size(max = 2000, message = "Las condiciones médicas son muy extensas")
            String conditions,

            @Size(max = 2000, message = "La lista de medicamentos es muy extensa")
            String medications
    ) {
    }

    public record PatientProfileResponse(
            Long profileId,
            Long userId,
            String fullName,
            String email,
            String avatarUrl,
            String documentType,
            String documentNumber,
            LocalDate birthDate,
            String phone,
            Double weight,
            Double height,
            String conditions,
            String medications,
            String assignedDoctorName,
            String assignedDoctorEmail,
            String assignedDoctorSpecialty,
            String assignedDoctorRegistration,
            Long familyUserId,
            String familyName,
            String familyEmail,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }
}