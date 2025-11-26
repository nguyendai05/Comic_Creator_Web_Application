package com.comicstudio.controller;

import com.comicstudio.model.dto.request.CreateEpisodeRequest;
import com.comicstudio.model.dto.response.EpisodeFullResponse;
import com.comicstudio.model.dto.response.EpisodeResponse;
import com.comicstudio.service.EpisodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Episodes", description = "Episode management")
public class EpisodeController {

    private final EpisodeService episodeService;

    @GetMapping("/series/{seriesId}/episodes")
    @Operation(summary = "Get all episodes for a series")
    public ResponseEntity<List<EpisodeResponse>> getEpisodes(@PathVariable String seriesId) {
        return ResponseEntity.ok(episodeService.getEpisodesBySeriesId(seriesId));
    }

    @PostMapping("/series/{seriesId}/episodes")
    @Operation(summary = "Create a new episode")
    public ResponseEntity<EpisodeResponse> createEpisode(
            @PathVariable String seriesId,
            @Valid @RequestBody CreateEpisodeRequest request) {
        EpisodeResponse response = episodeService.createEpisode(seriesId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/episodes/{episodeId}")
    @Operation(summary = "Get episode by ID")
    public ResponseEntity<EpisodeResponse> getEpisode(@PathVariable String episodeId) {
        return ResponseEntity.ok(episodeService.getEpisodeById(episodeId));
    }

    @GetMapping("/episodes/{episodeId}/full")
    @Operation(summary = "Get episode with all pages, panels, and text elements")
    public ResponseEntity<EpisodeFullResponse> getEpisodeFull(@PathVariable String episodeId) {
        return ResponseEntity.ok(episodeService.getEpisodeFull(episodeId));
    }

    @PutMapping("/episodes/{episodeId}")
    @Operation(summary = "Update episode")
    public ResponseEntity<EpisodeResponse> updateEpisode(
            @PathVariable String episodeId,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(episodeService.updateEpisode(episodeId, updates));
    }

    @PutMapping("/episodes/{episodeId}/save")
    @Operation(summary = "Save full episode data")
    public ResponseEntity<EpisodeFullResponse> saveEpisode(
            @PathVariable String episodeId,
            @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(episodeService.saveEpisodeFull(episodeId, data));
    }

    @DeleteMapping("/episodes/{episodeId}")
    @Operation(summary = "Delete episode")
    public ResponseEntity<Void> deleteEpisode(@PathVariable String episodeId) {
        episodeService.deleteEpisode(episodeId);
        return ResponseEntity.noContent().build();
    }
}
