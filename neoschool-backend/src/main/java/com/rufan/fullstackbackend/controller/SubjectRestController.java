package com.rufan.fullstackbackend.controller;


import com.rufan.fullstackbackend.model.Subject;
import com.rufan.fullstackbackend.model.Subject.ClassLevel;
import com.rufan.fullstackbackend.model.Subject.SubjectStatus;
import com.rufan.fullstackbackend.model.Subject.TeacherName;
import com.rufan.fullstackbackend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // ✅ allow React frontend
public class SubjectRestController {

    private final SubjectService subjectService;

    // ✅ Create Subject
    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.saveSubject(subject));
    }

    // ✅ Get All Subjects
    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    // ✅ Get Subject by ID
    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable Long id) {
        return subjectService.getSubjectById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Update Subject
    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id, @RequestBody Subject updatedSubject) {
        return subjectService.getSubjectById(id)
                .map(subject -> {
                    updatedSubject.setId(id);
                    return ResponseEntity.ok(subjectService.saveSubject(updatedSubject));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Delete Subject
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Search by Code
    @GetMapping("/code/{code}")
    public ResponseEntity<Subject> getByCode(@PathVariable String code) {
        return subjectService.getByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Filter by Class Level
    @GetMapping("/class/{classLevel}")
    public ResponseEntity<List<Subject>> getByClassLevel(@PathVariable ClassLevel classLevel) {
        return ResponseEntity.ok(subjectService.getByClassLevel(classLevel));
    }

    // ✅ Filter by Teacher
    @GetMapping("/teacher/{teacher}")
    public ResponseEntity<List<Subject>> getByTeacher(@PathVariable TeacherName teacher) {
        return ResponseEntity.ok(subjectService.getByTeacher(teacher));
    }

    // ✅ Filter by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Subject>> getByStatus(@PathVariable SubjectStatus status) {
        return ResponseEntity.ok(subjectService.getByStatus(status));
    }

    // ✅ Search by Name
    @GetMapping("/search")
    public ResponseEntity<List<Subject>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(subjectService.searchByName(name));
    }
}
