
package com.example.backend_vitali.audit;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "audit_events",
    indexes = {
        @Index(
            name = "idx_audit_events_actor",
            columnList = "actor_user_id"
        ),
        @Index(
            name = "idx_audit_events_created",
            columnList = "created_at"
        )
    }
)
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "resource_type", nullable = false, length = 80)
    private String resourceType;

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(nullable = false, length = 30)
    private String outcome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected AuditEvent() {
    }

    public AuditEvent(
            Long actorUserId,
            String action,
            String resourceType,
            Long resourceId,
            String outcome
    ) {
        this.actorUserId = actorUserId;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.outcome = outcome;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public String getAction() {
        return action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getOutcome() {
        return outcome;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
