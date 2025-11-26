package com.comicstudio.model.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private UserDTO user;
    private TokensDTO tokens;

    @Data
    @Builder
    public static class UserDTO {
        private String userId;
        private String email;
        private String username;
        private String displayName;
        private Integer creditsBalance;
        private String subscriptionTier;
        private Boolean emailVerified;
        private String createdAt;
    }

    @Data
    @Builder
    public static class TokensDTO {
        private String accessToken;
        private String refreshToken;
        private Long expiresIn;
    }
}
