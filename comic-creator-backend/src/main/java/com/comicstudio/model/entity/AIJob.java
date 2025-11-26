package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "ai_jobs", indexes = {
        @Index(name = "idx_user_job", columnList = "user_id"),
        @Index(name = "idx_status_job", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIJob extends BaseEntity {

    @Id
    @Column(name = "job_id", length = 36)
    private String jobId;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "panel_id", length = 36)
    private String panelId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 50)
    private JobType jobType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private JobStatus status = JobStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> input;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> result;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> error;

    @Column(name = "estimated_credits")
    private Integer estimatedCredits;

    @Column(name = "estimated_duration_seconds")
    private Integer estimatedDurationSeconds;

    @Column
    private Integer progress;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    public enum JobType {
        PANEL_GENERATION, CHARACTER_GENERATION, BATCH_GENERATION
    }

    public enum JobStatus {
        PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED
    }

    @PrePersist
    public void prePersist() {
        if (jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
    }
}
