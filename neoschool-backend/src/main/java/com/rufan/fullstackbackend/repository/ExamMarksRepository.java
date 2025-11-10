package com.rufan.fullstackbackend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rufan.fullstackbackend.model.ExamMarks;

import java.util.List;

@Repository
public interface ExamMarksRepository extends JpaRepository<ExamMarks, Long> {
    List<ExamMarks> findByStudentId(Long studentId);
    List<ExamMarks> findByClassName(String className);
    List<ExamMarks> findByExamName(String examName);
}
