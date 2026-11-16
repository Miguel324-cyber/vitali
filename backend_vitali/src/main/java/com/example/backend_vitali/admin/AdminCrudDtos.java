package com.example.backend_vitali.admin;

import com.example.backend_vitali.user.AccountStatus;

import java.time.LocalDate;
import java.util.List;

public final class AdminCrudDtos {

    private AdminCrudDtos() {
    }

    // ---------------- Pacientes ----------------

    public record AdminPatientResponse(
            Long userId,
            String fullName,
            String email,
            AccountStatus status,
            LocalDate birthDate,
            String phone,
            String documentType,
            String documentNumber,
            String bloodType,
            Double weight,
            Double height,
            String conditions,
            String medications,
            Long assignedDoctorId,
            String assignedDoctorName,
            List<AdminFamilyRef> families
    ) {
    }

    public record AdminFamilyRef(
            Long linkId,
            Long familyId,
            String familyName,
            String relationship,
            boolean active
    ) {
    }

    public record AdminPatientUpdateRequest(
            String fullName,
            String email,
            AccountStatus status,
            LocalDate birthDate,
            String phone,
            String documentType,
            String documentNumber,
            String bloodType,
            Double weight,
            Double height,
            String conditions,
            String medications,
            Long assignedDoctorId
    ) {
    }

    // ---------------- Familiares ----------------

    public record AdminFamilyResponse(
            Long userId,
            String fullName,
            String email,
            AccountStatus status,
            String phone,
            List<AdminPatientRef> patients
    ) {
    }

    public record AdminPatientRef(
            Long linkId,
            Long patientId,
            String patientName,
            String relationship,
            boolean active
    ) {
    }

    public record AdminFamilyUpdateRequest(
            String fullName,
            String email,
            AccountStatus status,
            String phone
    ) {
    }

    // ---------------- Vínculos ----------------

    public record AdminLinkCreateRequest(
            Long patientId,
            Long familyId,
            String relationship,
            String relationshipDetails
    ) {
    }

    public record AdminLinkUpdateRequest(
            String relationship,
            String relationshipDetails,
            Boolean active
    ) {
    }

    // ---------------- Recetas ----------------

    public record AdminRecipeItem(
            Long id,
            String medicine,
            String indicatedDose,
            Long presentationId,
            Double unitsPerDay,
            String consumptionUnit,
            String indication,
            Integer treatmentDays
    ) {
    }

    public record AdminRecipeResponse(
            Long id,
            Long patientId,
            String patientName,
            String uploadedAt,
            String status,
            List<AdminRecipeItem> items
    ) {
    }

    public record AdminRecipeUpdateRequest(String status) {
    }

    public record AdminRecipeItemUpdateRequest(
            String medicine,
            String indicatedDose,
            Double unitsPerDay,
            String consumptionUnit,
            String indication,
            Integer treatmentDays
    ) {
    }

    // ---------------- Catálogo de medicamentos ----------------

    public record AdminMedicationResponse(
            String name,
            String activeIngredient,
            String purpose,
            String dosageAndAdministration,
            String warnings,
            String contraindications,
            String drugInteractions,
            String dosageForm,
            String route
    ) {
    }

    public record AdminMedicationRequest(
            String name,
            String activeIngredient,
            String purpose,
            String dosageAndAdministration,
            String warnings,
            String contraindications,
            String drugInteractions,
            String dosageForm,
            String route
    ) {
    }
}
