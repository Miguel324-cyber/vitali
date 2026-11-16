package com.example.backend_vitali.appointment;

import com.example.backend_vitali.patient.PatientProfile;
import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_profile_id", nullable = false)
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private AppUser doctor;

    @Column(name = "requested_date_time")
    private LocalDateTime requestedDateTime;

    @Column(name = "scheduled_date_time")
    private LocalDateTime scheduledDateTime;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(length = 2000)
    private String doctorNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Appointment() {
    }

    public Appointment(
            PatientProfile patient,
            AppUser doctor,
            LocalDateTime requestedDateTime,
            String reason
    ) {
        this.patient = patient;
        this.doctor = doctor;
        this.requestedDateTime = requestedDateTime;
        this.reason = reason;
        this.status = AppointmentStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public PatientProfile getPatient() {
        return patient;
    }

    public AppUser getDoctor() {
        return doctor;
    }

    public LocalDateTime getRequestedDateTime() {
        return requestedDateTime;
    }

    public LocalDateTime getScheduledDateTime() {
        return scheduledDateTime;
    }

    public String getReason() {
        return reason;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void confirm(
            LocalDateTime scheduledDateTime,
            String doctorNotes
    ) {
        this.scheduledDateTime = scheduledDateTime;
        this.doctorNotes = doctorNotes;
        this.status = AppointmentStatus.CONFIRMED;
    }

    public void reject(String doctorNotes) {
        this.doctorNotes = doctorNotes;
        this.status = AppointmentStatus.REJECTED;
    }

    public void cancel() {
        this.status = AppointmentStatus.CANCELLED;
    }

    public void complete() {
        this.status = AppointmentStatus.COMPLETED;
    }
}