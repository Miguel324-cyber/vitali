package com.inventario.backend_vitali.repositories;

import com.inventario.backend_vitali.models.Receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaRepository extends JpaRepository<Receta, Long> {
    // Útil para buscar todas las recetas de un paciente específico
    List<Receta> findByPacienteId(Long pacienteId);
}