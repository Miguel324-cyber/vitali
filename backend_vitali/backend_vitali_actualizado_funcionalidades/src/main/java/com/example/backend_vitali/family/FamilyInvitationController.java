package com.example.backend_vitali.family;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-invitations")
public class FamilyInvitationController {

    private final FamilyInvitationService invitationService;

    public FamilyInvitationController(
            FamilyInvitationService invitationService
    ) {
        this.invitationService =
                invitationService;
    }

    /**
     * Paciente crea invitación.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    public FamilyDtos.FamilyInvitationResponse createInvitation(
            @Valid
            @RequestBody
            FamilyDtos.CreateFamilyInvitationRequest request
    ) {

        return invitationService.createInvitation(
                request
        );
    }

    /**
     * Flujo anterior por token.
     */
    @PostMapping("/accept")
    @PreAuthorize("hasRole('FAMILY')")
    public FamilyDtos.FamilyLinkResponse acceptInvitation(
            @Valid
            @RequestBody
            FamilyDtos.AcceptFamilyInvitationRequest request
    ) {

        return invitationService.acceptInvitation(
                request
        );
    }

    /**
     * ==========================================================
     * NUEVO FLUJO
     * ==========================================================
     *
     * La cuenta FAMILY obtiene automáticamente
     * las invitaciones dirigidas a su correo.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('FAMILY')")
    public List<FamilyDtos.PendingFamilyInvitationResponse>
    getPendingInvitations() {

        return invitationService
                .getPendingInvitations();
    }

    /**
     * La cuenta FAMILY acepta una invitación
     * directamente desde su perfil.
     */
    @PostMapping("/accept-pending")
    @PreAuthorize("hasRole('FAMILY')")
    public FamilyDtos.FamilyLinkResponse
    acceptPendingInvitation(
            @Valid
            @RequestBody
            FamilyDtos.AcceptPendingFamilyInvitationRequest request
    ) {

        return invitationService
                .acceptPendingInvitation(request);
    }
}