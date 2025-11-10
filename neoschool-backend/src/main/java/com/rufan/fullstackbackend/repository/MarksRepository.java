package com.rufan.fullstackbackend.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rufan.fullstackbackend.model.ExamMarks;
import com.rufan.fullstackbackend.model.Marks;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {

    // Get all marks for a specific student
    List<Marks> findByStudentId(Long studentId);
    List<Marks> findByClassName(String className);
    List<Marks> findByExamName(String examName);

    @Query("SELECT m FROM Marks m WHERE m.studentId = :studentId AND m.examName = :examName")
    Optional<Marks> findByStudentIdAndExamName(@Param("studentId") Long studentId, @Param("examName") String examName);

    List<Marks> findByClassNameAndExamName(String className, String examName);
    List<Marks> findAllByClassNameAndExamNameOrderByObtainedMarksDesc(String className, String examName);
    List<Marks> findAllByStudentIdOrderByExamDateAsc(Long studentId);
    List<Marks> findAllByClassNameAndExamNameOrderByClassRollAsc(String className, String examName);
    
    // Find by class name containing (partial match)
    @Query("SELECT m FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :className, '%'))")
    List<Marks> findByClassNameContaining(@Param("className") String className);
    
    // Flexible search methods
    @Query("SELECT m FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :className, '%')) AND m.examName = :examName")
    List<Marks> findByClassNameContainingAndExamName(@Param("className") String className, @Param("examName") String examName);
    
    @Query("SELECT m FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :className, '%')) AND LOWER(m.examName) LIKE LOWER(concat('%', :examName, '%'))")
    List<Marks> findByClassNameContainingAndExamNameContaining(
        @Param("className") String className, 
        @Param("examName") String examName
    );
    
    @Query("SELECT DISTINCT m.className FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :query, '%'))")
    List<String> findDistinctClassNames(@Param("query") String query);
    
    @Query("SELECT DISTINCT m.examName FROM Marks m WHERE LOWER(m.examName) LIKE LOWER(concat('%', :query, '%'))")
    List<String> findDistinctExamNames(@Param("query") String query);
    
    // Find by class name, exam name and year from examDate
    @Query("SELECT m FROM Marks m WHERE m.className = :className AND m.examName = :examName AND YEAR(m.examDate) = :year")
    List<Marks> findByClassNameAndExamNameAndYear(
        @Param("className") String className, 
        @Param("examName") String examName, 
        @Param("year") int year
    );
    
    // Find by class name (containing), exam name and year from examDate
    @Query("SELECT m FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :className, '%')) AND m.examName = :examName AND YEAR(m.examDate) = :year")
    List<Marks> findByClassNameContainingAndExamNameAndYear(
        @Param("className") String className, 
        @Param("examName") String examName,
        @Param("year") int year
    );
    
    // Find by class name (containing), exam name (containing) and year from examDate
    @Query("SELECT m FROM Marks m WHERE LOWER(m.className) LIKE LOWER(concat('%', :className, '%')) AND LOWER(m.examName) LIKE LOWER(concat('%', :examName, '%')) AND YEAR(m.examDate) = :year")
    List<Marks> findByClassNameContainingAndExamNameContainingAndYear(
        @Param("className") String className, 
        @Param("examName") String examName,
        @Param("year") int year
    );
}

