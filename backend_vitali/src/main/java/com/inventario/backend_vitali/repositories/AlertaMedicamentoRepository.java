package com.inventario.backend_vitali.repositories;

import com.inventario.backend_vitali.models.AlertaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlertaMedicamentoRepository extends JpaRepository<AlertaMedicamento, String> {
    // Al extender JpaRepository ya tenemos métodos como findById, findAll, etc.
}