package com.comicstudio.controller;

import com.comicstudio.service.CreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/credits")
@RequiredArgsConstructor
@Tag(name = "Credits", description = "Credit management")
public class CreditController {

    private final CreditService creditService;

    @GetMapping
    @Operation(summary = "Get current credit balance")
    public ResponseEntity<Map<String, Object>> getCredits() {
        return ResponseEntity.ok(creditService.getCredits());
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get credit transaction history")
    public ResponseEntity<List<Map<String, Object>>> getTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(creditService.getTransactions(limit));
    }

    @PostMapping("/purchase")
    @Operation(summary = "Purchase credits (mock)")
    public ResponseEntity<Map<String, Object>> purchaseCredits(@RequestBody Map<String, Object> body) {
        int amount = ((Number) body.get("amount")).intValue();
        return ResponseEntity.ok(creditService.purchaseCredits(amount));
    }
}
