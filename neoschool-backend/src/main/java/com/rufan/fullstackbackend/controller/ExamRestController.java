package com.rufan.fullstackbackend.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rufan.fullstackbackend.model.Exam;
import com.rufan.fullstackbackend.service.ExamService;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamRestController {

	
    private final ExamService examService;

    @Autowired
    public ExamRestController(ExamService examService) {
        this.examService = examService;
    }

    // Create
    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
        Exam saved = examService.saveExam(exam);
        return ResponseEntity.ok(saved);
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        return examService.getExamById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam updated = examService.updateExam(id, exam);
        return ResponseEntity.ok(updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }
}
