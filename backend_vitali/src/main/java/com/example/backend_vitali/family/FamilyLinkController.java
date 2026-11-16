package com.example.backend_vitali.family;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@PreAuthorize("hasRole('PATIENT')")
public class FamilyLinkController {

    private final FamilyLinkService familyLinkService;

    public FamilyLinkController(
            FamilyLinkService familyLinkService
    ) {
        this.familyLinkService = familyLinkService;
    }

    /*
     * Ruta que utiliza el frontend actual.
     */
    @GetMapping({
            "/me/family-links",
            "/family-links"
    })
    public List<FamilyDtos.PatientFamilyLinkResponse>
    listMyFamilyLinks() {

        return familyLinkService.listMyFamilyLinks();
    }

    /*
     * También soportamos:
     * DELETE /api/patients/me/family-links/{linkId}
     *
     * y la ruta anterior:
     * DELETE /api/patients/family-links/{linkId}
     */
    @DeleteMapping({
            "/me/family-links/{linkId}",
            "/family-links/{linkId}"
    })
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeFamilyLink(
            @PathVariable Long linkId
    ) {

        familyLinkService.revokeMyFamilyLink(linkId);
    }
}