package com.example.backend_vitali.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    // Buscar un usuario por correo electrónico.
    boolean existsByEmail(String email);

    Optional<AppUser> findByEmail(String email);

    // Buscar por correo ignorando mayúsculas y minúsculas.
    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    // Buscar usuario por correo y rol.
    Optional<AppUser> findByEmailIgnoreCaseAndRole(
            String email,
            Role role
    );

    // Consultar usuarios por rol.
    List<AppUser> findByRole(Role role);

    // Consultar usuarios por estado de cuenta.
    List<AppUser> findByStatus(AccountStatus status);

    // Consultar usuarios por rol y estado.
    List<AppUser> findByRoleAndStatus(
            Role role,
            AccountStatus status
    );

    // Contar usuarios por rol y estado.
    long countByRoleAndStatus(
            Role role,
            AccountStatus status
    );

    // Contar usuarios por estado.
    long countByStatus(AccountStatus status);
}