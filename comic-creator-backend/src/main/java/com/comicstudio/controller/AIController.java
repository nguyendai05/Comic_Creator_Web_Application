package com.comicstudio.controller;

import com.comicstudio.model.dto.response.AIJobResponse;
import com.comicstudio.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Generation", description = "AI-powered panel generation")
public class AIController {

    private final AIService aiService;

    @PostMapping("/generate")
    @Operation(summary = "Create AI generation job")
    public ResponseEntity<AIJobResponse> createJob(@RequestBody Map<String, Object> input) {
        AIJobResponse response = aiService.createGenerationJob(input);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "Get job status")
    public ResponseEntity<AIJobResponse> getJobStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(aiService.getJobStatus(jobId));
    }

    @PostMapping("/jobs/{jobId}/cancel")
    @Operation(summary = "Cancel job")
    public ResponseEntity<Map<String, String>> cancelJob(@PathVariable String jobId) {
        aiService.cancelJob(jobId);
        return ResponseEntity.ok(Map.of("message", "Job cancelled"));
    }
}
