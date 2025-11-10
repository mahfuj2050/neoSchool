package com.rufan.fullstackbackend.repository;

import com.rufan.fullstackbackend.model.School;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolRepository extends JpaRepository<School, Long> {
    // You can add custom query methods here if needed
}
