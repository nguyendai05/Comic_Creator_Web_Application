package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "episodes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"series_id", "episode_number"}),
       indexes = @Index(name = "idx_series", columnList = "series_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Episode extends BaseEntity {

    @Id
    @Column(name = "episode_id", length = 36)
    private String episodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    @NotNull
    @Column(name = "episode_number", nullable = false)
    private Integer episodeNumber;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String script;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    @Builder.Default
    private EpisodeStatus status = EpisodeStatus.DRAFT;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "page_count")
    @Builder.Default
    private Integer pageCount = 0;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // Relationships
    @OneToMany(mappedBy = "episode", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("pageNumber ASC")
    @Builder.Default
    private List<Page> pages = new ArrayList<>();

    public enum EpisodeStatus {
        DRAFT, PUBLISHED, ARCHIVED
    }

    @PrePersist
    public void prePersist() {
        if (episodeId == null) {
            episodeId = UUID.randomUUID().toString();
        }
    }

    // Helper method to update page count
    public void updatePageCount() {
        this.pageCount = this.pages.size();
    }
}
