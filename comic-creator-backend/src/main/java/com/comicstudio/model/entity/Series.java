package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "series", indexes = {
        @Index(name = "idx_user", columnList = "user_id"),
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Series extends BaseEntity {

    @Id
    @Column(name = "series_id", length = 36)
    private String seriesId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String genre;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "art_style", columnDefinition = "JSON")
    private Map<String, Object> artStyle;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private SeriesStatus status = SeriesStatus.DRAFT;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> tags;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = false;

    // Relationships
    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("episodeNumber ASC")
    @Builder.Default
    private List<Episode> episodes = new ArrayList<>();

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Character> characters = new ArrayList<>();

    public enum SeriesStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }

    @PrePersist
    public void prePersist() {
        if (seriesId == null) {
            seriesId = UUID.randomUUID().toString();
        }
    }
}
