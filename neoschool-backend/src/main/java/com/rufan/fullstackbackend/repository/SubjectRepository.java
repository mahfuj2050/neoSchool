package com.rufan.fullstackbackend.repository;


import com.rufan.fullstackbackend.model.Subject;
import com.rufan.fullstackbackend.model.Subject.ClassLevel;
import com.rufan.fullstackbackend.model.Subject.SubjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // Find by subject code (unique)
    Optional<Subject> findByCode(String code);

    // Find all by class level
    List<Subject> findByClassLevel(ClassLevel classLevel);

    // Find all by teacher
    List<Subject> findByTeacher(Subject.TeacherName teacher);

    // Find all active/inactive subjects
    List<Subject> findByStatus(SubjectStatus status);

    // Search subjects by name (case-insensitive contains)
    List<Subject> findByNameContainingIgnoreCase(String name);
}
