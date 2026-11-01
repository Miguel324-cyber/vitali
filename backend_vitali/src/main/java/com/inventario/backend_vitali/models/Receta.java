package com.inventario.backend_vitali.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "receta")
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Usuario paciente;

    private LocalDateTime fechaSubida;

    private String estadoAnalisis; // "PENDIENTE", "SOBREMEDICADO", "SEGURO"

    public Receta() {}

    @PrePersist
    protected void onCreate() {
        this.fechaSubida = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getPaciente() { return paciente; }
    public void setPaciente(Usuario paciente) { this.paciente = paciente; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }

    public String getEstadoAnalisis() { return estadoAnalisis; }
    public void setEstadoAnalisis(String estadoAnalisis) { this.estadoAnalisis = estadoAnalisis; }
}