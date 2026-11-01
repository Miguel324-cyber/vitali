package com.inventario.backend_vitali.repositories;

import com.inventario.backend_vitali.models.DetalleReceta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleRecetaRepository extends JpaRepository<DetalleReceta, Long> {
    // Para obtener los medicamentos de una receta específica
    List<DetalleReceta> findByRecetaId(Long recetaId);
}