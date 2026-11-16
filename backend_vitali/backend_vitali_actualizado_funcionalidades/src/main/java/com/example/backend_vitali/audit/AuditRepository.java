
package com.example.backend_vitali.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditRepository extends JpaRepository<AuditEvent, Long> {

    List<AuditEvent> findTop100ByActorUserIdOrderByCreatedAtDesc(
            Long actorUserId
    );
}
