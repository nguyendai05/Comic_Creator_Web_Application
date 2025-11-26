package com.comicstudio.repository;

import com.comicstudio.model.entity.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CharacterRepository extends JpaRepository<Character, String> {
    List<Character> findBySeriesSeriesId(String seriesId);
}
