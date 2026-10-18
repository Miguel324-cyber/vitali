package com.inventario.backend_vitali.repositories;

import com.inventario.backend_vitali.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Busca si ya existe alguien con la misma cédula
    Optional<Usuario> findByCedula(String cedula);
}