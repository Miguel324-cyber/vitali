package com.example.backend_vitali.family;

import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "family_profiles",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_family_profiles_user",
                columnNames = "user_id"
        )
)
public class FamilyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private AppUser user;

    @Column(length = 30)
    private String phone;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Convert(converter = SqliteLocalDateTimeConverter.class)
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    protected FamilyProfile() {
    }

    public FamilyProfile(AppUser user) {
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void updatePhone(String phone) {
        if (phone == null) {
            this.phone = null;
            return;
        }

        String cleaned = phone.trim();
        this.phone = cleaned.isEmpty() ? null : cleaned;
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}