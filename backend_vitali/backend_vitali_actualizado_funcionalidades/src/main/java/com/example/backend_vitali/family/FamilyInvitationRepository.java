package com.example.backend_vitali.family;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface FamilyInvitationRepository
        extends JpaRepository<FamilyInvitation, Long> {

    Optional<FamilyInvitation> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT invitation
        FROM FamilyInvitation invitation
        WHERE invitation.tokenHash = :tokenHash
    """)
    Optional<FamilyInvitation> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash
    );

    List<FamilyInvitation>
    findByFamilyEmailIgnoreCaseAndUsedAtIsNull(
            String familyEmail
    );

    List<FamilyInvitation>
    findByFamilyEmailIgnoreCaseAndUsedAtIsNullOrderByCreatedAtDesc(
            String familyEmail
    );
}