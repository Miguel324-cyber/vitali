package com.example.backend_vitali.patient;

import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_profiles")
public class PatientProfile {

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

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 30)
    private String phone;

    // --- NUEVOS CAMPOS PARA EL PERFIL COMPLETO ---

    @Column(name = "avatar_url", length = 1000000) // Soporta URLs o imágenes en Base64
    private String avatarUrl;

    @Column(name = "document_type", length = 20)
    private String documentType; // CC, TI, CE, PASSPORT

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    @Column(name = "blood_type", length = 10)
    private String bloodType; // O+, A+, etc.

    @Column(name = "weight")
    private Double weight; // En kilogramos

    @Column(name = "height")
    private Double height; // En centímetros

    @Column(name = "conditions", length = 2000)
    private String conditions; // Enfermedades o condiciones médicas

    @Column(name = "medications", length = 2000)
    private String medications; // Medicamentos actuales

    // Opcional: Relación con el doctor asignado (si AppUser representa también a los doctores)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_doctor_id")
    private AppUser assignedDoctor;

    // ----------------------------------------------

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected PatientProfile() {
    }

    public PatientProfile(AppUser user) {
        this.user = user;
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

    // --- GETTERS ---

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getPhone() {
        return phone;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getDocumentType() {
        return documentType;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public String getBloodType() {
        return bloodType;
    }

    public Double getWeight() {
        return weight;
    }

    public Double getHeight() {
        return height;
    }

    public String getConditions() {
        return conditions;
    }

    public String getMedications() {
        return medications;
    }

    public AppUser getAssignedDoctor() {
        return assignedDoctor;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // --- MÉTODOS DE ACTUALIZACIÓN COMPLETA ---

    public void updateProfile(
            LocalDate birthDate,
            String phone,
            String avatarUrl,
            String documentType,
            String documentNumber,
            Double weight,
            Double height,
            String conditions,
            String medications
    ) {
        this.birthDate = birthDate;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.weight = weight;
        this.height = height;
        this.conditions = conditions;
        this.medications = medications;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public void setAssignedDoctor(AppUser assignedDoctor) {
        this.assignedDoctor = assignedDoctor;
    }
}