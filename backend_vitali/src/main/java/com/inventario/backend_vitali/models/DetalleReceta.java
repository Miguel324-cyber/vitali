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

    @Column(name = "presentacion_id")
    private Long presentacionId;

    @Column(name = "unidades_por_dia")
    private Double unidadesPorDia;

    @Column(name = "administraciones_por_dia")
    private Double administracionesPorDia;

    @Column(name = "unidad_consumo")
    private String unidadConsumo;

    private String indicacion;

    @Column(name = "dias_tratamiento")
    private Integer diasTratamiento;

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

    public Long getPresentacionId() { return presentacionId; }
    public void setPresentacionId(Long presentacionId) { this.presentacionId = presentacionId; }
    public Double getUnidadesPorDia() { return unidadesPorDia; }
    public void setUnidadesPorDia(Double unidadesPorDia) { this.unidadesPorDia = unidadesPorDia; }
    public Double getAdministracionesPorDia() { return administracionesPorDia; }
    public void setAdministracionesPorDia(Double administracionesPorDia) { this.administracionesPorDia = administracionesPorDia; }
    public String getUnidadConsumo() { return unidadConsumo; }
    public void setUnidadConsumo(String unidadConsumo) { this.unidadConsumo = unidadConsumo; }
    public String getIndicacion() { return indicacion; }
    public void setIndicacion(String indicacion) { this.indicacion = indicacion; }
    public Integer getDiasTratamiento() { return diasTratamiento; }
    public void setDiasTratamiento(Integer diasTratamiento) { this.diasTratamiento = diasTratamiento; }
}
