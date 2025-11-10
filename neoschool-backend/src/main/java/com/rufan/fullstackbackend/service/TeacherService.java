package com.rufan.fullstackbackend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rufan.fullstackbackend.model.Teacher;
import com.rufan.fullstackbackend.repository.TeacherRepository;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    @Autowired
    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    // Create or Update teacher
    public Teacher saveTeacher(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    // Get all teachers
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // Get teacher by ID (Long)
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    // Get teacher by teacherId (string)
    public Optional<Teacher> getTeacherByTeacherId(String teacherId) {
        return teacherRepository.findByTeacherId(teacherId);
    }

    // Delete teacher by ID
    public void deleteTeacherById(Long id) {
        teacherRepository.deleteById(id);
    }

    // Check if email exists
    public boolean existsByEmail(String email) {
        return teacherRepository.existsByEmail(email);
    }

    // Check if teacherId exists
    public boolean existsByTeacherId(String teacherId) {
        return teacherRepository.existsByTeacherId(teacherId);
    }

    // Get teachers by section
    public List<Teacher> getTeachersBySection(String section) {
        return teacherRepository.findBySection(section);
    }
}
