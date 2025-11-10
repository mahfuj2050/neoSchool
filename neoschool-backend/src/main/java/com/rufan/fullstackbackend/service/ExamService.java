package com.rufan.fullstackbackend.service;


import java.util.List;
import java.util.Optional;

import com.rufan.fullstackbackend.model.Exam;
import com.rufan.fullstackbackend.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;

    public Exam saveExam(Exam exam) {
        return examRepository.save(exam);
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    public Exam updateExam(Long id, Exam exam) {
        exam.setId(id);
        return examRepository.save(exam);
    }

    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }
}
