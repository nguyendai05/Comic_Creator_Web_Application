package com.comicstudio.repository;

import com.comicstudio.model.entity.CreditTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, String> {
    List<CreditTransaction> findByUserUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
