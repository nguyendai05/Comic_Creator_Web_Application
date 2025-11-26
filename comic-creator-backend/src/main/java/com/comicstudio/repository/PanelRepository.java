package com.comicstudio.repository;

import com.comicstudio.model.entity.Panel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanelRepository extends JpaRepository<Panel, String> {
    @Query("SELECT MAX(p.panelNumber) FROM Panel p WHERE p.page.pageId = :pageId")
    Optional<Integer> findMaxPanelNumber(@Param("pageId") String pageId);
}
