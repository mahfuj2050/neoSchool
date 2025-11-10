package com.rufan.fullstackbackend.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Component
public class TokenBlacklist {
    private final Set<String> blacklistedTokens = new HashSet<>();
    private final long TOKEN_VALIDITY_MS = TimeUnit.DAYS.toMillis(1); // 24 hours

    public void addToBlacklist(String token) {
        blacklistedTokens.add(token);
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    @Scheduled(fixedRate = 24 * 60 * 60 * 1000) // Run once per day
    public void cleanupExpiredTokens() {
        // In a production environment, you might want to implement actual token expiration checking
        // For this implementation, we'll just clear the set periodically
        blacklistedTokens.clear();
    }
}
