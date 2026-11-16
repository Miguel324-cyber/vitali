package com.example.backend_vitali.medication;

import com.example.backend_vitali.security.CurrentUser;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Tratamientos asignados por el médico, análisis de medicamentos del paciente
 * y documentos de receta (foto / PDF) subidos por el paciente.
 */
@RestController
@RequestMapping("/api")
public class TreatmentController {

    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "application/pdf");
    private static final int MAX_BYTES = 5 * 1024 * 1024;
    private static final Set<String> DOCTOR_STATUSES = Set.of("REVISADA_POR_MEDICO", "FINALIZADA", "SUSPENDIDA", "ASIGNADA_POR_MEDICO");

    private final JdbcTemplate jdbc;
    private final PatientAccessGuard guard;
    private final MedicationAnalysisService analysis;

    public TreatmentController(JdbcTemplate jdbc, PatientAccessGuard guard, MedicationAnalysisService analysis) {
        this.jdbc = jdbc;
        this.guard = guard;
        this.analysis = analysis;
    }

    public record TreatmentItem(Long presentationId, String indicatedDose, Double unitsPerDay,
                                String consumptionUnit, String indication, Integer treatmentDays) {}
    public record TreatmentRequest(List<TreatmentItem> items) {}
    public record StatusRequest(String estado) {}
    public record DetectRequest(String text) {}
    public record DocumentRequest(String fileName, String contentType, String dataBase64, String text) {}

    // ---------------- Análisis ----------------

    @GetMapping("/recetas/analisis/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','FAMILY')")
    public Map<String, Object> analizar(@PathVariable Long patientId) {
        guard.check(patientId);
        return analysis.analyze(patientId);
    }

    @PostMapping("/recetas/detectar")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    public Map<String, Object> detectar(@RequestBody DetectRequest request) {
        String text = request == null ? null : request.text();
        if (text == null || text.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Escribe o extrae el texto de la receta.");
        if (text.length() > 20000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El texto de la receta es demasiado largo.");
        return Map.of("suggestions", analysis.detect(text));
    }

    // ---------------- Tratamientos del médico ----------------

    @PostMapping("/doctors/patients/{patientId}/recetas")
    @PreAuthorize("hasRole('DOCTOR')")
    @Transactional
    public Map<String, Object> asignarTratamiento(@PathVariable Long patientId, @RequestBody TreatmentRequest request) {
        Long doctorId = CurrentUser.getId();
        if (!guard.isAssignedDoctor(doctorId, patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El paciente no está asignado a este médico.");
        }
        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Agrega al menos un medicamento al tratamiento.");
        }
        for (TreatmentItem i : request.items()) validateItem(i);

        jdbc.update("INSERT INTO receta(id_paciente, fecha_subida, estado_analisis, id_medico) VALUES (?, ?, 'ASIGNADA_POR_MEDICO', ?)",
                patientId, LocalDateTime.now().toString(), doctorId);
        Long recipeId = jdbc.queryForObject("SELECT last_insert_rowid()", Long.class);
        insertItems(recipeId, request.items());
        return Map.of("recetaId", recipeId, "estado", "ASIGNADA_POR_MEDICO", "mensaje", "Tratamiento asignado al paciente.");
    }

    @PatchMapping("/doctors/recetas/{recipeId}/estado")
    @PreAuthorize("hasRole('DOCTOR')")
    public Map<String, Object> cambiarEstado(@PathVariable Long recipeId, @RequestBody StatusRequest request) {
        String estado = request == null || request.estado() == null ? "" : request.estado().trim();
        if (!DOCTOR_STATUSES.contains(estado)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no válido.");
        Long patientId = jdbc.queryForList("SELECT id_paciente FROM receta WHERE id = ?", Long.class, recipeId)
                .stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receta no encontrada."));
        if (!guard.isAssignedDoctor(CurrentUser.getId(), patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "El paciente no está asignado a este médico.");
        }
        jdbc.update("UPDATE receta SET estado_analisis = ? WHERE id = ?", estado, recipeId);
        return Map.of("recetaId", recipeId, "estado", estado);
    }

    // ---------------- Documentos de receta ----------------

    @PostMapping("/recetas/documentos")
    @PreAuthorize("hasRole('PATIENT')")
    public Map<String, Object> subirDocumento(@RequestBody DocumentRequest request) {
        if (request == null || request.dataBase64() == null || request.dataBase64().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecciona la foto o el PDF de tu receta.");
        }
        String type = request.contentType() == null ? "" : request.contentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_TYPES.contains(type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato no admitido. Usa JPG, PNG, WEBP o PDF.");
        }
        String b64 = request.dataBase64().contains(",") ? request.dataBase64().substring(request.dataBase64().indexOf(',') + 1) : request.dataBase64();
        byte[] bytes;
        try { bytes = Base64.getDecoder().decode(b64); }
        catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está dañado."); }
        if (bytes.length > MAX_BYTES) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo supera 5 MB.");

        String name = request.fileName() == null || request.fileName().isBlank() ? "receta" : request.fileName().trim();
        if (name.length() > 200) name = name.substring(0, 200);
        String text = request.text() == null ? null : request.text().trim();
        if (text != null && text.length() > 20000) text = text.substring(0, 20000);

        jdbc.update("""
            INSERT INTO receta_documento (id_paciente, nombre_archivo, tipo_contenido, tamano_bytes, contenido_base64, texto_extraido, fecha_subida)
            VALUES (?, ?, ?, ?, ?, ?, ?)""", CurrentUser.getId(), name, type, bytes.length, b64, text, LocalDateTime.now().toString());
        Long id = jdbc.queryForObject("SELECT last_insert_rowid()", Long.class);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("documentId", id);
        out.put("suggestions", text == null || text.isBlank() ? List.of() : analysis.detect(text));
        return out;
    }

    @GetMapping("/recetas/documentos/paciente/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','FAMILY')")
    public List<Map<String, Object>> documentos(@PathVariable Long patientId) {
        guard.check(patientId);
        return jdbc.queryForList("""
            SELECT id, id_receta, nombre_archivo, tipo_contenido, tamano_bytes, texto_extraido, fecha_subida
              FROM receta_documento WHERE id_paciente = ? ORDER BY id DESC""", patientId);
    }

    @GetMapping("/recetas/documentos/{documentId}/archivo")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','FAMILY')")
    public ResponseEntity<byte[]> archivo(@PathVariable Long documentId) {
        Map<String, Object> doc = jdbc.queryForList(
                "SELECT id_paciente, nombre_archivo, tipo_contenido, contenido_base64 FROM receta_documento WHERE id = ?", documentId)
                .stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento no encontrado."));
        guard.check(((Number) doc.get("id_paciente")).longValue());
        byte[] bytes = Base64.getDecoder().decode((String) doc.get("contenido_base64"));
        String safeName = String.valueOf(doc.get("nombre_archivo")).replaceAll("[\\r\\n\"]", "_");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType((String) doc.get("tipo_contenido")))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + safeName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(bytes);
    }

    // ---------------- Utilidades ----------------

    private void validateItem(TreatmentItem i) {
        if (i == null || i.presentationId() == null || i.unitsPerDay() == null || i.unitsPerDay() <= 0
                || i.treatmentDays() == null || i.treatmentDays() <= 0
                || i.consumptionUnit() == null || i.consumptionUnit().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cada medicamento requiere presentación, unidades por día, unidad y duración válidas.");
        }
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM presentaciones_medicamento WHERE id = ?", Integer.class, i.presentationId());
        if (exists == null || exists == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La presentación indicada no existe.");
    }

    private void insertItems(Long recipeId, List<TreatmentItem> items) {
        for (TreatmentItem i : items) {
            String medicine = jdbc.queryForObject("SELECT medicamento FROM presentaciones_medicamento WHERE id = ?", String.class, i.presentationId());
            jdbc.update("""
                INSERT INTO detalle_receta (id_receta, nombre_medicamento, dosis_indicada, presentacion_id,
                                            unidades_por_dia, unidad_consumo, indicacion, dias_tratamiento)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    recipeId, medicine, blank(i.indicatedDose()), i.presentationId(), i.unitsPerDay(),
                    i.consumptionUnit().trim(), blank(i.indication()), i.treatmentDays());
        }
    }

    private static String blank(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
