package com.comicstudio.repository;

import com.comicstudio.model.entity.Series;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeriesRepository extends JpaRepository<Series, String> {
    List<Series> findByUserUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT s FROM Series s WHERE s.isPublic = true ORDER BY s.createdAt DESC")
    List<Series> findPublicSeries();
    
    long countByUserUserId(String userId);
}
