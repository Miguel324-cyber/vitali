package com.example.backend_vitali.appointment;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.example.backend_vitali.appointment.AppointmentDtos.*;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(
            AppointmentService appointmentService
    ) {
        this.appointmentService = appointmentService;
    }

    // El paciente solicita una cita.
    @PostMapping("/request")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> requestAppointment(
            @Valid @RequestBody AppointmentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(appointmentService.requestAppointment(request));
    }

    // El paciente consulta sus solicitudes y citas.
    @GetMapping("/mine")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments() {
        return ResponseEntity.ok(
                appointmentService.getMyAppointments()
        );
    }

    // El médico consulta las solicitudes que tiene asignadas.
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments() {
        return ResponseEntity.ok(
                appointmentService.getDoctorAppointments()
        );
    }

    // Solo el médico responsable puede aceptar o rechazar la solicitud.
    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponse> decideAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDecisionRequest request
    ) {
        return ResponseEntity.ok(
                appointmentService.decideAppointment(id, request)
        );
    }

    @PatchMapping("/{id}/doctor-modify")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponse> modifyByDoctor(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentModifyRequest request
    ) {
        return ResponseEntity.ok(appointmentService.modifyByDoctor(id, request));
    }

    // El paciente puede cancelar su solicitud mientras esté pendiente.
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> cancelMyRequest(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                appointmentService.cancelMyRequest(id)
        );
    }
}