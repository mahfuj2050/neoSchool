package com.rufan.fullstackbackend.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.rufan.fullstackbackend.model.Grade;
import lombok.RequiredArgsConstructor;
import com.rufan.fullstackbackend.repository.GradeRepository;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;

    // Save a grade
    public Grade saveGrade(Grade grade) {
        return gradeRepository.save(grade);
    }

    // Get all grades
    public List<Grade> getAllGrades() {
        List<Grade> grades = gradeRepository.findAll();
        System.out.println("Returning grades: " + grades);
        return grades;
    }

    // Get grade by database ID
    public Optional<Grade> getGradeById(Long id) {
        return gradeRepository.findById(id);
    }

    // Get grade by gradeId (custom field)
    public Optional<Grade> getGradeByGradeId(String gradeId) {
        return gradeRepository.findByGradeId(gradeId);
    }

    // Get grade by gradeLetter
    public Optional<Grade> getGradeByLetter(String gradeLetter) {
        return gradeRepository.findByGradeLetter(gradeLetter);
    }

    // Update a grade
    public Grade updateGrade(Long id, Grade grade) {
        grade.setId(id);
        return gradeRepository.save(grade);
    }

    // Delete a grade
    public void deleteGrade(Long id) {
        gradeRepository.deleteById(id);
    }
}
