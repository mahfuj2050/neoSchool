package com.rufan.fullstackbackend.controller;

import com.rufan.fullstackbackend.dto.JwtResponse;
import com.rufan.fullstackbackend.dto.LoginRequest;
import com.rufan.fullstackbackend.dto.RefreshTokenRequest;
import com.rufan.fullstackbackend.exception.JwtTokenException;
import com.rufan.fullstackbackend.security.JwtTokenUtil;
import com.rufan.fullstackbackend.security.TokenBlacklist;
import com.rufan.fullstackbackend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:3001", "http://172.21.224.1:3000"},
    allowedHeaders = "*",
    allowCredentials = "true",
    maxAge = 3600
)
public class AuthController {

    private final AuthService authService;
    private final TokenBlacklist tokenBlacklist;

    public AuthController(AuthService authService, TokenBlacklist tokenBlacklist) {
        this.authService = authService;
        this.tokenBlacklist = tokenBlacklist;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(
            @Valid @NotNull @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(
            loginRequest.getUsername(),
            loginRequest.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.getRefreshToken();
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Refresh token is required");
            }
            
            JwtResponse response = authService.refreshToken(refreshToken);
            log.info("Token refreshed successfully for user: {}", response.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (JwtTokenException e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error during token refresh", e);
            return ResponseEntity.status(500).body("An error occurred while refreshing token");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                // Invalidate the token
                authService.logout(token);
                
                // Clear the security context
                SecurityContextHolder.clearContext();
                
                log.info("User logged out successfully");
                return ResponseEntity.ok().body("Logged out successfully");
            }
            return ResponseEntity.badRequest().body("Invalid authorization header");
            
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.internalServerError().body("An error occurred during logout");
        }
    }
    
    @GetMapping("/check-session")
    public ResponseEntity<Boolean> checkSession(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (tokenBlacklist.isBlacklisted(token)) {
                    log.debug("Token is blacklisted");
                    return ResponseEntity.ok(false);
                }
            }
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAuthenticated = authentication != null 
                && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal());
                
            log.debug("Session check - isAuthenticated: {}", isAuthenticated);
            return ResponseEntity.ok(isAuthenticated);
            
        } catch (Exception e) {
            log.error("Error checking session", e);
            return ResponseEntity.ok(false);
        }
    }
}
