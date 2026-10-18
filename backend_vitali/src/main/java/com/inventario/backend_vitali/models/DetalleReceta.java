package com.inventario.backend_vitali.models;

import jakarta.persistence.*;

@Entity
@Table(name = "detalle_receta")
public class DetalleReceta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_receta", nullable = false)
    private Receta receta;

    private String nombreMedicamento;

    private String dosisIndicada;

    public DetalleReceta() {}

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Receta getReceta() { return receta; }
    public void setReceta(Receta receta) { this.receta = receta; }

    public String getNombreMedicamento() { return nombreMedicamento; }
    public void setNombreMedicamento(String nombreMedicamento) { this.nombreMedicamento = nombreMedicamento; }

    public String getDosisIndicada() { return dosisIndicada; }
    public void setDosisIndicada(String dosisIndicada) { this.dosisIndicada = dosisIndicada; }
}