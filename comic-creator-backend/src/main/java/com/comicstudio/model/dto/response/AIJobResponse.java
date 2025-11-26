package com.comicstudio.model.dto.response;

import com.comicstudio.model.entity.AIJob;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class AIJobResponse {
    private String jobId;
    private String status;
    private Integer estimatedCredits;
    private Integer estimatedDurationSeconds;
    private Integer progress;
    private Map<String, Object> result;
    private Map<String, Object> error;
    private String createdAt;
    private String startedAt;
    private String finishedAt;

    public static AIJobResponse fromEntity(AIJob job) {
        return AIJobResponse.builder()
                .jobId(job.getJobId())
                .status(job.getStatus().name().toLowerCase())
                .estimatedCredits(job.getEstimatedCredits())
                .estimatedDurationSeconds(job.getEstimatedDurationSeconds())
                .progress(job.getProgress())
                .result(job.getResult())
                .error(job.getError())
                .createdAt(job.getCreatedAt().toString())
                .startedAt(job.getStartedAt() != null ? job.getStartedAt().toString() : null)
                .finishedAt(job.getFinishedAt() != null ? job.getFinishedAt().toString() : null)
                .build();
    }
}
