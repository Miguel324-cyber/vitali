package com.example.backend_vitali.family;

import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "family_links",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_family_link_patient_family",
                columnNames = {
                        "patient_user_id",
                        "family_user_id"
                }
        ),
        indexes = {
                @Index(
                        name = "idx_family_links_patient",
                        columnList = "patient_user_id"
                ),
                @Index(
                        name = "idx_family_links_family",
                        columnList = "family_user_id"
                )
        }
)
public class FamilyLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "patient_user_id",
            nullable = false
    )
    private AppUser patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "family_user_id",
            nullable = false
    )
    private AppUser family;

    @Column(nullable = false)
    private boolean active = true;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(
            name = "relationship",
            length = 60
    )
    private String relationship;

    @Column(
            name = "relationship_details",
            length = 500
    )
    private String relationshipDetails;

    protected FamilyLink() {
    }

    public FamilyLink(
            AppUser patient,
            AppUser family
    ) {
        this.patient = patient;
        this.family = family;
        this.active = true;
    }

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt =
                    LocalDateTime.now();
        }

        if (active) {
            revokedAt = null;
        }
    }

    public void updateRelationship(
            String relationship,
            String relationshipDetails
    ) {

        this.relationship =
                clean(relationship);

        this.relationshipDetails =
                clean(relationshipDetails);
    }

    public void revoke() {

        this.active = false;
        this.revokedAt =
                LocalDateTime.now();
    }

    public void reactivate() {

        this.active = true;
        this.revokedAt = null;
    }

    private String clean(String value) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }

    public Long getId() {
        return id;
    }

    public AppUser getPatient() {
        return patient;
    }

    public AppUser getFamily() {
        return family;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public String getRelationship() {
        return relationship;
    }

    public String getRelationshipDetails() {
        return relationshipDetails;
    }
}