package com.rufan.fullstackbackend.service;


import com.rufan.fullstackbackend.model.Subject;
import com.rufan.fullstackbackend.model.Subject.ClassLevel;
import com.rufan.fullstackbackend.model.Subject.SubjectStatus;
import com.rufan.fullstackbackend.model.Subject.TeacherName;
import com.rufan.fullstackbackend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    // ✅ Create / Update Subject
    public Subject saveSubject(Subject subject) {
        return subjectRepository.save(subject);
    }

    // ✅ Get All Subjects
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // ✅ Get Subject by ID
    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }

    // ✅ Delete Subject
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }

    // ✅ Find by Code
    public Optional<Subject> getByCode(String code) {
        return subjectRepository.findByCode(code);
    }

    // ✅ Find by Class Level
    public List<Subject> getByClassLevel(ClassLevel classLevel) {
        return subjectRepository.findByClassLevel(classLevel);
    }

    // ✅ Find by Teacher
    public List<Subject> getByTeacher(TeacherName teacher) {
        return subjectRepository.findByTeacher(teacher);
    }

    // ✅ Find by Status
    public List<Subject> getByStatus(SubjectStatus status) {
        return subjectRepository.findByStatus(status);
    }

    // ✅ Search by Name
    public List<Subject> searchByName(String name) {
        return subjectRepository.findByNameContainingIgnoreCase(name);
    }
}
