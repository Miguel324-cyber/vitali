package com.example.backend_vitali.config;
import com.example.backend_vitali.user.*;
import jakarta.annotation.PostConstruct;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializa datos ficticios en la base de datos cuando está vacía.
 * Crea usuarios de prueba (especialmente el administrador) para desarrollo.
 */
@Component
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void initializeData() {
        // Solo inicializar si no hay usuarios en la base de datos
        if (userRepository.count() == 0) {
            createAdminUser();
            createSampleUsers();
        }
    }

    private void createAdminUser() {
        AppUser admin = new AppUser();
        admin.setFullName("Administrador del Sistema");
        admin.setEmail("admin@vitali.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);

        userRepository.save(admin);
        System.out.println("✅ Usuario administrador creado:");
        System.out.println("   Email: admin@vitali.com");
        System.out.println("   Contraseña: admin123");
    }

    private void createSampleUsers() {
        // Doctor de prueba
        AppUser doctor = new AppUser();
        doctor.setFullName("Dr. Juan Pérez");
        doctor.setEmail("doctor@vitali.com");
        doctor.setPasswordHash(passwordEncoder.encode("doctor123"));
        doctor.setRole(Role.DOCTOR);
        doctor.setStatus(AccountStatus.ACTIVE);
        userRepository.save(doctor);

        // Paciente de prueba
        AppUser patient = new AppUser();
        patient.setFullName("María García");
        patient.setEmail("paciente@vitali.com");
        patient.setPasswordHash(passwordEncoder.encode("paciente123"));
        patient.setRole(Role.PATIENT);
        patient.setStatus(AccountStatus.ACTIVE);
        userRepository.save(patient);

        // Familiar de prueba
        AppUser family = new AppUser();
        family.setFullName("Carlos García");
        family.setEmail("familiar@vitali.com");
        family.setPasswordHash(passwordEncoder.encode("familiar123"));
        family.setRole(Role.FAMILY);
        family.setStatus(AccountStatus.ACTIVE);
        userRepository.save(family);

        System.out.println("✅ Usuarios de prueba creados:");
        System.out.println("   Doctor: doctor@vitali.com / doctor123");
        System.out.println("   Paciente: paciente@vitali.com / paciente123");
        System.out.println("   Familiar: familiar@vitali.com / familiar123");
    }
}
