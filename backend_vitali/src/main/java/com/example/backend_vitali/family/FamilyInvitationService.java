package com.example.backend_vitali.family;

import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;

@Service
public class FamilyInvitationService {

    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final FamilyInvitationRepository invitationRepository;
    private final FamilyLinkRepository linkRepository;
    private final UserRepository userRepository;

    public FamilyInvitationService(
            FamilyInvitationRepository invitationRepository,
            FamilyLinkRepository linkRepository,
            UserRepository userRepository
    ) {
        this.invitationRepository = invitationRepository;
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
    }

    /**
     * ==========================================================
     * CREAR INVITACIÓN
     * ==========================================================
     */
    @Transactional
    public FamilyDtos.FamilyInvitationResponse createInvitation(
            FamilyDtos.CreateFamilyInvitationRequest request
    ) {

        Long patientId = CurrentUser.getId();

        AppUser patient =
                getActiveUser(
                        patientId,
                        Role.PATIENT
                );

        String email = normalizeEmail(
                request.familyEmail()
        );

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes proporcionar el correo del familiar."
            );
        }

        /*
         * El paciente solamente puede tener un familiar activo.
         */
        if (linkRepository.existsByPatientIdAndActiveTrue(
                patientId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya tienes un familiar vinculado. Solo se permite uno."
            );
        }

        /*
         * No puede invitarse a sí mismo.
         */
        if (email.equals(
                normalizeEmail(patient.getEmail())
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No puedes invitar tu propia cuenta."
            );
        }

        /*
         * ======================================================
         * IMPORTANTE
         *
         * Aquí buscamos la CUENTA FAMILY real.
         * Ya no permitimos crear invitaciones para correos
         * que no tengan una cuenta familiar.
         * ======================================================
         */
        AppUser family =
                userRepository
                        .findByEmailIgnoreCaseAndRole(
                                email,
                                Role.FAMILY
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "No existe una cuenta familiar registrada con ese correo."
                                )
                        );

        /*
         * La cuenta familiar debe estar activa.
         */
        if (family.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La cuenta familiar no está activa."
            );
        }

        /*
         * La cuenta familiar no puede tener ya otro paciente
         * vinculado.
         */
        if (linkRepository.existsByFamilyIdAndActiveTrue(
                family.getId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta cuenta familiar ya tiene un paciente vinculado."
            );
        }

        /*
         * Evitamos invitaciones duplicadas pendientes.
         */
        LocalDateTime now = LocalDateTime.now();

        boolean pendingExists =
                invitationRepository
                        .findByFamilyEmailIgnoreCaseAndUsedAtIsNull(
                                email
                        )
                        .stream()
                        .anyMatch(invitation ->
                                invitation.getPatient()
                                        .getId()
                                        .equals(patientId)
                                        &&
                                        invitation.getExpiresAt() != null
                                        &&
                                        invitation.getExpiresAt()
                                                .isAfter(now)
                        );

        if (pendingExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una invitación pendiente para este familiar."
            );
        }

        /*
         * Generamos token seguro.
         */
        String rawToken = generateToken();

        String tokenHash = sha256(rawToken);

        LocalDateTime expiresAt =
                now.plusHours(24);

        FamilyInvitation invitation =
                new FamilyInvitation(
                        patient,
                        email,
                        tokenHash,
                        expiresAt
                );

        invitationRepository.save(invitation);

        /*
         * El token sigue devolviéndose para mantener compatibilidad
         * con el flujo anterior.
         */
        return new FamilyDtos.FamilyInvitationResponse(
                rawToken,
                expiresAt
        );
    }

    /**
     * ==========================================================
     * OBTENER INVITACIONES PENDIENTES DEL FAMILIAR
     * ==========================================================
     */
    @Transactional(readOnly = true)
    public List<FamilyDtos.PendingFamilyInvitationResponse>
    getPendingInvitations() {

        Long familyId = CurrentUser.getId();

        AppUser family =
                getActiveUser(
                        familyId,
                        Role.FAMILY
                );

        String familyEmail =
                normalizeEmail(
                        family.getEmail()
                );

        LocalDateTime now =
                LocalDateTime.now();

        return invitationRepository
                .findByFamilyEmailIgnoreCaseAndUsedAtIsNullOrderByCreatedAtDesc(
                        familyEmail
                )
                .stream()
                .filter(invitation ->
                        invitation.getExpiresAt() != null
                                &&
                                invitation.getExpiresAt()
                                        .isAfter(now)
                )
                .filter(invitation ->
                        invitation.getPatient() != null
                )
                .filter(invitation ->
                        invitation.getPatient()
                                .getRole()
                                == Role.PATIENT
                )
                .filter(invitation ->
                        invitation.getPatient()
                                .getStatus()
                                == AccountStatus.ACTIVE
                )
                .map(invitation -> {

                    AppUser patient =
                            invitation.getPatient();

                    return new FamilyDtos
                            .PendingFamilyInvitationResponse(
                            invitation.getId(),
                            patient.getId(),
                            patient.getFullName(),
                            patient.getEmail(),
                            invitation.getExpiresAt()
                    );
                })
                .toList();
    }

    /**
     * ==========================================================
     * ACEPTAR INVITACIÓN DESDE EL PERFIL FAMILY
     * ==========================================================
     */
    @Transactional
    public FamilyDtos.FamilyLinkResponse acceptPendingInvitation(
            FamilyDtos.AcceptPendingFamilyInvitationRequest request
    ) {

        Long familyId =
                CurrentUser.getId();

        AppUser family =
                getActiveUser(
                        familyId,
                        Role.FAMILY
                );

        if (request == null
                || request.invitationId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes seleccionar una invitación."
            );
        }

        FamilyInvitation invitation =
                invitationRepository
                        .findById(
                                request.invitationId()
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "La invitación no existe."
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * Verificar vigencia.
         */
        if (!invitation.isUsableAt(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La invitación ya fue usada o ha expirado."
            );
        }

        /*
         * Verificar que la invitación pertenece
         * al correo de la cuenta actualmente autenticada.
         */
        if (!normalizeEmail(
                family.getEmail()
        ).equals(
                normalizeEmail(
                        invitation.getFamilyEmail()
                )
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta invitación no pertenece a tu cuenta."
            );
        }

        AppUser patient =
                invitation.getPatient();

        if (patient == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La invitación no tiene un paciente asociado."
            );
        }

        if (patient.getRole() != Role.PATIENT
                ||
                patient.getStatus()
                        != AccountStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta del paciente no está disponible."
            );
        }

        /*
         * Un paciente solamente puede tener un familiar activo.
         */
        if (linkRepository.existsByPatientIdAndActiveTrue(
                patient.getId()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El paciente ya tiene un familiar vinculado."
            );
        }

        /*
         * Una cuenta FAMILY solamente puede tener
         * un paciente activo.
         */
        if (linkRepository.existsByFamilyIdAndActiveTrue(
                familyId
        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta cuenta familiar ya tiene un paciente vinculado."
            );
        }

        String relationship =
                clean(
                        request.relationship()
                );

        if (relationship == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar el parentesco."
            );
        }

        String relationshipDetails =
                clean(
                        request.relationshipDetails()
                );

        FamilyLink link =
                linkRepository
                        .findByPatientIdAndFamilyId(
                                patient.getId(),
                                familyId
                        )
                        .orElse(null);

        if (link != null) {

            if (link.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Ya existe un vínculo activo con este paciente."
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El vínculo fue revocado anteriormente. Se requiere un flujo de reautorización."
            );
        }

        link =
                new FamilyLink(
                        patient,
                        family
                );

        link.updateRelationship(
                relationship,
                relationshipDetails
        );

        /*
         * Marcamos la invitación como utilizada.
         */
        invitation.markUsed(now);

        link =
                linkRepository.save(link);

        return new FamilyDtos.FamilyLinkResponse(
                link.getId(),
                patient.getId(),
                family.getId(),
                link.isActive(),
                link.getCreatedAt(),
                link.getRelationship(),
                link.getRelationshipDetails()
        );
    }

    /**
     * ==========================================================
     * FLUJO ANTIGUO POR TOKEN
     * ==========================================================
     *
     * Se conserva para no romper el frontend anterior.
     */
    @Transactional
    public FamilyDtos.FamilyLinkResponse acceptInvitation(
            FamilyDtos.AcceptFamilyInvitationRequest request
    ) {

        Long familyId =
                CurrentUser.getId();

        AppUser family =
                getActiveUser(
                        familyId,
                        Role.FAMILY
                );

        String rawToken =
                request.token();

        if (rawToken == null
                || rawToken.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes proporcionar el token de invitación."
            );
        }

        String tokenHash =
                sha256(
                        rawToken.trim()
                );

        FamilyInvitation invitation =
                invitationRepository
                        .findByTokenHashForUpdate(
                                tokenHash
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "La invitación no es válida o ha expirado."
                                )
                        );

        LocalDateTime now =
                LocalDateTime.now();

        if (!invitation.isUsableAt(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La invitación no es válida o ha expirado."
            );
        }

        if (!normalizeEmail(
                family.getEmail()
        ).equals(
                normalizeEmail(
                        invitation.getFamilyEmail()
                )
        )) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La invitación fue emitida para otra cuenta."
            );
        }

        AppUser patient =
                invitation.getPatient();

        if (patient.getRole() != Role.PATIENT
                ||
                patient.getStatus()
                        != AccountStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta del paciente no está disponible."
            );
        }

        if (linkRepository.existsByPatientIdAndActiveTrue(
                patient.getId()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El paciente ya tiene un familiar vinculado."
            );
        }

        if (linkRepository.existsByFamilyIdAndActiveTrue(
                familyId
        )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta cuenta familiar ya tiene un paciente vinculado."
            );
        }

        String relationship =
                clean(
                        request.relationship()
                );

        if (relationship == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes indicar el parentesco."
            );
        }

        FamilyLink link =
                new FamilyLink(
                        patient,
                        family
                );

        link.updateRelationship(
                relationship,
                clean(
                        request.relationshipDetails()
                )
        );

        invitation.markUsed(now);

        link =
                linkRepository.save(link);

        return new FamilyDtos.FamilyLinkResponse(
                link.getId(),
                patient.getId(),
                family.getId(),
                link.isActive(),
                link.getCreatedAt(),
                link.getRelationship(),
                link.getRelationshipDetails()
        );
    }

    /**
     * ==========================================================
     * USUARIO ACTIVO
     * ==========================================================
     */
    private AppUser getActiveUser(
            Long userId,
            Role expectedRole
    ) {

        AppUser user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new AccessDeniedException(
                                        "No se encontró el usuario autenticado."
                                )
                        );

        if (user.getRole()
                != expectedRole) {

            throw new AccessDeniedException(
                    "No tienes permiso para realizar esta operación."
            );
        }

        if (user.getStatus()
                != AccountStatus.ACTIVE) {

            throw new AccessDeniedException(
                    "La cuenta no está activa."
            );
        }

        return user;
    }

    /**
     * ==========================================================
     * NORMALIZAR EMAIL
     * ==========================================================
     */
    private String normalizeEmail(
            String email
    ) {

        if (email == null) {
            return null;
        }

        String normalized =
                email
                        .trim()
                        .toLowerCase(Locale.ROOT);

        return normalized.isBlank()
                ? null
                : normalized;
    }

    /**
     * ==========================================================
     * GENERAR TOKEN
     * ==========================================================
     */
    private String generateToken() {

        byte[] bytes =
                new byte[32];

        SECURE_RANDOM.nextBytes(bytes);

        return HexFormat
                .of()
                .formatHex(bytes);
    }

    /**
     * ==========================================================
     * SHA-256
     * ==========================================================
     */
    private String sha256(
            String value
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat
                    .of()
                    .formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 no está disponible.",
                    exception
            );
        }
    }

    /**
     * ==========================================================
     * LIMPIAR TEXTO
     * ==========================================================
     */
    private String clean(
            String value
    ) {

        if (value == null) {
            return null;
        }

        String cleaned =
                value.trim();

        return cleaned.isEmpty()
                ? null
                : cleaned;
    }
}