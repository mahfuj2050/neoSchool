package com.rufan.fullstackbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private String username;
    private List<String> roles;
    private Long expiresIn;

    public JwtResponse(String token, String refreshToken, String username, List<String> roles, Long expiresIn) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.roles = roles;
        this.expiresIn = expiresIn;
    }

    public JwtResponse(String token, String username, List<String> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }
}
