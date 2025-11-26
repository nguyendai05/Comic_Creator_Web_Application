package com.comicstudio.service;

import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.exception.UnauthorizedException;
import com.comicstudio.model.dto.request.CreateSeriesRequest;
import com.comicstudio.model.dto.response.SeriesResponse;
import com.comicstudio.model.entity.Series;
import com.comicstudio.model.entity.User;
import com.comicstudio.repository.SeriesRepository;
import com.comicstudio.repository.UserRepository;
import com.comicstudio.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final UserRepository userRepository;

    public List<SeriesResponse> getUserSeries() {
        String userId = SecurityUtils.getCurrentUserId();
        return seriesRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(SeriesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public SeriesResponse getSeriesById(String seriesId) {
        Series series = findSeriesAndVerifyAccess(seriesId);
        return SeriesResponse.fromEntity(series);
    }

    @Transactional
    public SeriesResponse createSeries(CreateSeriesRequest request) {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Series series = Series.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .genre(request.getGenre())
                .artStyle(request.getArtStyle())
                .tags(request.getTags())
                .status(Series.SeriesStatus.DRAFT)
                .isPublic(false)
                .build();

        series = seriesRepository.save(series);
        log.info("Series created: {} by user: {}", series.getSeriesId(), userId);
        
        return SeriesResponse.fromEntity(series);
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public SeriesResponse updateSeries(String seriesId, Map<String, Object> updates) {
        Series series = findSeriesAndVerifyAccess(seriesId);

        if (updates.containsKey("title")) {
            series.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            series.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("genre")) {
            series.setGenre((String) updates.get("genre"));
        }
        if (updates.containsKey("artStyle")) {
            series.setArtStyle((Map<String, Object>) updates.get("artStyle"));
        }
        if (updates.containsKey("tags")) {
            series.setTags((List<String>) updates.get("tags"));
        }
        if (updates.containsKey("status")) {
            series.setStatus(Series.SeriesStatus.valueOf(
                ((String) updates.get("status")).toUpperCase()
            ));
        }
        if (updates.containsKey("isPublic")) {
            series.setIsPublic((Boolean) updates.get("isPublic"));
        }

        series = seriesRepository.save(series);
        log.info("Series updated: {}", seriesId);
        
        return SeriesResponse.fromEntity(series);
    }

    @Transactional
    public void deleteSeries(String seriesId) {
        Series series = findSeriesAndVerifyAccess(seriesId);
        seriesRepository.delete(series);
        log.info("Series deleted: {}", seriesId);
    }

    public Series findSeriesAndVerifyAccess(String seriesId) {
        String userId = SecurityUtils.getCurrentUserId();
        Series series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new ResourceNotFoundException("Series not found"));

        if (!series.getUser().getUserId().equals(userId)) {
            throw new UnauthorizedException("Access denied to this series");
        }

        return series;
    }
}
