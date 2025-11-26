package com.comicstudio.controller;

import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.model.dto.response.EpisodeFullResponse.TextElementResponse;
import com.comicstudio.model.entity.Panel;
import com.comicstudio.model.entity.TextElement;
import com.comicstudio.repository.PanelRepository;
import com.comicstudio.repository.TextElementRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Text Elements", description = "Text element management")
public class TextController {

    private final TextElementRepository textElementRepository;
    private final PanelRepository panelRepository;

    @PostMapping("/panels/{panelId}/texts")
    @Operation(summary = "Add text element to panel")
    @SuppressWarnings("unchecked")
    public ResponseEntity<TextElementResponse> createTextElement(
            @PathVariable String panelId,
            @RequestBody Map<String, Object> data) {
        
        Panel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("Panel not found"));

        TextElement text = TextElement.builder()
                .panel(panel)
                .textType(TextElement.TextType.valueOf(
                    ((String) data.get("textType")).toUpperCase()
                ))
                .content((String) data.get("content"))
                .position((Map<String, Object>) data.get("position"))
                .style((Map<String, Object>) data.get("style"))
                .characterId((String) data.get("characterId"))
                .build();

        text = textElementRepository.save(text);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TextElementResponse.fromEntity(text));
    }

    @PutMapping("/texts/{textId}")
    @Operation(summary = "Update text element")
    @SuppressWarnings("unchecked")
    public ResponseEntity<TextElementResponse> updateTextElement(
            @PathVariable String textId,
            @RequestBody Map<String, Object> updates) {
        
        TextElement text = textElementRepository.findById(textId)
                .orElseThrow(() -> new ResourceNotFoundException("Text element not found"));

        if (updates.containsKey("content")) {
            text.setContent((String) updates.get("content"));
        }
        if (updates.containsKey("position")) {
            text.setPosition((Map<String, Object>) updates.get("position"));
        }
        if (updates.containsKey("style")) {
            text.setStyle((Map<String, Object>) updates.get("style"));
        }
        if (updates.containsKey("textType")) {
            text.setTextType(TextElement.TextType.valueOf(
                ((String) updates.get("textType")).toUpperCase()
            ));
        }

        text = textElementRepository.save(text);
        
        return ResponseEntity.ok(TextElementResponse.fromEntity(text));
    }

    @DeleteMapping("/texts/{textId}")
    @Operation(summary = "Delete text element")
    public ResponseEntity<Void> deleteTextElement(@PathVariable String textId) {
        TextElement text = textElementRepository.findById(textId)
                .orElseThrow(() -> new ResourceNotFoundException("Text element not found"));
        
        textElementRepository.delete(text);
        return ResponseEntity.noContent().build();
    }
}
