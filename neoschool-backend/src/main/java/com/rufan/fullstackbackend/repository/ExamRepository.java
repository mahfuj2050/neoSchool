package com.rufan.fullstackbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rufan.fullstackbackend.model.Exam;

// Exam Repository
@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    Exam findByExamId(String examId);
}
