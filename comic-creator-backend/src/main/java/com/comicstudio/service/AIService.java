package com.comicstudio.service;

import com.comicstudio.exception.InsufficientCreditsException;
import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.model.dto.response.AIJobResponse;
import com.comicstudio.model.entity.AIJob;
import com.comicstudio.model.entity.User;
import com.comicstudio.repository.AIJobRepository;
import com.comicstudio.repository.PanelRepository;
import com.comicstudio.repository.UserRepository;
import com.comicstudio.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final AIJobRepository aiJobRepository;
    private final UserRepository userRepository;
    private final PanelRepository panelRepository;
    private final CreditService creditService;

    @Value("${app.credits.panel-generation-cost:1}")
    private int panelGenerationCost;

    @Value("${app.credits.high-quality-cost:2}")
    private int highQualityCost;

    @Transactional
    @SuppressWarnings("unchecked")
    public AIJobResponse createGenerationJob(Map<String, Object> input) {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Determine credit cost
        Map<String, Object> inputData = (Map<String, Object>) input.get("input");
        if (inputData == null) {
            inputData = input; // Support direct input format
        }
        
        Map<String, Object> style = (Map<String, Object>) inputData.get("style");
        String quality = style != null ? (String) style.get("quality") : "standard";
        int creditCost = "high".equals(quality) ? highQualityCost : panelGenerationCost;

        // Check credits
        if (user.getCreditsBalance() < creditCost) {
            throw new InsufficientCreditsException("Insufficient credits. Required: " + creditCost + ", Available: " + user.getCreditsBalance());
        }

        // Deduct credits
        creditService.deductCredits(userId, creditCost, "panel_generation");

        // Create job
        AIJob job = AIJob.builder()
                .userId(userId)
                .panelId((String) input.get("panel_id"))
                .jobType(AIJob.JobType.PANEL_GENERATION)
                .status(AIJob.JobStatus.PENDING)
                .input(inputData)
                .estimatedCredits(creditCost)
                .estimatedDurationSeconds(10)
                .progress(0)
                .build();

        job = aiJobRepository.save(job);
        log.info("AI job created: {} for user: {}", job.getJobId(), userId);

        // Start async processing
        String jobId = job.getJobId();
        processJobAsync(jobId);

        return AIJobResponse.fromEntity(job);
    }

    @Async
    public void processJobAsync(String jobId) {
        try {
            // Simulate processing delay (replace with real Gemini API call)
            Thread.sleep(10000);

            AIJob job = aiJobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException("Job not found"));

            // Skip if already cancelled
            if (job.getStatus() == AIJob.JobStatus.CANCELLED) {
                return;
            }

            // Update job status
            job.setStatus(AIJob.JobStatus.SUCCESS);
            job.setStartedAt(LocalDateTime.now().minusSeconds(10));
            job.setFinishedAt(LocalDateTime.now());
            job.setProgress(100);

            // Mock result (replace with real Gemini response)
            Map<String, Object> result = new HashMap<>();
            result.put("image_url", "/mock-images/panel-" + (int)(Math.random() * 20 + 1) + ".jpg");
            result.put("thumbnail_url", "/mock-images/thumb-" + (int)(Math.random() * 20 + 1) + ".jpg");
            result.put("width", 1024);
            result.put("height", 576);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> inputMap = job.getInput();
            result.put("prompt_used", inputMap != null ? inputMap.get("scene_description") : "Generated image");
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("model", "gemini-pro-vision");
            metadata.put("seed", (int)(Math.random() * 9000 + 1000));
            metadata.put("steps", 30);
            result.put("generation_metadata", metadata);

            job.setResult(result);

            // Update panel if panelId provided
            if (job.getPanelId() != null) {
                panelRepository.findById(job.getPanelId()).ifPresent(panel -> {
                    panel.setImageUrl((String) result.get("image_url"));
                    panel.setThumbnailUrl((String) result.get("thumbnail_url"));
                    panel.setGenerationPrompt((String) result.get("prompt_used"));
                    panelRepository.save(panel);
                });
            }

            aiJobRepository.save(job);
            log.info("AI job completed: {}", jobId);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            handleJobError(jobId, "Job interrupted");
        } catch (Exception e) {
            handleJobError(jobId, e.getMessage());
        }
    }

    private void handleJobError(String jobId, String errorMessage) {
        aiJobRepository.findById(jobId).ifPresent(job -> {
            job.setStatus(AIJob.JobStatus.FAILED);
            job.setFinishedAt(LocalDateTime.now());
            
            Map<String, Object> error = new HashMap<>();
            error.put("code", "GENERATION_FAILED");
            error.put("message", errorMessage);
            job.setError(error);

            aiJobRepository.save(job);
            log.error("AI job failed: {} - {}", jobId, errorMessage);
        });
    }

    public AIJobResponse getJobStatus(String jobId) {
        AIJob job = aiJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));
        
        return AIJobResponse.fromEntity(job);
    }

    @Transactional
    public void cancelJob(String jobId) {
        AIJob job = aiJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found: " + jobId));

        if (job.getStatus() == AIJob.JobStatus.PENDING || 
            job.getStatus() == AIJob.JobStatus.PROCESSING) {
            
            job.setStatus(AIJob.JobStatus.CANCELLED);
            job.setFinishedAt(LocalDateTime.now());
            aiJobRepository.save(job);

            // Refund credits
            if (job.getEstimatedCredits() != null) {
                creditService.refundCredits(job.getUserId(), 
                    job.getEstimatedCredits(), "job_cancelled");
            }

            log.info("AI job cancelled: {}", jobId);
        }
    }
}
