package com.rufan.fullstackbackend.service;

import com.rufan.fullstackbackend.dto.JwtResponse;
import com.rufan.fullstackbackend.exception.JwtTokenException;
import com.rufan.fullstackbackend.security.JwtTokenUtil;
import com.rufan.fullstackbackend.security.TokenBlacklist;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklist tokenBlacklist;

    public AuthService(AuthenticationManager authenticationManager,
                     JwtTokenUtil jwtTokenUtil,
                     UserDetailsService userDetailsService,
                     TokenBlacklist tokenBlacklist) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Transactional
    public JwtResponse authenticateUser(String username, String password) {
        try {
            // Authenticate the user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            // Get user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            // Generate JWT token and refresh token
            String token = jwtTokenUtil.generateToken(userDetails);
            String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
            
            // Get user roles
            List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
            
            // Get token expiration time
            long expiresIn = jwtTokenUtil.getExpirationTime() / 1000; // Convert to seconds
            
            log.info("User {} authenticated successfully with roles: {}", username, roles);
            
            return new JwtResponse(
                token,
                refreshToken,
                userDetails.getUsername(),
                roles.isEmpty() ? List.of("ROLE_USER") : roles,
                expiresIn
            );
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", username, e);
            throw new UsernameNotFoundException("Invalid username or password");
        }
    }
    
    @Transactional
    public JwtResponse refreshToken(String refreshToken) {
        try {
            // Validate the refresh token
            if (tokenBlacklist.isBlacklisted(refreshToken)) {
                throw new JwtTokenException("Refresh token has been invalidated");
            }
            
            // Extract username from refresh token
            String username = jwtTokenUtil.extractUsername(refreshToken);
            
            if (username != null) {
                // Load user details
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Validate refresh token
                if (jwtTokenUtil.validateToken(refreshToken, userDetails)) {
                    // Generate new access token
                    String newToken = jwtTokenUtil.generateToken(userDetails);
                    
                    // Generate new refresh token (optional: you might want to keep the same refresh token)
                    String newRefreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
                    
                    // Invalidate the old refresh token
                    tokenBlacklist.addToBlacklist(refreshToken);
                    
                    // Get user roles
                    List<String> roles = userDetails.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.toList());
                    
                    // Get token expiration time
                    long expiresIn = jwtTokenUtil.getExpirationTime() / 1000; // Convert to seconds
                    
                    log.info("Refreshed token for user: {}", username);
                    
                    return new JwtResponse(
                        newToken,
                        newRefreshToken,
                        userDetails.getUsername(),
                        roles,
                        expiresIn
                    );
                }
            }
            
            throw new JwtTokenException("Invalid refresh token");
            
        } catch (JwtTokenException e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error refreshing token", e);
            throw new JwtTokenException("Failed to refresh token");
        }
    }
    
    public void logout(String token) {
        // Add token to blacklist
        tokenBlacklist.addToBlacklist(token);
        log.info("User logged out. Token invalidated.");
    }
}
