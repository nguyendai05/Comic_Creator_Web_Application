package com.comicstudio.repository;

import com.comicstudio.model.entity.AIJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIJobRepository extends JpaRepository<AIJob, String> {
    List<AIJob> findByUserIdOrderByCreatedAtDesc(String userId);
    List<AIJob> findByStatus(AIJob.JobStatus status);
}
