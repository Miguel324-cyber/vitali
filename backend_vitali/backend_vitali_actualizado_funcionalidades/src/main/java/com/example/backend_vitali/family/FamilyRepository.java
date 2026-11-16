
package com.example.backend_vitali.family;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyRepository
        extends JpaRepository<FamilyProfile, Long> {

    Optional<FamilyProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
