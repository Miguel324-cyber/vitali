package com.inventario.backend_vitali.models;

import jakarta.persistence.*;

@Entity
@Table(name = "alertas_medicamentos")
public class AlertaMedicamento {

    @Id
    private String medicamento;

    @Column(name = "active_ingredient")
    private String activeIngredient;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "dosage_and_administration", columnDefinition = "TEXT")
    private String dosageAndAdministration;

    @Column(columnDefinition = "TEXT")
    private String overdosage;

    @Column(name = "drug_interactions", columnDefinition = "TEXT")
    private String drugInteractions;

    @Column(columnDefinition = "TEXT")
    private String warnings;

    public AlertaMedicamento() {}

    // Getters y Setters
    public String getMedicamento() { return medicamento; }
    public void setMedicamento(String medicamento) { this.medicamento = medicamento; }

    public String getActiveIngredient() { return activeIngredient; }
    public void setActiveIngredient(String activeIngredient) { this.activeIngredient = activeIngredient; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getDosageAndAdministration() { return dosageAndAdministration; }
    public void setDosageAndAdministration(String dosageAndAdministration) { this.dosageAndAdministration = dosageAndAdministration; }

    public String getOverdosage() { return overdosage; }
    public void setOverdosage(String overdosage) { this.overdosage = overdosage; }

    public String getDrugInteractions() { return drugInteractions; }
    public void setDrugInteractions(String drugInteractions) { this.drugInteractions = drugInteractions; }

    public String getWarnings() { return warnings; }
    public void setWarnings(String warnings) { this.warnings = warnings; }
}