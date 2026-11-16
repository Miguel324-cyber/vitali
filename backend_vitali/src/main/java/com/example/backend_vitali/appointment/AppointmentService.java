package com.example.backend_vitali.appointment;

import com.example.backend_vitali.patient.PatientProfile;
import com.example.backend_vitali.patient.PatientRepository;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static com.example.backend_vitali.appointment.AppointmentDtos.*;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AppointmentResponse requestAppointment(
            AppointmentRequest request
    ) {
        Long userId = CurrentUser.getId();

        AppUser patientUser = getActiveUser(userId, Role.PATIENT);

        PatientProfile profile = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe el perfil del paciente"
                ));

        AppUser doctor = profile.getAssignedDoctor();

        if (doctor == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No tienes un médico asignado. Contacta con el administrador."
            );
        }

        if (doctor.getRole() != Role.DOCTOR
                || doctor.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El médico asignado no está disponible para recibir solicitudes"
            );
        }

        if (request.requestedDateTime() != null
                && !request.requestedDateTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha propuesta debe ser futura"
            );
        }

        Appointment appointment = new Appointment(
                profile,
                doctor,
                request.requestedDateTime(),
                request.reason().trim()
        );

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments() {
        Long userId = CurrentUser.getId();
        getActiveUser(userId, Role.PATIENT);

        return appointmentRepository
                .findByPatient_User_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getDoctorAppointments() {
        Long doctorId = CurrentUser.getId();
        getActiveUser(doctorId, Role.DOCTOR);

        return appointmentRepository
                .findByDoctor_IdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse decideAppointment(
            Long appointmentId,
            AppointmentDecisionRequest request
    ) {
        Long doctorId = CurrentUser.getId();
        getActiveUser(doctorId, Role.DOCTOR);

        Appointment appointment = appointmentRepository
                .findByIdAndDoctor_Id(appointmentId, doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró una solicitud asignada a este médico"
                ));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta solicitud ya fue atendida y no se puede responder de nuevo"
            );
        }

        if (request.accepted()) {
            LocalDateTime scheduledDateTime = request.scheduledDateTime();

            if (scheduledDateTime == null
                    || !scheduledDateTime.isAfter(LocalDateTime.now())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Para confirmar la cita debes indicar una fecha y hora futuras"
                );
            }

            appointment.confirm(
                    scheduledDateTime,
                    cleanNotes(request.doctorNotes())
            );
        } else {
            appointment.reject(cleanNotes(request.doctorNotes()));
        }

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse modifyByDoctor(Long appointmentId, AppointmentModifyRequest request) {
        Long doctorId = CurrentUser.getId();
        getActiveUser(doctorId, Role.DOCTOR);
        Appointment appointment = appointmentRepository.findByIdAndDoctor_Id(appointmentId, doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cita no encontrada."));
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo puedes modificar una cita confirmada.");
        }
        if (request.cancel()) {
            appointment.cancel();
        } else {
            if (request.scheduledDateTime() == null || !request.scheduledDateTime().isAfter(LocalDateTime.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica una fecha futura.");
            }
            appointment.confirm(request.scheduledDateTime(), cleanNotes(request.doctorNotes()));
        }
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse cancelMyRequest(Long appointmentId) {
        Long patientId = CurrentUser.getId();
        getActiveUser(patientId, Role.PATIENT);

        Appointment appointment = appointmentRepository
                .findByIdAndPatient_User_Id(appointmentId, patientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró tu solicitud de cita"
                ));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo puedes cancelar solicitudes que estén pendientes"
            );
        }

        appointment.cancel();
        return toResponse(appointmentRepository.save(appointment));
    }

    private AppUser getActiveUser(Long userId, Role expectedRole) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                ));

        if (user.getRole() != expectedRole
                || user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para realizar esta acción"
            );
        }

        return user;
    }

    private String cleanNotes(String notes) {
        if (notes == null || notes.isBlank()) {
            return null;
        }
        return notes.trim();
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        PatientProfile patient = appointment.getPatient();
        AppUser patientUser = patient.getUser();
        AppUser doctor = appointment.getDoctor();

        return new AppointmentResponse(
                appointment.getId(),
                patientUser.getId(),
                patientUser.getFullName(),
                doctor.getId(),
                doctor.getFullName(),
                appointment.getRequestedDateTime(),
                appointment.getScheduledDateTime(),
                appointment.getReason(),
                appointment.getDoctorNotes(),
                appointment.getStatus(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }
}