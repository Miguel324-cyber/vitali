
package com.example.backend_vitali.doctor;

import com.example.backend_vitali.user.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUserId(Long userId);

    boolean existsByProfessionalRegistrationIgnoreCase(
            String professionalRegistration
    );

    List<DoctorProfile> findByUser_Status(AccountStatus status);
}
