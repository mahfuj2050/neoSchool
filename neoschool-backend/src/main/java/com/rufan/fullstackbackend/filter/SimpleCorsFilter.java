package com.rufan.fullstackbackend.filter;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SimpleCorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        // Get the origin from the request
        String origin = request.getHeader("Origin");
        // List of allowed origins
        String[] allowedOrigins = {
            "http://localhost:3000",
            "http://172.21.224.1:3000",
            "http://localhost:8080",
            "http://localhost:8081"
        };
        
        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            // Set allowed headers including 'expires'
            response.setHeader("Access-Control-Allow-Headers", "authorization, content-type, xsrf-token, x-requested-with, cache-control, pragma, accept, expires");
        } else {
            // For actual requests, set the allowed origin
            if (origin != null && Arrays.asList(allowedOrigins).contains(origin)) {
                response.setHeader("Access-Control-Allow-Origin", origin);
            }
        }
        
        // Common CORS headers for all responses
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type, Authorization, expires");
        
        // Add Vary header to prevent caching of CORS responses
        response.setHeader("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
        
        if ("OPTIONS".equals(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // Initialization code if needed
    }

    @Override
    public void destroy() {
        // Cleanup code if needed
    }
}
