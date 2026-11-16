package com.example.backend_vitali.auth;

import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterPatientRequest(
            @NotBlank
            @Size(max = 120)
            String fullName,

            @NotBlank
            @Email
            @Size(max = 254)
            String email,

            @NotBlank
            @Size(min = 12, max = 72)
            String password,

            // --- Nuevos campos del perfil de paciente ---
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

    public record RegisterDoctorRequest(
            @NotBlank
            @Size(max = 120)
            String fullName,

            @NotBlank
            @Email
            @Size(max = 254)
            String email,

            @NotBlank
            @Size(min = 12, max = 72)
            String password,

            @NotBlank
            @Size(max = 80)
            String professionalRegistration,

            @NotBlank @Size(max = 120) String specialty,
            @NotBlank @Size(max = 20) String documentType,
            @NotBlank @Size(max = 50) String documentNumber,
            @NotBlank @Size(max = 30) String phone,
            @Past LocalDate birthDate,
            @NotBlank @Size(max = 180) String university,
            Integer graduationYear,
            Integer yearsExperience,
            @NotBlank @Size(max = 40) String consultationMode,
            @Size(max = 1200) String professionalBio
    ) {
    }

    public record RegisterFamilyRequest(
            @NotBlank
            @Size(max = 120)
            String fullName,

            @NotBlank
            @Email
            @Size(max = 254)
            String email,

            @NotBlank
            @Size(min = 12, max = 72)
            String password
    ) {
    }

    public record LoginRequest(
            @NotBlank
            @Email
            @Size(max = 254)
            String email,

            @NotBlank
            @Size(max = 72)
            String password
    ) {
    }

    public record UserResponse(
            Long id,
            String fullName,
            String email,
            Role role,
            AccountStatus status
    ) {
    }

    public record LoginResponse(
            String accessToken,
            UserResponse user
    ) {
    }
}