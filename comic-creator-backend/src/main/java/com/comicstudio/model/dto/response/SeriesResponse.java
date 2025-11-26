package com.comicstudio.model.dto.response;

import com.comicstudio.model.entity.Series;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class SeriesResponse {
    private String seriesId;
    private String userId;
    private String title;
    private String description;
    private String genre;
    private Map<String, Object> artStyle;
    private String status;
    private String coverImageUrl;
    private List<String> tags;
    private Boolean isPublic;
    private String createdAt;
    private String updatedAt;
    private Integer episodeCount;

    public static SeriesResponse fromEntity(Series series) {
        return SeriesResponse.builder()
                .seriesId(series.getSeriesId())
                .userId(series.getUser().getUserId())
                .title(series.getTitle())
                .description(series.getDescription())
                .genre(series.getGenre())
                .artStyle(series.getArtStyle())
                .status(series.getStatus().name().toLowerCase())
                .coverImageUrl(series.getCoverImageUrl())
                .tags(series.getTags())
                .isPublic(series.getIsPublic())
                .createdAt(series.getCreatedAt().toString())
                .updatedAt(series.getUpdatedAt().toString())
                .episodeCount(series.getEpisodes().size())
                .build();
    }
}
