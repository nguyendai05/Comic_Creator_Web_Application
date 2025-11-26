package com.comicstudio.repository;

import com.comicstudio.model.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, String> {
    List<Episode> findBySeriesSeriesIdOrderByEpisodeNumberAsc(String seriesId);
    
    @Query("SELECT MAX(e.episodeNumber) FROM Episode e WHERE e.series.seriesId = :seriesId")
    Optional<Integer> findMaxEpisodeNumber(@Param("seriesId") String seriesId);
    
    @Query("SELECT e FROM Episode e " +
           "LEFT JOIN FETCH e.pages p " +
           "LEFT JOIN FETCH p.panels pan " +
           "LEFT JOIN FETCH pan.textElements " +
           "WHERE e.episodeId = :episodeId")
    Optional<Episode> findByIdWithFullData(@Param("episodeId") String episodeId);
}
