package com.rufan.fullstackbackend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rufan.fullstackbackend.model.Grade;
import com.rufan.fullstackbackend.service.GradeService;

import java.util.List;

@RestController
@RequestMapping("/api/grades")
public class GradeRestController {

    private final GradeService gradeService;

    @Autowired
    public GradeRestController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    // Create
    @PostMapping
    public ResponseEntity<Grade> createGrade(@RequestBody Grade grade) {
        Grade saved = gradeService.saveGrade(grade);
        return ResponseEntity.ok(saved);
    }

    // Read all
    @GetMapping
    public ResponseEntity<List<Grade>> getAllGrades() {
        return ResponseEntity.ok(gradeService.getAllGrades());
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<Grade> getGradeById(@PathVariable Long id) {
        return gradeService.getGradeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Grade> updateGrade(@PathVariable Long id, @RequestBody Grade grade) {
        Grade updated = gradeService.updateGrade(id, grade);
        return ResponseEntity.ok(updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}
