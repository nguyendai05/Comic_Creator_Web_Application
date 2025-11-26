package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "text_elements", indexes = @Index(name = "idx_panel", columnList = "panel_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TextElement extends BaseEntity {

    @Id
    @Column(name = "text_id", length = 36)
    private String textId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_id", nullable = false)
    private Panel panel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "text_type", nullable = false, length = 50)
    private TextType textType;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSON")
    private Map<String, Object> position;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "JSON")
    private Map<String, Object> style;

    @Column(name = "character_id", length = 36)
    private String characterId;

    public enum TextType {
        DIALOGUE, NARRATION, SFX
    }

    @PrePersist
    public void prePersist() {
        if (textId == null) {
            textId = UUID.randomUUID().toString();
        }
    }
}
