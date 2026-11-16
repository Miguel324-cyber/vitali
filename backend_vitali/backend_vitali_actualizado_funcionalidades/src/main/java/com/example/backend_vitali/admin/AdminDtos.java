
package com.example.backend_vitali.admin;

import com.example.backend_vitali.user.Role;
import com.example.backend_vitali.user.AccountStatus;

public final class AdminDtos {

    private AdminDtos() {
    }

    public record AdminOverviewResponse(
            long totalUsers,
            long activePatients,
            long pendingDoctors,
            long activeDoctors,
            long activeFamilies,
            long suspendedUsers
    ) {
    }

    public record AdminUserFilter(String search, String role, String status) {}

    public record UpdateUserRequest(
            String fullName, String email, Role role, AccountStatus status
    ) {}

    public record AssignDoctorRequest(Long doctorId) {}

    public record AdminLinkResponse(
            Long id, Long patientId, String patientName,
            Long doctorId, String doctorName,
            Long familyId, String familyName,
            boolean active, String relationship
    ) {}
}
