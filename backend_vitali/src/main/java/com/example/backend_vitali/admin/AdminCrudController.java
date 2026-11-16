package com.example.backend_vitali.admin;

import com.example.backend_vitali.admin.AdminCrudDtos.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CRUD del administrador: pacientes, familiares, vínculos,
 * recetas y catálogo de medicamentos.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCrudController {

    private final AdminCrudService service;

    public AdminCrudController(AdminCrudService service) {
        this.service = service;
    }

    // ---------- Pacientes ----------
    @GetMapping("/patients")
    public List<AdminPatientResponse> patients(@RequestParam(required = false) String search) {
        return service.listPatients(search);
    }

    @GetMapping("/patients/{userId}")
    public AdminPatientResponse patient(@PathVariable Long userId) {
        return service.getPatient(userId);
    }

    @PutMapping("/patients/{userId}")
    public AdminPatientResponse updatePatient(@PathVariable Long userId,
                                              @RequestBody AdminPatientUpdateRequest request) {
        return service.updatePatient(userId, request);
    }

    // ---------- Familiares ----------
    @GetMapping("/families")
    public List<AdminFamilyResponse> families(@RequestParam(required = false) String search) {
        return service.listFamilies(search);
    }

    @GetMapping("/families/{userId}")
    public AdminFamilyResponse family(@PathVariable Long userId) {
        return service.getFamily(userId);
    }

    @PutMapping("/families/{userId}")
    public AdminFamilyResponse updateFamily(@PathVariable Long userId,
                                            @RequestBody AdminFamilyUpdateRequest request) {
        return service.updateFamily(userId, request);
    }

    // ---------- Vínculos (GET /links ya existe en AdminController) ----------
    @PostMapping("/links")
    public ResponseEntity<Void> createLink(@RequestBody AdminLinkCreateRequest request) {
        service.createLink(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/links/{id}")
    public ResponseEntity<Void> updateLink(@PathVariable Long id,
                                           @RequestBody AdminLinkUpdateRequest request) {
        service.updateLink(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/links/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        service.deleteLink(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Recetas ----------
    @GetMapping("/recipes")
    public List<AdminRecipeResponse> recipes(@RequestParam(required = false) Long patientId) {
        return service.listRecipes(patientId);
    }

    @PutMapping("/recipes/{id}")
    public ResponseEntity<Void> updateRecipe(@PathVariable Long id,
                                             @RequestBody AdminRecipeUpdateRequest request) {
        service.updateRecipe(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        service.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/recipe-items/{id}")
    public ResponseEntity<Void> updateRecipeItem(@PathVariable Long id,
                                                 @RequestBody AdminRecipeItemUpdateRequest request) {
        service.updateRecipeItem(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/recipe-items/{id}")
    public ResponseEntity<Void> deleteRecipeItem(@PathVariable Long id) {
        service.deleteRecipeItem(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Catálogo de medicamentos (el nombre va como parámetro) ----------
    @GetMapping("/medications")
    public List<AdminMedicationResponse> medications(@RequestParam(required = false) String search) {
        return service.listMedications(search);
    }

    @PostMapping("/medications")
    public ResponseEntity<AdminMedicationResponse> createMedication(@RequestBody AdminMedicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMedication(request));
    }

    @PutMapping("/medications")
    public ResponseEntity<Void> updateMedication(@RequestParam String name,
                                                 @RequestBody AdminMedicationRequest request) {
        service.updateMedication(name, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/medications")
    public ResponseEntity<Void> deleteMedication(@RequestParam String name) {
        service.deleteMedication(name);
        return ResponseEntity.noContent().build();
    }
}
