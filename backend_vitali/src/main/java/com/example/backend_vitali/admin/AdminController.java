
package com.example.backend_vitali.admin;

import com.example.backend_vitali.admin.AdminDtos.AdminOverviewResponse;
import com.example.backend_vitali.auth.AuthDtos;
import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.AccountStatus;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.backend_vitali.doctor.DoctorDtos.DoctorReviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public AdminOverviewResponse getOverview() {
        return adminService.getOverview();
    }

    @GetMapping("/doctors/pending")
    public List<DoctorReviewResponse> listPendingDoctors() {
        return adminService.listPendingDoctors();
    }

    @PatchMapping("/doctors/{userId}/approve")
    public DoctorReviewResponse approveDoctor(
            @PathVariable Long userId
    ) {
        return adminService.approveDoctor(userId);
    }

    @PatchMapping("/doctors/{userId}/reject")
    public DoctorReviewResponse rejectDoctor(
            @PathVariable Long userId
    ) {
        return adminService.rejectDoctor(userId);
    }
    // Ejemplo de lo que debería tener tu AdminController.java en el backend:
    @GetMapping("/users")
    public ResponseEntity<List<AuthDtos.UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) AccountStatus status
    ) {
        return ResponseEntity.ok(adminService.searchUsers(search, role, status));
    }

    @PutMapping("/users/{id}")
    public AuthDtos.UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody AdminDtos.UpdateUserRequest request) {
        return adminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/patients/{patientId}/doctor")
    public ResponseEntity<Void> assignDoctor(@PathVariable Long patientId, @RequestBody AdminDtos.AssignDoctorRequest request) {
        adminService.assignDoctor(patientId, request.doctorId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/doctors/load")
    public List<java.util.Map<String, Object>> getDoctorLoad() {
        return adminService.getDoctorLoad();
    }

    @GetMapping("/doctors/{doctorId}/patients")
    public List<java.util.Map<String, Object>> getDoctorPatients(@PathVariable Long doctorId) {
        return adminService.getDoctorPatients(doctorId);
    }

    @GetMapping("/links")
    public List<AdminDtos.AdminLinkResponse> getLinks() {
        return adminService.getLinks();
    }
}
