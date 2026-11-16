package com.example.backend_vitali.auth;

import com.example.backend_vitali.auth.AuthDtos.LoginRequest;
import com.example.backend_vitali.auth.AuthDtos.LoginResponse;
import com.example.backend_vitali.auth.AuthDtos.RegisterDoctorRequest;
import com.example.backend_vitali.auth.AuthDtos.RegisterFamilyRequest;
import com.example.backend_vitali.auth.AuthDtos.RegisterPatientRequest;
import com.example.backend_vitali.auth.AuthDtos.UserResponse;
import com.example.backend_vitali.doctor.DoctorProfile;
import com.example.backend_vitali.doctor.DoctorRepository;
import com.example.backend_vitali.doctor.DoctorSpecialtyCatalog;
import com.example.backend_vitali.family.FamilyProfile;
import com.example.backend_vitali.family.FamilyRepository;
import com.example.backend_vitali.patient.PatientProfile;
import com.example.backend_vitali.patient.PatientRepository;
import com.example.backend_vitali.security.JwtService;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;

    public AuthService(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            FamilyRepository familyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthMapper authMapper
    ) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.familyRepository = familyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authMapper = authMapper;
    }

    /**
     * Registro de pacientes.
     * Guarda la cuenta y llena la información médica del perfil del paciente.
     */
    @Transactional
    public UserResponse registerPatient(RegisterPatientRequest request) {

        AppUser user = createUser(
                request.fullName(),
                request.email(),
                request.password(),
                Role.PATIENT,
                AccountStatus.ACTIVE
        );

        PatientProfile profile = new PatientProfile(user);

        // Limpiar el teléfono si viene vacío
        String phone = request.phone();
        if (phone != null) {
            phone = phone.trim();
            if (phone.isEmpty()) {
                phone = null;
            }
        }

        // Se pasan los nuevos campos desde el request del registro
        profile.updateProfile(
                request.birthDate(),
                phone,
                null, // avatarUrl arranca nulo
                request.documentType(),
                request.documentNumber(),
                request.weight(),
                request.height(),
                request.conditions(),
                request.medications()
        );

        patientRepository.save(profile);

        return authMapper.toUserResponse(user);
    }

    /**
     * Registro de familiares.
     */
    @Transactional
    public UserResponse registerFamily(RegisterFamilyRequest request) {

        AppUser user = createUser(
                request.fullName(),
                request.email(),
                request.password(),
                Role.FAMILY,
                AccountStatus.ACTIVE
        );

        FamilyProfile profile = new FamilyProfile(user);
        familyRepository.save(profile);

        return authMapper.toUserResponse(user);
    }

    /**
     * Registro de médicos.
     * La cuenta queda pendiente de aprobación administrativa.
     */
    @Transactional
    public UserResponse registerDoctor(RegisterDoctorRequest request) {

        if (!DoctorSpecialtyCatalog.SPECIALTIES.contains(request.specialty().trim())) {
            throw new IllegalArgumentException("Selecciona una especialidad válida del catálogo.");
        }
        String registration = request.professionalRegistration().trim();

        if (doctorRepository
                .existsByProfessionalRegistrationIgnoreCase(registration)) {
            throw new IllegalArgumentException(
                    "El registro profesional ya está asociado a una cuenta."
            );
        }

        AppUser user = createUser(
                request.fullName(),
                request.email(),
                request.password(),
                Role.DOCTOR,
                AccountStatus.PENDING
        );

        DoctorProfile profile = new DoctorProfile(
                user,
                registration, request.specialty().trim(), request.documentType().trim(),
                request.documentNumber().trim(), request.phone().trim(), request.birthDate(),
                request.university().trim(), request.graduationYear(), request.yearsExperience(),
                "VIRTUAL", request.professionalBio()
        );

        doctorRepository.save(profile);

        return authMapper.toUserResponse(user);
    }

    /**
     * Inicio de sesión.
     * Sin @Transactional a propósito: la verificación BCrypt tarda ~100 ms y,
     * con un pool de una sola conexión (SQLite), retenerla bloqueaba al resto
     * de requests mientras tanto.
     */
    public LoginResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        AppUser user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Correo o contraseña incorrectos."
                        )
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new BadCredentialsException(
                    "Correo o contraseña incorrectos."
            );
        }

        if (user.getStatus() != AccountStatus.ACTIVE) {
            String message = switch (user.getStatus()) {
                case PENDING -> "Tu cuenta está pendiente de aprobación por un administrador.";
                case REJECTED -> "La solicitud de tu cuenta fue rechazada por un administrador.";
                case SUSPENDED -> "Tu cuenta está suspendida. Contacta al administrador.";
                case ACTIVE -> "";
            };
            throw new BadCredentialsException(message);
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                authMapper.toUserResponse(user)
        );
    }

    /**
     * Emite un token nuevo para el usuario autenticado (sesión deslizante).
     * El frontend lo llama solo mientras hay actividad; si el usuario fue
     * desactivado entretanto, ya no se renueva.
     */
    public LoginResponse refresh(Long userId) {
        AppUser user = userRepository.findById(userId)
                .filter(u -> u.getStatus() == AccountStatus.ACTIVE)
                .orElseThrow(() -> new BadCredentialsException("La sesión ya no es válida. Inicia sesión de nuevo."));
        return new LoginResponse(jwtService.generateToken(user), authMapper.toUserResponse(user));
    }

    /**
     * Crea una cuenta con correo normalizado y contraseña cifrada.
     */
    private AppUser createUser(
            String fullName,
            String email,
            String rawPassword,
            Role role,
            AccountStatus status
    ) {
        String normalizedEmail = normalizeEmail(email);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Ya existe una cuenta con ese correo electrónico."
            );
        }

        AppUser user = new AppUser(
                fullName.trim(),
                normalizedEmail,
                passwordEncoder.encode(rawPassword),
                role,
                status
        );

        return userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "El correo electrónico es obligatorio."
            );
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
