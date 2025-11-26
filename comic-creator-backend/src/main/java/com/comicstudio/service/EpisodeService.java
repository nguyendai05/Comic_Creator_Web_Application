package com.comicstudio.service;

import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.model.dto.request.CreateEpisodeRequest;
import com.comicstudio.model.dto.response.EpisodeFullResponse;
import com.comicstudio.model.dto.response.EpisodeResponse;
import com.comicstudio.model.entity.*;
import com.comicstudio.model.entity.Character;
import com.comicstudio.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EpisodeService {

    private final EpisodeRepository episodeRepository;
    private final SeriesService seriesService;
    private final CharacterRepository characterRepository;
    private final PageRepository pageRepository;
    private final PanelRepository panelRepository;

    public List<EpisodeResponse> getEpisodesBySeriesId(String seriesId) {
        seriesService.findSeriesAndVerifyAccess(seriesId);
        return episodeRepository.findBySeriesSeriesIdOrderByEpisodeNumberAsc(seriesId)
                .stream()
                .map(EpisodeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public EpisodeResponse getEpisodeById(String episodeId) {
        Episode episode = findEpisodeAndVerifyAccess(episodeId);
        return EpisodeResponse.fromEntity(episode);
    }

    @Transactional(readOnly = true)
    public EpisodeFullResponse getEpisodeFull(String episodeId) {
        Episode episode = episodeRepository.findByIdWithFullData(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Episode not found"));

        seriesService.findSeriesAndVerifyAccess(episode.getSeries().getSeriesId());

        List<Character> characters = characterRepository
                .findBySeriesSeriesId(episode.getSeries().getSeriesId());

        return EpisodeFullResponse.builder()
                .episode(EpisodeResponse.fromEntity(episode))
                .pages(episode.getPages().stream()
                        .map(EpisodeFullResponse.PageResponse::fromEntity)
                        .collect(Collectors.toList()))
                .characters(characters.stream()
                        .map(EpisodeFullResponse.CharacterResponse::fromEntity)
                        .collect(Collectors.toList()))
                .comments(Collections.emptyList())
                .build();
    }

    @Transactional
    public EpisodeResponse createEpisode(String seriesId, CreateEpisodeRequest request) {
        Series series = seriesService.findSeriesAndVerifyAccess(seriesId);

        Integer maxEpisodeNumber = episodeRepository.findMaxEpisodeNumber(seriesId)
                .orElse(0);

        Episode episode = Episode.builder()
                .series(series)
                .episodeNumber(maxEpisodeNumber + 1)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(Episode.EpisodeStatus.DRAFT)
                .pageCount(0)
                .build();

        episode = episodeRepository.save(episode);
        
        // Create default first page with default panel
        Page firstPage = Page.builder()
                .episode(episode)
                .pageNumber(1)
                .layoutType(Page.LayoutType.TRADITIONAL)
                .build();
        firstPage = pageRepository.save(firstPage);
        
        // Create default panel
        Map<String, Object> defaultPosition = new HashMap<>();
        defaultPosition.put("x", 50.0);
        defaultPosition.put("y", 50.0);
        defaultPosition.put("width", 400.0);
        defaultPosition.put("height", 300.0);
        
        Panel defaultPanel = Panel.builder()
                .page(firstPage)
                .panelNumber(1)
                .panelType(Panel.PanelType.STANDARD)
                .position(defaultPosition)
                .build();
        panelRepository.save(defaultPanel);
        
        episode.setPageCount(1);
        episode = episodeRepository.save(episode);
        
        log.info("Episode created: {} for series: {}", episode.getEpisodeId(), seriesId);

        return EpisodeResponse.fromEntity(episode);
    }

    @Transactional
    public EpisodeResponse updateEpisode(String episodeId, Map<String, Object> updates) {
        Episode episode = findEpisodeAndVerifyAccess(episodeId);

        if (updates.containsKey("title")) {
            episode.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            episode.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("script")) {
            episode.setScript((String) updates.get("script"));
        }
        if (updates.containsKey("status")) {
            episode.setStatus(Episode.EpisodeStatus.valueOf(
                ((String) updates.get("status")).toUpperCase()
            ));
        }

        episode = episodeRepository.save(episode);
        log.info("Episode updated: {}", episodeId);

        return EpisodeResponse.fromEntity(episode);
    }

    @Transactional
    public void deleteEpisode(String episodeId) {
        Episode episode = findEpisodeAndVerifyAccess(episodeId);
        episodeRepository.delete(episode);
        log.info("Episode deleted: {}", episodeId);
    }

    @Transactional
    public EpisodeFullResponse saveEpisodeFull(String episodeId, Map<String, Object> data) {
        findEpisodeAndVerifyAccess(episodeId);
        // For now, just return the current state
        // Full implementation would save all nested data
        return getEpisodeFull(episodeId);
    }

    private Episode findEpisodeAndVerifyAccess(String episodeId) {
        Episode episode = episodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Episode not found"));

        seriesService.findSeriesAndVerifyAccess(episode.getSeries().getSeriesId());
        return episode;
    }
}
