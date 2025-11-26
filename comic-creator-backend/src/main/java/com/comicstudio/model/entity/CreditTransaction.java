package com.comicstudio.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "credit_transactions", 
       indexes = @Index(name = "idx_user_created", columnList = "user_id, created_at DESC"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditTransaction extends BaseEntity {

    @Id
    @Column(name = "tx_id", length = 36)
    private String txId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(nullable = false)
    private Integer amount;

    @NotNull
    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String reason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> metadata;

    @PrePersist
    public void prePersist() {
        if (txId == null) {
            txId = UUID.randomUUID().toString();
        }
    }
}
