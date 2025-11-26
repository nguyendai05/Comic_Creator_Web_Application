package com.comicstudio.controller;

import com.comicstudio.model.dto.request.CreateSeriesRequest;
import com.comicstudio.model.dto.response.SeriesResponse;
import com.comicstudio.service.SeriesService;
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
@RequestMapping("/series")
@RequiredArgsConstructor
@Tag(name = "Series", description = "Comic series management")
public class SeriesController {

    private final SeriesService seriesService;

    @GetMapping
    @Operation(summary = "Get all series for current user")
    public ResponseEntity<List<SeriesResponse>> getSeries() {
        return ResponseEntity.ok(seriesService.getUserSeries());
    }

    @GetMapping("/{seriesId}")
    @Operation(summary = "Get series by ID")
    public ResponseEntity<SeriesResponse> getSeriesById(@PathVariable String seriesId) {
        return ResponseEntity.ok(seriesService.getSeriesById(seriesId));
    }

    @PostMapping
    @Operation(summary = "Create a new series")
    public ResponseEntity<SeriesResponse> createSeries(
            @Valid @RequestBody CreateSeriesRequest request) {
        SeriesResponse response = seriesService.createSeries(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{seriesId}")
    @Operation(summary = "Update series")
    public ResponseEntity<SeriesResponse> updateSeries(
            @PathVariable String seriesId,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(seriesService.updateSeries(seriesId, updates));
    }

    @DeleteMapping("/{seriesId}")
    @Operation(summary = "Delete series")
    public ResponseEntity<Void> deleteSeries(@PathVariable String seriesId) {
        seriesService.deleteSeries(seriesId);
        return ResponseEntity.noContent().build();
    }
}
