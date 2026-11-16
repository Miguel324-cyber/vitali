
package com.example.backend_vitali.auth;

import com.example.backend_vitali.auth.AuthDtos.LoginRequest;
import com.example.backend_vitali.auth.AuthDtos.LoginResponse;
import com.example.backend_vitali.auth.AuthDtos.RegisterDoctorRequest;
import com.example.backend_vitali.auth.AuthDtos.RegisterFamilyRequest;
import com.example.backend_vitali.auth.AuthDtos.RegisterPatientRequest;
import com.example.backend_vitali.auth.AuthDtos.UserResponse;
import com.example.backend_vitali.doctor.DoctorSpecialtyCatalog;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/specialties")
    public List<String> specialties() { return DoctorSpecialtyCatalog.SPECIALTIES; }

    @PostMapping("/register/patient")
    public ResponseEntity<UserResponse> registerPatient(
            @Valid @RequestBody RegisterPatientRequest request) {

        UserResponse response = authService.registerPatient(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<UserResponse> registerDoctor(
            @Valid @RequestBody RegisterDoctorRequest request) {

        UserResponse response = authService.registerDoctor(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/family")
    public ResponseEntity<UserResponse> registerFamily(
            @Valid @RequestBody RegisterFamilyRequest request) {

        UserResponse response = authService.registerFamily(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    /** Renueva el token de la sesión actual (requiere un token vigente). */
    @PostMapping("/refresh")
    public LoginResponse refresh() {
        return authService.refresh(com.example.backend_vitali.security.CurrentUser.getId());
    }
}
