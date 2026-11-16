package com.example.backend_vitali.family;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

public final class FamilyDtos {

    private FamilyDtos() {
    }

    /*
     * ==========================================================
     * CREAR INVITACIÓN
     * ==========================================================
     */

    public record CreateFamilyInvitationRequest(

            @NotBlank(
                    message = "El correo del familiar es obligatorio."
            )
            @Email(
                    message = "El correo del familiar no es válido."
            )
            String familyEmail

    ) {
    }

    /*
     * ==========================================================
     * RESPUESTA DE CREACIÓN
     * ==========================================================
     */

    public record FamilyInvitationResponse(

            String token,

            LocalDateTime expiresAt

    ) {
    }

    /*
     * ==========================================================
     * ACEPTACIÓN ANTIGUA POR TOKEN
     * ==========================================================
     */

    public record AcceptFamilyInvitationRequest(

            @NotBlank(
                    message = "El token de invitación es obligatorio."
            )
            String token,

            @NotBlank(
                    message = "Debes indicar el parentesco."
            )
            String relationship,

            String relationshipDetails

    ) {
    }

    /*
     * ==========================================================
     * INVITACIÓN PENDIENTE
     * ==========================================================
     *
     * Esta es la información que recibe la cuenta FAMILY
     * cuando entra a:
     *
     * GET /api/family-invitations/pending
     */

    public record PendingFamilyInvitationResponse(

            Long invitationId,

            Long patientId,

            String patientName,

            String patientEmail,

            LocalDateTime expiresAt

    ) {
    }

    /*
     * ==========================================================
     * ACEPTAR INVITACIÓN PENDIENTE
     * ==========================================================
     */

    public record AcceptPendingFamilyInvitationRequest(

            @NotNull(
                    message = "La invitación es obligatoria."
            )
            Long invitationId,

            @NotBlank(
                    message = "Debes indicar el parentesco."
            )
            String relationship,

            String relationshipDetails

    ) {
    }

    /*
     * ==========================================================
     * RESPUESTA DEL VÍNCULO
     * ==========================================================
     */

    public record FamilyLinkResponse(

            Long linkId,

            Long patientId,

            Long familyId,

            boolean active,

            LocalDateTime createdAt,

            String relationship,

            String relationshipDetails

    ) {
    }

    /*
     * ==========================================================
     * RESPUESTA PARA EL PACIENTE
     * ==========================================================
     */

    public record PatientFamilyLinkResponse(

            Long linkId,

            Long familyId,

            String familyName,

            String familyEmail,

            boolean active,

            LocalDateTime createdAt,

            LocalDateTime revokedAt,

            String relationship,

            String relationshipDetails

    ) {
    }
    public record UpdateFamilyProfileRequest(
            @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
            String fullName,

            @Email(message = "El correo electrónico no es válido")
            @Size(max = 254, message = "El correo no puede superar 254 caracteres")
            String email,

            @Size(max = 30, message = "El teléfono no puede superar 30 caracteres")
            String phone
    ) {
    }

    public record FamilyPatientResponse(
            Long patientId,
            String fullName,
            String email,
            String avatarUrl,
            LocalDate birthDate,
            String phone,
            Double weight,
            Double height,
            String conditions,
            String medications,
            Long doctorId,
            String doctorName,
            String doctorSpecialty,
            List<Map<String, Object>> appointments,
            List<Map<String, Object>> consultations,
            List<Map<String, Object>> treatments
    ) {
    }
}