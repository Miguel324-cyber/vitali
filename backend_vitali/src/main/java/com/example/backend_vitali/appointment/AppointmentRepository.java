package com.example.backend_vitali.appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_User_IdOrderByCreatedAtDesc(
            Long userId
    );

    List<Appointment> findByDoctor_IdOrderByCreatedAtDesc(
            Long doctorId
    );

    Optional<Appointment> findByIdAndPatient_User_Id(
            Long appointmentId,
            Long userId
    );

    Optional<Appointment> findByIdAndDoctor_Id(
            Long appointmentId,
            Long doctorId
    );
}