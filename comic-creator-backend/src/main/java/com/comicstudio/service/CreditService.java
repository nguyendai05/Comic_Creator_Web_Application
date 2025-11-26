package com.comicstudio.service;

import com.comicstudio.exception.InsufficientCreditsException;
import com.comicstudio.exception.ResourceNotFoundException;
import com.comicstudio.model.entity.CreditTransaction;
import com.comicstudio.model.entity.User;
import com.comicstudio.repository.CreditTransactionRepository;
import com.comicstudio.repository.UserRepository;
import com.comicstudio.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditService {

    private final UserRepository userRepository;
    private final CreditTransactionRepository transactionRepository;

    public Map<String, Object> getCredits() {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return Map.of("credits_balance", user.getCreditsBalance());
    }

    public List<Map<String, Object>> getTransactions(int limit) {
        String userId = SecurityUtils.getCurrentUserId();
        return transactionRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, limit))
                .stream()
                .map(tx -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("tx_id", tx.getTxId());
                    map.put("amount", tx.getAmount());
                    map.put("balance_after", tx.getBalanceAfter());
                    map.put("reason", tx.getReason());
                    map.put("metadata", tx.getMetadata());
                    map.put("created_at", tx.getCreatedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deductCredits(String userId, int amount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getCreditsBalance() < amount) {
            throw new InsufficientCreditsException("Insufficient credits");
        }

        user.setCreditsBalance(user.getCreditsBalance() - amount);
        userRepository.save(user);

        CreditTransaction tx = CreditTransaction.builder()
                .user(user)
                .amount(-amount)
                .balanceAfter(user.getCreditsBalance())
                .reason(reason)
                .build();
        transactionRepository.save(tx);

        log.info("Deducted {} credits from user {}: {}", amount, userId, reason);
    }

    @Transactional
    public void refundCredits(String userId, int amount, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setCreditsBalance(user.getCreditsBalance() + amount);
        userRepository.save(user);

        CreditTransaction tx = CreditTransaction.builder()
                .user(user)
                .amount(amount)
                .balanceAfter(user.getCreditsBalance())
                .reason("refund_" + reason)
                .build();
        transactionRepository.save(tx);

        log.info("Refunded {} credits to user {}: {}", amount, userId, reason);
    }

    @Transactional
    public Map<String, Object> purchaseCredits(int amount) {
        String userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // In production, integrate with payment gateway here
        // For now, just add credits (mock purchase)
        
        user.setCreditsBalance(user.getCreditsBalance() + amount);
        userRepository.save(user);

        CreditTransaction tx = CreditTransaction.builder()
                .user(user)
                .amount(amount)
                .balanceAfter(user.getCreditsBalance())
                .reason("purchase")
                .build();
        transactionRepository.save(tx);

        log.info("User {} purchased {} credits", userId, amount);
        
        return Map.of(
                "new_balance", user.getCreditsBalance(),
                "amount_purchased", amount
        );
    }
}
