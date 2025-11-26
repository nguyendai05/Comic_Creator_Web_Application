package com.comicstudio.controller;

import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.model.entity.Panel;
import com.comicstudio.repository.PanelRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/panels")
@RequiredArgsConstructor
@Tag(name = "Panels", description = "Panel management")
public class PanelController {

    private final PanelRepository panelRepository;

    @PutMapping("/{panelId}")
    @Operation(summary = "Update panel")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> updatePanel(
            @PathVariable String panelId,
            @RequestBody Map<String, Object> updates) {
        
        Panel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("Panel not found"));

        if (updates.containsKey("position")) {
            panel.setPosition((Map<String, Object>) updates.get("position"));
        }
        if (updates.containsKey("imageUrl")) {
            panel.setImageUrl((String) updates.get("imageUrl"));
        }
        if (updates.containsKey("thumbnailUrl")) {
            panel.setThumbnailUrl((String) updates.get("thumbnailUrl"));
        }
        if (updates.containsKey("scriptText")) {
            panel.setScriptText((String) updates.get("scriptText"));
        }
        if (updates.containsKey("generationPrompt")) {
            panel.setGenerationPrompt((String) updates.get("generationPrompt"));
        }
        if (updates.containsKey("panelType")) {
            panel.setPanelType(Panel.PanelType.valueOf(
                ((String) updates.get("panelType")).toUpperCase()
            ));
        }

        panel = panelRepository.save(panel);

        return ResponseEntity.ok(Map.of(
                "panelId", panel.getPanelId(),
                "message", "Panel updated successfully"
        ));
    }

    @DeleteMapping("/{panelId}")
    @Operation(summary = "Delete panel")
    public ResponseEntity<Void> deletePanel(@PathVariable String panelId) {
        Panel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("Panel not found"));
        
        panelRepository.delete(panel);
        return ResponseEntity.noContent().build();
    }
}
