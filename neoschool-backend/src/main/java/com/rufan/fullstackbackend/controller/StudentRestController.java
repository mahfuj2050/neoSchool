package com.rufan.fullstackbackend.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rufan.fullstackbackend.model.Student;
import com.rufan.fullstackbackend.service.StudentService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
public class StudentRestController {

    private final StudentService studentService;

    public StudentRestController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

 // Get student by DB id
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        Optional<Student> student = studentService.getStudentByDbId(id);
        return student.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }


    // Get student by roll number (e.g., STU2023001)
    @GetMapping("/rollno/{rollNo}")
    public ResponseEntity<Student> getStudentByRollNo(@PathVariable String rollNo) {
        Optional<Student> student = studentService.getStudentByRollNo(rollNo);
        return student.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
    }

    // Create student
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Optional<Student> optionalStudent = studentService.getStudentByDbId(id);

        if (optionalStudent.isPresent()) {
            Student student = optionalStudent.get();
            student.setStudentId(studentDetails.getStudentId());
            student.setRollNo(studentDetails.getRollNo());
            student.setName(studentDetails.getName());
            student.setStudentClass(studentDetails.getStudentClass());
            student.setSection(studentDetails.getSection());
            student.setGender(studentDetails.getGender());
            student.setStatus(studentDetails.getStatus());
            student.setDob(studentDetails.getDob());
            student.setBrnNo(studentDetails.getBrnNo());
            student.setPhone(studentDetails.getPhone());
            student.setStipend(studentDetails.getStipend());

            return ResponseEntity.ok(studentService.saveStudent(student));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
