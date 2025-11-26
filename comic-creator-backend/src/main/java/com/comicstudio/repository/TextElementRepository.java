package com.comicstudio.repository;

import com.comicstudio.model.entity.TextElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TextElementRepository extends JpaRepository<TextElement, String> {
    List<TextElement> findByPanelPanelId(String panelId);
}
