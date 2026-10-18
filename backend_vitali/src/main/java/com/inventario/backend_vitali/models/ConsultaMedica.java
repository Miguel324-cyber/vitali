package com.inventario.backend_vitali.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consulta_medica")
public class ConsultaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_paciente", nullable = false)
    private Usuario paciente;

    @ManyToOne
    @JoinColumn(name = "id_medico")
    private Usuario medico;

    @ManyToOne
    @JoinColumn(name = "id_receta")
    private Receta receta;

    @Column(length = 1000)
    private String mensajeDuda;

    @Column(length = 1000)
    private String respuestaMedico;

    private String estado; // "PENDIENTE", "ATENDIDA"

    private LocalDateTime fechaConsulta;

    public ConsultaMedica() {}

    @PrePersist
    protected void onCreate() {
        this.fechaConsulta = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getPaciente() { return paciente; }
    public void setPaciente(Usuario paciente) { this.paciente = paciente; }

    public Usuario getMedico() { return medico; }
    public void setMedico(Usuario medico) { this.medico = medico; }

    public Receta getReceta() { return receta; }
    public void setReceta(Receta receta) { this.receta = receta; }

    public String getMensajeDuda() { return mensajeDuda; }
    public void setMensajeDuda(String mensajeDuda) { this.mensajeDuda = mensajeDuda; }

    public String getRespuestaMedico() { return respuestaMedico; }
    public void setRespuestaMedico(String respuestaMedico) { this.respuestaMedico = respuestaMedico; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFechaConsulta() { return fechaConsulta; }
    public void setFechaConsulta(LocalDateTime fechaConsulta) { this.fechaConsulta = fechaConsulta; }
}