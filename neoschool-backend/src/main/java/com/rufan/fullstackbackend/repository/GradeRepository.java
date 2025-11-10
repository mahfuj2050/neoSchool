package com.rufan.fullstackbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.rufan.fullstackbackend.model.Grade;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {

    // Find by gradeId (custom field)
    Optional<Grade> findByGradeId(String gradeId);

    // Find by gradeLetter
    Optional<Grade> findByGradeLetter(String gradeLetter);
    
    @Query("SELECT g FROM Grade g WHERE :percentage BETWEEN g.rangeMin AND g.rangeMax")
    Optional<Grade> findByPercentage(@Param("percentage") double percentage);

    // Find all grades ordered by rangeMin in descending order
    List<Grade> findAllByOrderByRangeMinDesc();

    // Find the next grade with a higher rangeMin (used for interpolation)
    List<Grade> findByRangeMinGreaterThanOrderByRangeMinAsc(double rangeMin);
    
    // Find all grades ordered by rangeMin in ascending order
    List<Grade> findAllByOrderByRangeMinAsc();
}
