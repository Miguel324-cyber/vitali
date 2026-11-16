
package com.example.backend_vitali.patient;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository
        extends JpaRepository<PatientProfile, Long> {

    Optional<PatientProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    java.util.List<PatientProfile> findByAssignedDoctor_Id(Long doctorId);
}
