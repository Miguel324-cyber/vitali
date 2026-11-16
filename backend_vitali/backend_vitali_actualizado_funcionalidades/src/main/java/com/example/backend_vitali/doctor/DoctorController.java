
package com.example.backend_vitali.doctor;

import com.example.backend_vitali.doctor.DoctorDtos.DoctorProfileResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @GetMapping("/me")
    public DoctorProfileResponse getMyProfile() {
        return doctorService.getMyProfile();
    }

    @GetMapping("/patients")
    public java.util.List<java.util.Map<String, Object>> getMyPatients() {
        return doctorService.getMyPatients();
    }

    @GetMapping("/patients/{patientId}")
    public java.util.Map<String,Object> getPatientDetails(@PathVariable Long patientId) {
        return doctorService.getPatientDetails(patientId);
    }
}
