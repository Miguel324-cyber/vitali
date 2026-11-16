
package com.example.backend_vitali.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditRepository auditRepository;

    public AuditService(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void record(
            Long actorUserId,
            String action,
            String resourceType,
            Long resourceId,
            String outcome
    ) {
        AuditEvent event = new AuditEvent(
                actorUserId,
                action,
                resourceType,
                resourceId,
                outcome
        );

        auditRepository.save(event);
    }
}
