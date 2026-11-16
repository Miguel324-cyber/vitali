
package com.example.backend_vitali.patient;

import com.example.backend_vitali.patient.PatientDtos.PatientProfileResponse;
import com.example.backend_vitali.patient.PatientDtos.UpdatePatientProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponse> getProfile() {
        return ResponseEntity.ok(patientService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientProfileResponse> updateProfile(
            @Valid @RequestBody UpdatePatientProfileRequest request
    ) {
        return ResponseEntity.ok(
                patientService.updateMyProfile(request)
        );
    }
}
