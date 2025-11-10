package com.rufan.fullstackbackend.config;

import com.rufan.fullstackbackend.security.JwtRequestFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
        @Lazy JwtRequestFilter jwtRequestFilter,
        CorsConfigurationSource corsConfigurationSource
    ) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Configure CORS and disable CSRF
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Allow preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Allow all auth endpoints - must be before any other rules
                .requestMatchers(
                    "/api/auth/**",
                    "/api/public/**"
                ).permitAll()
                // Secure endpoints with role-based access
                .requestMatchers("/api/students/**").hasRole("ADMIN")
                .requestMatchers(
                    "/api/teachers/**",
                    "/api/subjects/**",
                    "/api/exam-marks/**",
                    "/api/marks/**",
                    "/api/exams/**",
                    "/api/grades/**",
                    "/api/results/**"
                ).hasAnyRole("ADMIN", "TEACHER")
                // Allow Swagger/OpenAPI (if you're using it)
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Everything else needs authentication
                .anyRequest().authenticated()
            )
            // Make sure we use stateless session; session won't be used to store user's state.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Add JWT token filter
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public InMemoryUserDetailsManager userDetailsService() {
        UserDetails admin = User.builder()
            .username("admin@gmail.com")
            .password(passwordEncoder().encode("admin123"))
            .roles("ADMIN")  
            .build();

        UserDetails teacher = User.builder()
            .username("teacher")
            .password(passwordEncoder().encode("teacher123"))
            .roles("TEACHER")  
            .build();

        UserDetails user = User.builder()
            .username("user")
            .password(passwordEncoder().encode("user123"))
            .roles("USER")  
            .build();

        return new InMemoryUserDetailsManager(admin, teacher, user);
    }

    // CORS configuration is now handled by the single corsConfigurationSource() method above
}
