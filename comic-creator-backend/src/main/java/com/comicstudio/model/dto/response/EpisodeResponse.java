package com.comicstudio.model.dto.response;

import com.comicstudio.model.entity.Episode;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EpisodeResponse {
    private String episodeId;
    private String seriesId;
    private Integer episodeNumber;
    private String title;
    private String description;
    private String script;
    private String status;
    private String thumbnailUrl;
    private Integer pageCount;
    private String publishedAt;
    private String createdAt;
    private String updatedAt;

    public static EpisodeResponse fromEntity(Episode episode) {
        return EpisodeResponse.builder()
                .episodeId(episode.getEpisodeId())
                .seriesId(episode.getSeries().getSeriesId())
                .episodeNumber(episode.getEpisodeNumber())
                .title(episode.getTitle())
                .description(episode.getDescription())
                .script(episode.getScript())
                .status(episode.getStatus().name().toLowerCase())
                .thumbnailUrl(episode.getThumbnailUrl())
                .pageCount(episode.getPageCount())
                .publishedAt(episode.getPublishedAt() != null ? 
                    episode.getPublishedAt().toString() : null)
                .createdAt(episode.getCreatedAt().toString())
                .updatedAt(episode.getUpdatedAt().toString())
                .build();
    }
}
