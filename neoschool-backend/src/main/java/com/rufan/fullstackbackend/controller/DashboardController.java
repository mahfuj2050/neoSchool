package com.rufan.fullstackbackend.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest; // Assuming you are using Jakarta EE (Spring Boot 3+)
import com.rufan.fullstackbackend.repository.StudentRepository;
import com.rufan.fullstackbackend.repository.TeacherRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        
     // Cast RequestAttributes to ServletRequestAttributes to get access to the actual request
     ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
     HttpServletRequest request = attributes.getRequest();
     
     // --- Logging Updates Start ---
     
     // Log incoming request (using request details directly)
     log.info("Received request to {} {}", request.getMethod(), request.getRequestURI());
     
     // Log details for debugging
     log.debug("Client IP: {}", request.getRemoteAddr());
     log.debug("User-Agent header: {}", request.getHeader("User-Agent"));
     
     // Logging ALL headers for comprehensive debugging (optional but useful)
     if (log.isDebugEnabled()) {
         Map<String, String> headersMap = new HashMap<>();
         Enumeration<String> headerNames = request.getHeaderNames();
         while (headerNames.hasMoreElements()) {
             String headerName = headerNames.nextElement();
             headersMap.put(headerName, request.getHeader(headerName));
         }
         log.debug("Request Headers: {}", headersMap);
     }
     
     // --- Logging Updates End ---

        
        Map<String, Object> stats = new HashMap<>();
        long startTime = System.currentTimeMillis();
        
        try {
            // Get total students count
            long totalStudents = studentRepository.count();
            log.debug("Total students: {}", totalStudents);
            
            // Get total teachers count
            long totalTeachers = teacherRepository.count();
            log.debug("Total teachers: {}", totalTeachers);
            
            stats.put("totalStudents", totalStudents);
            stats.put("totalTeachers", totalTeachers);
            stats.put("timestamp", LocalDateTime.now().toString());
            
            // Log successful response
            log.info("Request processed successfully in {} ms", 
                    System.currentTimeMillis() - startTime);
            log.debug("Response data: {}", stats);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            log.error("Error processing dashboard stats request", e);
            stats.put("error", "Failed to fetch dashboard statistics");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(stats);
        }
    }
}