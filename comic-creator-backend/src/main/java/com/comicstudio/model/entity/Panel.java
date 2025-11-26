package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "panels", indexes = @Index(name = "idx_page", columnList = "page_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Panel extends BaseEntity {

    @Id
    @Column(name = "panel_id", length = 36)
    private String panelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private Page page;

    @NotNull
    @Column(name = "panel_number", nullable = false)
    private Integer panelNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "panel_type", length = 50)
    @Builder.Default
    private PanelType panelType = PanelType.STANDARD;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSON")
    private Map<String, Object> position;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "generation_prompt", columnDefinition = "TEXT")
    private String generationPrompt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "generation_config", columnDefinition = "JSON")
    private Map<String, Object> generationConfig;

    @Column(name = "script_text", columnDefinition = "TEXT")
    private String scriptText;

    // Relationships
    @OneToMany(mappedBy = "panel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TextElement> textElements = new ArrayList<>();

    public enum PanelType {
        STANDARD, SPLASH, INSET
    }

    @PrePersist
    public void prePersist() {
        if (panelId == null) {
            panelId = UUID.randomUUID().toString();
        }
    }

    // Helper to get position values
    public Double getX() {
        return position != null ? ((Number) position.get("x")).doubleValue() : 0.0;
    }

    public Double getY() {
        return position != null ? ((Number) position.get("y")).doubleValue() : 0.0;
    }

    public Double getWidth() {
        return position != null ? ((Number) position.get("width")).doubleValue() : 0.0;
    }

    public Double getHeight() {
        return position != null ? ((Number) position.get("height")).doubleValue() : 0.0;
    }
}
