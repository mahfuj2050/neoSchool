package com.rufan.fullstackbackend.service;


import org.springframework.stereotype.Service;

import com.rufan.fullstackbackend.model.Student;
import com.rufan.fullstackbackend.model.Subject;
import com.rufan.fullstackbackend.repository.StudentRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Create or Update Student
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    // Get All Students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

 // Get by database primary key
    public Optional<Student> getStudentByDbId(Long id) {
        return studentRepository.findById(id);
    }

    // Get by actual studentId field (like 2023001)
    public Optional<Student> getStudentByStudentId(Long studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    
    // Get Student by Roll No
    public Optional<Student> getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo);
    }

    // Get Student by BRN No
    public Optional<Student> getStudentByBrnNo(String brnNo) {
        return studentRepository.findByBrnNo(brnNo);
    }

    // Delete Student by ID (primary key)
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
    
    

}
