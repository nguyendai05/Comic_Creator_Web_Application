package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "characters", indexes = @Index(name = "idx_series_char", columnList = "series_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Character extends BaseEntity {

    @Id
    @Column(name = "character_id", length = 36)
    private String characterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "appearance_description", columnDefinition = "TEXT")
    private String appearanceDescription;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "personality_traits", columnDefinition = "JSON")
    private List<String> personalityTraits;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "reference_images", columnDefinition = "JSON")
    private List<String> referenceImages;

    @Column(name = "consistency_token", columnDefinition = "TEXT")
    private String consistencyToken;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "style_guide", columnDefinition = "JSON")
    private Map<String, Object> styleGuide;

    @PrePersist
    public void prePersist() {
        if (characterId == null) {
            characterId = UUID.randomUUID().toString();
        }
    }
}
