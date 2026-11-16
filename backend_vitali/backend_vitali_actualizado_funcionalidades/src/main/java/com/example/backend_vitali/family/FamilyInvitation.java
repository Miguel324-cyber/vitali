package com.example.backend_vitali.family;

import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "family_invitations",
        indexes = {
                @Index(
                        name = "idx_family_invitation_token_hash",
                        columnList = "token_hash",
                        unique = true
                ),
                @Index(
                        name = "idx_family_invitation_patient",
                        columnList = "patient_user_id"
                ),
                @Index(
                        name = "idx_family_invitation_family_email",
                        columnList = "family_email"
                )
        }
)
public class FamilyInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "patient_user_id",
            nullable = false
    )
    private AppUser patient;

    /*
     * Se mantiene como correo porque esta columna ya existe
     * en la base de datos actual.
     */
    @Column(
            name = "family_email",
            nullable = false,
            length = 254
    )
    private String familyEmail;

    @Column(
            name = "token_hash",
            nullable = false,
            unique = true,
            length = 64
    )
    private String tokenHash;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    private LocalDateTime usedAt;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected FamilyInvitation() {
    }

    public FamilyInvitation(
            AppUser patient,
            String familyEmail,
            String tokenHash,
            LocalDateTime expiresAt
    ) {
        this.patient = patient;
        this.familyEmail = normalizeEmail(familyEmail);
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        familyEmail = normalizeEmail(familyEmail);
    }

    public boolean isUsableAt(LocalDateTime now) {
        return usedAt == null
                && expiresAt != null
                && expiresAt.isAfter(now);
    }

    public void markUsed(LocalDateTime now) {
        if (!isUsableAt(now)) {
            throw new IllegalStateException(
                    "La invitación ya fue usada o ha expirado."
            );
        }

        this.usedAt = now;
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        return email
                .trim()
                .toLowerCase(java.util.Locale.ROOT);
    }

    public Long getId() {
        return id;
    }

    public AppUser getPatient() {
        return patient;
    }

    public String getFamilyEmail() {
        return familyEmail;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}