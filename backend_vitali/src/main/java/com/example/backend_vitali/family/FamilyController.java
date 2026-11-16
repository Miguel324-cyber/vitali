package com.example.backend_vitali.family;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family")
@PreAuthorize("hasRole('FAMILY')")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @GetMapping("/me")
    public FamilyProfile getMyProfile() {
        return familyService.getMyProfile();
    }

    @PutMapping("/me")
    public FamilyProfile updateMyProfile(
            @Valid @RequestBody
            FamilyDtos.UpdateFamilyProfileRequest request
    ) {
        return familyService.updateMyProfile(request);
    }

    @GetMapping("/patient")
    public FamilyDtos.FamilyPatientResponse getLinkedPatient() {
        return familyService.getLinkedPatient();
    }
}