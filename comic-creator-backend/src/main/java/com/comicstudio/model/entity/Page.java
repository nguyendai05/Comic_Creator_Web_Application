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
@Table(name = "pages",
       uniqueConstraints = @UniqueConstraint(columnNames = {"episode_id", "page_number"}),
       indexes = @Index(name = "idx_episode", columnList = "episode_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Page extends BaseEntity {

    @Id
    @Column(name = "page_id", length = 36)
    private String pageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id", nullable = false)
    private Episode episode;

    @NotNull
    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "layout_type", length = 50)
    @Builder.Default
    private LayoutType layoutType = LayoutType.TRADITIONAL;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_data", columnDefinition = "JSON")
    private Map<String, Object> layoutData;

    // Relationships
    @OneToMany(mappedBy = "page", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("panelNumber ASC")
    @Builder.Default
    private List<Panel> panels = new ArrayList<>();

    public enum LayoutType {
        TRADITIONAL, WEBTOON, SPREAD
    }

    @PrePersist
    public void prePersist() {
        if (pageId == null) {
            pageId = UUID.randomUUID().toString();
        }
    }
}
