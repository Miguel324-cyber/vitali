package com.example.backend_vitali.admin;

import com.example.backend_vitali.admin.AdminCrudDtos.*;
import com.example.backend_vitali.audit.AuditService;
import com.example.backend_vitali.family.FamilyLink;
import com.example.backend_vitali.family.FamilyLinkRepository;
import com.example.backend_vitali.family.FamilyProfile;
import com.example.backend_vitali.family.FamilyRepository;
import com.example.backend_vitali.patient.PatientProfile;
import com.example.backend_vitali.patient.PatientRepository;
import com.example.backend_vitali.security.CurrentUser;
import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * CRUD administrativo de pacientes, familiares, vínculos, recetas y
 * catálogo de medicamentos.
 */
@Service
@PreAuthorize("hasRole('ADMIN')")
public class AdminCrudService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final FamilyRepository familyRepository;
    private final FamilyLinkRepository linkRepository;
    private final AuditService auditService;
    private final JdbcTemplate jdbc;
    private final com.example.backend_vitali.doctor.DoctorCapacityService doctorCapacity;

    public AdminCrudService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            FamilyRepository familyRepository,
            FamilyLinkRepository linkRepository,
            AuditService auditService,
            JdbcTemplate jdbc,
            com.example.backend_vitali.doctor.DoctorCapacityService doctorCapacity
    ) {
        this.doctorCapacity = doctorCapacity;
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.familyRepository = familyRepository;
        this.linkRepository = linkRepository;
        this.auditService = auditService;
        this.jdbc = jdbc;
    }

    // =====================================================
    // PACIENTES
    // =====================================================

    @Transactional(readOnly = true)
    public List<AdminPatientResponse> listPatients(String search) {
        String term = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);

        // Vínculos y perfiles se cargan una vez (antes se repetía por cada paciente: N+1).
        List<FamilyLink> links = validLinks();
        Map<Long, PatientProfile> profiles = new java.util.HashMap<>();
        patientRepository.findAll().forEach(p -> profiles.put(p.getUser().getId(), p));

        return userRepository.findByRole(Role.PATIENT).stream()
                .filter(u -> term.isEmpty()
                        || u.getFullName().toLowerCase(Locale.ROOT).contains(term)
                        || u.getEmail().toLowerCase(Locale.ROOT).contains(term))
                .sorted(AppUser.NEWEST_FIRST)
                .map(u -> toPatientResponse(u, profiles.get(u.getId()), links))
                .toList();
    }

    /** Vínculos cuyo paciente y familiar siguen existiendo. */
    private List<FamilyLink> validLinks() {
        return linkRepository.findAll().stream().filter(this::isLinkValid).toList();
    }

    @Transactional(readOnly = true)
    public AdminPatientResponse getPatient(Long userId) {
        return toPatientResponse(requireUser(userId, Role.PATIENT));
    }

    @Transactional
    public AdminPatientResponse updatePatient(Long userId, AdminPatientUpdateRequest r) {
        AppUser user = requireUser(userId, Role.PATIENT);
        applyBasicUserFields(user, r.fullName(), r.email(), r.status());
        userRepository.save(user);

        PatientProfile profile = patientRepository.findByUserId(userId)
                .orElseGet(() -> new PatientProfile(user));

        profile.updateProfile(
                r.birthDate(),
                blankToNull(r.phone()),
                profile.getAvatarUrl(),
                blankToNull(r.documentType()),
                blankToNull(r.documentNumber()),
                r.weight(),
                r.height(),
                blankToNull(r.conditions()),
                blankToNull(r.medications())
        );
        profile.setBloodType(blankToNull(r.bloodType()));

        if (r.assignedDoctorId() == null) {
            profile.setAssignedDoctor(null);
        } else {
            AppUser doctor = userRepository.findById(r.assignedDoctorId())
                    .filter(d -> d.getRole() == Role.DOCTOR && d.getStatus() == AccountStatus.ACTIVE)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST, "Médico no disponible."));
            doctorCapacity.assertCanAccept(doctor,
                    profile.getAssignedDoctor() == null ? null : profile.getAssignedDoctor().getId());
            profile.setAssignedDoctor(doctor);
        }

        patientRepository.save(profile);
        auditService.record(CurrentUser.getId(), "ADMIN_PATIENT_UPDATED", "PATIENT", userId, "SUCCESS");
        return toPatientResponse(user);
    }

    private AdminPatientResponse toPatientResponse(AppUser user) {
        return toPatientResponse(user, patientRepository.findByUserId(user.getId()).orElse(null), validLinks());
    }

    private AdminPatientResponse toPatientResponse(AppUser user, PatientProfile p, List<FamilyLink> links) {
        AppUser doctor = p == null ? null : p.getAssignedDoctor();

        List<AdminFamilyRef> families = links.stream()
                .filter(l -> l.getPatient().getId().equals(user.getId()))
                .map(l -> new AdminFamilyRef(
                        l.getId(), l.getFamily().getId(), l.getFamily().getFullName(),
                        l.getRelationship(), l.isActive()))
                .toList();

        return new AdminPatientResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getStatus(),
                p == null ? null : p.getBirthDate(),
                p == null ? null : p.getPhone(),
                p == null ? null : p.getDocumentType(),
                p == null ? null : p.getDocumentNumber(),
                p == null ? null : p.getBloodType(),
                p == null ? null : p.getWeight(),
                p == null ? null : p.getHeight(),
                p == null ? null : p.getConditions(),
                p == null ? null : p.getMedications(),
                doctor == null ? null : doctor.getId(),
                doctor == null ? null : doctor.getFullName(),
                families
        );
    }

    // =====================================================
    // FAMILIARES
    // =====================================================

    @Transactional(readOnly = true)
    public List<AdminFamilyResponse> listFamilies(String search) {
        String term = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);

        List<FamilyLink> links = validLinks();
        Map<Long, FamilyProfile> profiles = new java.util.HashMap<>();
        familyRepository.findAll().forEach(p -> profiles.put(p.getUser().getId(), p));

        return userRepository.findByRole(Role.FAMILY).stream()
                .filter(u -> term.isEmpty()
                        || u.getFullName().toLowerCase(Locale.ROOT).contains(term)
                        || u.getEmail().toLowerCase(Locale.ROOT).contains(term))
                .sorted(AppUser.NEWEST_FIRST)
                .map(u -> toFamilyResponse(u, profiles.get(u.getId()), links))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminFamilyResponse getFamily(Long userId) {
        return toFamilyResponse(requireUser(userId, Role.FAMILY));
    }

    @Transactional
    public AdminFamilyResponse updateFamily(Long userId, AdminFamilyUpdateRequest r) {
        AppUser user = requireUser(userId, Role.FAMILY);
        applyBasicUserFields(user, r.fullName(), r.email(), r.status());
        userRepository.save(user);

        FamilyProfile profile = familyRepository.findByUserId(userId)
                .orElseGet(() -> new FamilyProfile(user));
        profile.updatePhone(r.phone());
        familyRepository.save(profile);

        auditService.record(CurrentUser.getId(), "ADMIN_FAMILY_UPDATED", "FAMILY", userId, "SUCCESS");
        return toFamilyResponse(user);
    }

    private AdminFamilyResponse toFamilyResponse(AppUser user) {
        return toFamilyResponse(user, familyRepository.findByUserId(user.getId()).orElse(null), validLinks());
    }

    private AdminFamilyResponse toFamilyResponse(AppUser user, FamilyProfile profile, List<FamilyLink> links) {
        List<AdminPatientRef> patients = links.stream()
                .filter(l -> l.getFamily().getId().equals(user.getId()))
                .map(l -> new AdminPatientRef(
                        l.getId(), l.getPatient().getId(), l.getPatient().getFullName(),
                        l.getRelationship(), l.isActive()))
                .toList();

        return new AdminFamilyResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getStatus(),
                profile == null ? null : profile.getPhone(),
                patients
        );
    }

    // =====================================================
    // VÍNCULOS FAMILIAR ↔ PACIENTE
    // =====================================================

    @Transactional
    public void createLink(AdminLinkCreateRequest r) {
        if (r.patientId() == null || r.familyId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Indica el paciente y el familiar.");
        }

        AppUser patient = requireUser(r.patientId(), Role.PATIENT);
        AppUser family = requireUser(r.familyId(), Role.FAMILY);

        FamilyLink link = linkRepository
                .findByPatientIdAndFamilyId(patient.getId(), family.getId())
                .orElse(null);

        if (link != null && link.isActive()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ese paciente y ese familiar ya están vinculados.");
        }

        assertFamilyHasNoOtherActiveLink(family.getId(), link == null ? null : link.getId());

        if (link == null) {
            link = new FamilyLink(patient, family);
        } else {
            link.reactivate();
        }

        link.updateRelationship(r.relationship(), r.relationshipDetails());
        linkRepository.save(link);

        auditService.record(CurrentUser.getId(), "ADMIN_LINK_CREATED", "FAMILY_LINK", link.getId(), "SUCCESS");
    }

    @Transactional
    public void updateLink(Long linkId, AdminLinkUpdateRequest r) {
        FamilyLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vínculo no encontrado."));

        if (r.relationship() != null || r.relationshipDetails() != null) {
            link.updateRelationship(
                    r.relationship() != null ? r.relationship() : link.getRelationship(),
                    r.relationshipDetails() != null ? r.relationshipDetails() : link.getRelationshipDetails());
        }

        if (r.active() != null && r.active() != link.isActive()) {
            if (r.active()) {
                assertFamilyHasNoOtherActiveLink(link.getFamily().getId(), link.getId());
                link.reactivate();
            } else {
                link.revoke();
            }
        }

        linkRepository.save(link);
        auditService.record(CurrentUser.getId(), "ADMIN_LINK_UPDATED", "FAMILY_LINK", linkId, "SUCCESS");
    }

    @Transactional
    public void deleteLink(Long linkId) {
        if (!linkRepository.existsById(linkId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vínculo no encontrado.");
        }
        linkRepository.deleteById(linkId);
        auditService.record(CurrentUser.getId(), "ADMIN_LINK_DELETED", "FAMILY_LINK", linkId, "SUCCESS");
    }

    private void assertFamilyHasNoOtherActiveLink(Long familyId, Long ignoreLinkId) {
        linkRepository.findFirstByFamilyIdAndActiveTrue(familyId).ifPresent(other -> {
            if (ignoreLinkId == null || !other.getId().equals(ignoreLinkId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El familiar ya tiene un paciente activo vinculado.");
            }
        });
    }

    // =====================================================
    // RECETAS (receta / detalle_receta)
    // =====================================================

    @Transactional(readOnly = true)
    public List<AdminRecipeResponse> listRecipes(Long patientId) {
        String sql = """
            SELECT r.id AS rid, r.id_paciente, r.fecha_subida, r.estado_analisis,
                   u.full_name AS patient_name,
                   d.id AS did, d.nombre_medicamento, d.dosis_indicada, d.presentacion_id,
                   d.unidades_por_dia, d.unidad_consumo, d.indicacion, d.dias_tratamiento
            FROM receta r
            LEFT JOIN users u ON u.id = r.id_paciente
            LEFT JOIN detalle_receta d ON d.id_receta = r.id
            """ + (patientId == null ? "" : " WHERE r.id_paciente = ? ")
                + " ORDER BY r.id DESC, d.id";

        List<Map<String, Object>> rows = patientId == null
                ? jdbc.queryForList(sql)
                : jdbc.queryForList(sql, patientId);

        Map<Long, AdminRecipeResponse> byId = new LinkedHashMap<>();
        Map<Long, List<AdminRecipeItem>> itemsById = new LinkedHashMap<>();

        for (Map<String, Object> row : rows) {
            Long rid = toLong(row.get("rid"));
            if (!byId.containsKey(rid)) {
                List<AdminRecipeItem> items = new ArrayList<>();
                itemsById.put(rid, items);
                byId.put(rid, new AdminRecipeResponse(
                        rid, toLong(row.get("id_paciente")), (String) row.get("patient_name"),
                        (String) row.get("fecha_subida"), (String) row.get("estado_analisis"), items));
            }
            if (row.get("did") != null) {
                itemsById.get(rid).add(new AdminRecipeItem(
                        toLong(row.get("did")),
                        (String) row.get("nombre_medicamento"),
                        (String) row.get("dosis_indicada"),
                        toLong(row.get("presentacion_id")),
                        toDouble(row.get("unidades_por_dia")),
                        (String) row.get("unidad_consumo"),
                        (String) row.get("indicacion"),
                        toInt(row.get("dias_tratamiento"))));
            }
        }
        return new ArrayList<>(byId.values());
    }

    @Transactional
    public void updateRecipe(Long recipeId, AdminRecipeUpdateRequest r) {
        if (r.status() == null || r.status().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica el estado de la receta.");
        }
        int n = jdbc.update("UPDATE receta SET estado_analisis = ? WHERE id = ?", r.status().trim(), recipeId);
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receta no encontrada.");
        }
        auditService.record(CurrentUser.getId(), "ADMIN_RECIPE_UPDATED", "RECIPE", recipeId, "SUCCESS");
    }

    @Transactional
    public void deleteRecipe(Long recipeId) {
        // Las consultas médicas pueden referenciar la receta.
        jdbc.update("UPDATE consulta_medica SET id_receta = NULL WHERE id_receta = ?", recipeId);
        jdbc.update("UPDATE receta_documento SET id_receta = NULL WHERE id_receta = ?", recipeId);
        jdbc.update("DELETE FROM detalle_receta WHERE id_receta = ?", recipeId);
        int n = jdbc.update("DELETE FROM receta WHERE id = ?", recipeId);
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Receta no encontrada.");
        }
        auditService.record(CurrentUser.getId(), "ADMIN_RECIPE_DELETED", "RECIPE", recipeId, "SUCCESS");
    }

    @Transactional
    public void updateRecipeItem(Long itemId, AdminRecipeItemUpdateRequest r) {
        if (r.unitsPerDay() != null && r.unitsPerDay() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Las unidades por día deben ser mayores que 0.");
        }
        if (r.treatmentDays() != null && r.treatmentDays() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Los días de tratamiento deben ser mayores que 0.");
        }
        int n = jdbc.update("""
            UPDATE detalle_receta
               SET nombre_medicamento = COALESCE(?, nombre_medicamento),
                   dosis_indicada = ?,
                   unidades_por_dia = COALESCE(?, unidades_por_dia),
                   unidad_consumo = COALESCE(?, unidad_consumo),
                   indicacion = ?,
                   dias_tratamiento = COALESCE(?, dias_tratamiento)
             WHERE id = ?
            """,
                blankToNull(r.medicine()), blankToNull(r.indicatedDose()), r.unitsPerDay(),
                blankToNull(r.consumptionUnit()), blankToNull(r.indication()), r.treatmentDays(), itemId);
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento de la receta no encontrado.");
        }
        auditService.record(CurrentUser.getId(), "ADMIN_RECIPE_ITEM_UPDATED", "RECIPE_ITEM", itemId, "SUCCESS");
    }

    @Transactional
    public void deleteRecipeItem(Long itemId) {
        int n = jdbc.update("DELETE FROM detalle_receta WHERE id = ?", itemId);
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento de la receta no encontrado.");
        }
        auditService.record(CurrentUser.getId(), "ADMIN_RECIPE_ITEM_DELETED", "RECIPE_ITEM", itemId, "SUCCESS");
    }

    // =====================================================
    // CATÁLOGO DE MEDICAMENTOS (alertas_medicamentos)
    // =====================================================

    @Transactional(readOnly = true)
    public List<AdminMedicationResponse> listMedications(String search) {
        String base = """
            SELECT medicamento, active_ingredient, purpose, dosage_and_administration,
                   warnings, contraindications, drug_interactions, dosage_form, route
              FROM alertas_medicamentos
            """;

        List<Map<String, Object>> rows;

        if (search == null || search.isBlank()) {
            rows = jdbc.queryForList(base + " ORDER BY medicamento");
        } else {
            String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            rows = jdbc.queryForList(
                    base + " WHERE LOWER(medicamento) LIKE ? OR LOWER(COALESCE(active_ingredient, '')) LIKE ?"
                            + " ORDER BY medicamento",
                    like, like);
        }

        return rows.stream().map(this::toMedication).toList();
    }

    @Transactional
    public AdminMedicationResponse createMedication(AdminMedicationRequest r) {
        String name = r.name() == null ? "" : r.name().trim();
        if (name.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del medicamento es obligatorio.");
        }
        Integer exists = jdbc.queryForObject(
                "SELECT COUNT(*) FROM alertas_medicamentos WHERE medicamento = ?", Integer.class, name);
        if (exists != null && exists > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un medicamento con ese nombre.");
        }
        jdbc.update("""
            INSERT INTO alertas_medicamentos
            (medicamento, active_ingredient, purpose, dosage_and_administration, warnings,
             contraindications, drug_interactions, dosage_form, route)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, name, blankToNull(r.activeIngredient()), blankToNull(r.purpose()),
                blankToNull(r.dosageAndAdministration()), blankToNull(r.warnings()),
                blankToNull(r.contraindications()), blankToNull(r.drugInteractions()),
                blankToNull(r.dosageForm()), blankToNull(r.route()));
        auditService.record(CurrentUser.getId(), "ADMIN_MEDICATION_CREATED", "MEDICATION", null, "SUCCESS");
        return new AdminMedicationResponse(name, blankToNull(r.activeIngredient()), blankToNull(r.purpose()),
                blankToNull(r.dosageAndAdministration()), blankToNull(r.warnings()),
                blankToNull(r.contraindications()), blankToNull(r.drugInteractions()),
                blankToNull(r.dosageForm()), blankToNull(r.route()));
    }

    @Transactional
    public void updateMedication(String name, AdminMedicationRequest r) {
        int n = jdbc.update("""
            UPDATE alertas_medicamentos
               SET active_ingredient = ?, purpose = ?, dosage_and_administration = ?, warnings = ?,
                   contraindications = ?, drug_interactions = ?, dosage_form = ?, route = ?
             WHERE medicamento = ?
            """, blankToNull(r.activeIngredient()), blankToNull(r.purpose()),
                blankToNull(r.dosageAndAdministration()), blankToNull(r.warnings()),
                blankToNull(r.contraindications()), blankToNull(r.drugInteractions()),
                blankToNull(r.dosageForm()), blankToNull(r.route()), name);
        if (n == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento no encontrado.");
        }
        auditService.record(CurrentUser.getId(), "ADMIN_MEDICATION_UPDATED", "MEDICATION", null, "SUCCESS");
    }

    @Transactional
    public void deleteMedication(String name) {
        Integer exists = jdbc.queryForObject(
                "SELECT COUNT(*) FROM alertas_medicamentos WHERE medicamento = ?", Integer.class, name);
        if (exists == null || exists == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Medicamento no encontrado.");
        }
        // Las recetas conservan el nombre; solo se suelta la presentación.
        jdbc.update("""
            UPDATE detalle_receta SET presentacion_id = NULL
             WHERE presentacion_id IN (SELECT id FROM presentaciones_medicamento WHERE medicamento = ?)
            """, name);
        jdbc.update("DELETE FROM presentaciones_medicamento WHERE medicamento = ?", name);
        jdbc.update("DELETE FROM reglas_dosis WHERE medicamento = ?", name);
        jdbc.update("DELETE FROM alertas_medicamentos WHERE medicamento = ?", name);
        auditService.record(CurrentUser.getId(), "ADMIN_MEDICATION_DELETED", "MEDICATION", null, "SUCCESS");
    }

    private AdminMedicationResponse toMedication(Map<String, Object> m) {
        return new AdminMedicationResponse(
                (String) m.get("medicamento"), (String) m.get("active_ingredient"),
                (String) m.get("purpose"), (String) m.get("dosage_and_administration"),
                (String) m.get("warnings"), (String) m.get("contraindications"),
                (String) m.get("drug_interactions"), (String) m.get("dosage_form"),
                (String) m.get("route"));
    }

    // =====================================================
    // Utilidades
    // =====================================================

    private AppUser requireUser(Long userId, Role role) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
        if (user.getRole() != role) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El usuario indicado no tiene el rol esperado (" + role.name() + ").");
        }
        return user;
    }

    private void applyBasicUserFields(AppUser user, String fullName, String email, AccountStatus status) {
        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }
        if (email != null && !email.isBlank()) {
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            if (!normalized.equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmailIgnoreCase(normalized)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado.");
            }
            user.setEmail(normalized);
        }
        if (status != null) {
            user.setStatus(status);
        }
    }

    /** Ignora vínculos huérfanos (con un usuario que ya fue eliminado). */
    private boolean isLinkValid(FamilyLink link) {
        try {
            link.getPatient().getFullName();
            link.getFamily().getFullName();
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static Long toLong(Object o) {
        return o instanceof Number n ? n.longValue() : null;
    }

    private static Double toDouble(Object o) {
        return o instanceof Number n ? n.doubleValue() : null;
    }

    private static Integer toInt(Object o) {
        return o instanceof Number n ? n.intValue() : null;
    }
}
