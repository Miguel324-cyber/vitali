
package com.example.backend_vitali.doctor;

import com.example.backend_vitali.user.AppUser;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(
    name = "doctor_profiles",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_doctor_professional_registration",
            columnNames = "professional_registration"
        )
    }
)
public class DoctorProfile {

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

    @Column(
        name = "professional_registration",
        nullable = false,
        length = 80
    )
    private String professionalRegistration;

    @Column(nullable = false, length = 120)
    private String specialty;

    @Column(name = "document_type", length = 20) private String documentType;
    @Column(name = "document_number", length = 50) private String documentNumber;
    @Column(length = 30) private String phone;
    @Column(name = "birth_date")
    @Convert(converter = com.example.backend_vitali.common.SqliteLocalDateConverter.class)
    private LocalDate birthDate;
    @Column(length = 180) private String university;
    @Column(name = "graduation_year") private Integer graduationYear;
    @Column(name = "years_experience") private Integer yearsExperience;
    @Column(name = "consultation_mode", length = 40) private String consultationMode;
    @Column(name = "professional_bio", length = 1200) private String professionalBio;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    protected DoctorProfile() {
    }

    public DoctorProfile(
            AppUser user,
            String professionalRegistration,
            String specialty,
            String documentType, String documentNumber, String phone, LocalDate birthDate,
            String university, Integer graduationYear, Integer yearsExperience,
            String consultationMode, String professionalBio) {
        this.user = user;
        this.professionalRegistration = professionalRegistration;
        this.specialty = specialty;
        this.documentType = documentType; this.documentNumber = documentNumber; this.phone = phone;
        this.birthDate = birthDate; this.university = university; this.graduationYear = graduationYear;
        this.yearsExperience = yearsExperience; this.consultationMode = consultationMode;
        this.professionalBio = professionalBio;
    }

    public Long getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public String getProfessionalRegistration() {
        return professionalRegistration;
    }

    public String getSpecialty() { return specialty; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public String getPhone() { return phone; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getUniversity() { return university; }
    public Integer getGraduationYear() { return graduationYear; }
    public Integer getYearsExperience() { return yearsExperience; }
    public String getConsultationMode() { return consultationMode; }
    public String getProfessionalBio() { return professionalBio; }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public Long getReviewedBy() {
        return reviewedBy;
    }

    public void markReviewed(Long administratorId) {
        this.reviewedBy = administratorId;
        this.reviewedAt = LocalDateTime.now();
    }
}
