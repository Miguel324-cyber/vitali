package com.example.backend_vitali.family;

import com.example.backend_vitali.family.FamilyDtos.PatientFamilyLinkResponse;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FamilyLinkService {

    private final FamilyLinkRepository linkRepository;
    private final UserRepository userRepository;

    public FamilyLinkService(
            FamilyLinkRepository linkRepository,
            UserRepository userRepository
    ) {
        this.linkRepository =
                linkRepository;

        this.userRepository =
                userRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientFamilyLinkResponse>
    listMyFamilyLinks() {

        Long patientId =
                CurrentUser.getId();

        getActiveUser(
                patientId,
                Role.PATIENT
        );

        return linkRepository
                .findByPatientIdAndActiveTrue(
                        patientId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void revokeMyFamilyLink(
            Long linkId
    ) {

        Long patientId =
                CurrentUser.getId();

        getActiveUser(
                patientId,
                Role.PATIENT
        );

        FamilyLink link =
                linkRepository
                        .findByIdAndPatientId(
                                linkId,
                                patientId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "No se encontró el vínculo solicitado."
                                )
                        );

        if (!link.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El vínculo ya está revocado."
            );
        }

        link.revoke();

        linkRepository.save(link);
    }

    private AppUser getActiveUser(
            Long userId,
            Role requiredRole
    ) {

        AppUser user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "No se encontró la cuenta."
                                )
                        );

        if (user.getRole()
                != requiredRole) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para realizar esta operación."
            );
        }

        if (user.getStatus()
                != AccountStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta no está activa."
            );
        }

        return user;
    }

    private PatientFamilyLinkResponse
    toResponse(FamilyLink link) {

        AppUser family =
                link.getFamily();

        return new PatientFamilyLinkResponse(
                link.getId(),
                family.getId(),
                family.getFullName(),
                family.getEmail(),
                link.isActive(),
                link.getCreatedAt(),
                link.getRevokedAt(),
                link.getRelationship(),
                link.getRelationshipDetails()
        );
    }
}