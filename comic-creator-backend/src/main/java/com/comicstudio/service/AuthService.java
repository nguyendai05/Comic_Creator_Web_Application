package com.comicstudio.service;

import com.comicstudio.config.JwtConfig;
import com.comicstudio.exception.BadRequestException;
import com.comicstudio.exception.UnauthorizedException;
import com.comicstudio.model.dto.request.LoginRequest;
import com.comicstudio.model.dto.request.RegisterRequest;
import com.comicstudio.model.dto.response.AuthResponse;
import com.comicstudio.model.entity.User;
import com.comicstudio.repository.UserRepository;
import com.comicstudio.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;

    @Value("${app.credits.initial-balance:10}")
    private int initialCreditsBalance;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getUsername())
                .creditsBalance(initialCreditsBalance)
                .subscriptionTier(User.SubscriptionTier.FREE)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        return createAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        log.info("User logged in: {}", user.getEmail());
        return createAuthResponse(user);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (!jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new UnauthorizedException("Invalid token type");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return createAuthResponse(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUserId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        return AuthResponse.builder()
                .user(AuthResponse.UserDTO.builder()
                        .userId(user.getUserId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .displayName(user.getDisplayName())
                        .creditsBalance(user.getCreditsBalance())
                        .subscriptionTier(user.getSubscriptionTier().name().toLowerCase())
                        .emailVerified(user.getEmailVerified())
                        .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                        .build())
                .tokens(AuthResponse.TokensDTO.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .expiresIn(jwtConfig.getAccessTokenExpiration() / 1000)
                        .build())
                .build();
    }
}
