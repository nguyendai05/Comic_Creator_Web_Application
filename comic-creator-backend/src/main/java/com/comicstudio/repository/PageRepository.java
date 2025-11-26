package com.comicstudio.repository;

import com.comicstudio.model.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, String> {
    @Query("SELECT MAX(p.pageNumber) FROM Page p WHERE p.episode.episodeId = :episodeId")
    Optional<Integer> findMaxPageNumber(@Param("episodeId") String episodeId);
}
