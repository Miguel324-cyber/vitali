package com.example.backend_vitali.family;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyLinkRepository
        extends JpaRepository<FamilyLink, Long> {

    boolean existsByPatientIdAndActiveTrue(Long patientId);

    boolean existsByFamilyIdAndActiveTrue(Long familyId);

    Optional<FamilyLink> findByPatientIdAndFamilyId(
            Long patientId,
            Long familyId
    );

    Optional<FamilyLink> findByIdAndPatientId(
            Long linkId,
            Long patientId
    );

    List<FamilyLink> findByPatientIdAndActiveTrue(
            Long patientId
    );

    List<FamilyLink> findByFamilyIdAndActiveTrue(
            Long familyId
    );

    /*
     * El familiar solamente puede tener un paciente
     * activo, según la regla del sistema.
     */
    Optional<FamilyLink> findFirstByFamilyIdAndActiveTrue(
            Long familyId
    );
}