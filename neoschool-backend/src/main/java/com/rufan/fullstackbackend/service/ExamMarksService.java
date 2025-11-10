package com.rufan.fullstackbackend.service;


import org.springframework.stereotype.Service;

import com.rufan.fullstackbackend.model.ExamMarks;
import com.rufan.fullstackbackend.repository.ExamMarksRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ExamMarksService {

    private final ExamMarksRepository examMarksRepository;

    public ExamMarksService(ExamMarksRepository examMarksRepository) {
        this.examMarksRepository = examMarksRepository;
    }

    // Create or Update
    public ExamMarks saveExamMarks(ExamMarks examMarks) {
        return examMarksRepository.save(examMarks);
    }

    // Get All
    public List<ExamMarks> getAllExamMarks() {
        return examMarksRepository.findAll();
    }

    // Get By ID
    public Optional<ExamMarks> getExamMarksById(Long id) {
        return examMarksRepository.findById(id);
    }

    // Delete
    public void deleteExamMarks(Long id) {
        examMarksRepository.deleteById(id);
    }

    // Custom Finders
    public List<ExamMarks> getByStudentId(Long studentId) {
        return examMarksRepository.findByStudentId(studentId);
    }

    public List<ExamMarks> getByClassName(String className) {
        return examMarksRepository.findByClassName(className);
    }

    public List<ExamMarks> getByExamName(String examName) {
        return examMarksRepository.findByExamName(examName);
    }
}
