package com.rufan.fullstackbackend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rufan.fullstackbackend.model.Teacher;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    // Find teacher by auto-generated string ID
    Optional<Teacher> findByTeacherId(String teacherId);

    // Find teacher by email
    Optional<Teacher> findByEmail(String email);

    // Check if email exists
    boolean existsByEmail(String email);

    // Check if teacherId exists
    boolean existsByTeacherId(String teacherId);

    // Optional: find teachers by section
    List<Teacher> findBySection(String section);
}
