package com.example.backend_vitali.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class AppointmentDtos {

    private AppointmentDtos() {
    }

    public record AppointmentRequest(
            @Future(message = "La fecha propuesta debe ser futura")
            LocalDateTime requestedDateTime,

            @NotBlank(message = "El motivo de la cita es obligatorio")
            @Size(max = 1000, message = "El motivo es demasiado extenso")
            String reason
    ) {
    }

    public record AppointmentDecisionRequest(
            @Future(message = "La fecha de la cita debe ser futura")
            LocalDateTime scheduledDateTime,

            @Size(max = 2000, message = "Las observaciones son demasiado extensas")
            String doctorNotes,

            boolean accepted
    ) {
    }

    public record AppointmentResponse(
            Long id,
            Long patientId,
            String patientName,
            Long doctorId,
            String doctorName,
            LocalDateTime requestedDateTime,
            LocalDateTime scheduledDateTime,
            String reason,
            String doctorNotes,
            AppointmentStatus status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record AppointmentModifyRequest(
            @Future(message = "La fecha debe ser futura")
            LocalDateTime scheduledDateTime,
            @Size(max = 2000) String doctorNotes,
            boolean cancel
    ) {}
}