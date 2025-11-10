package com.rufan.fullstackbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rufan.fullstackbackend.model.Student;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(Long studentId);

    Optional<Student> findByRollNo(String rollNo);

    Optional<Student> findByBrnNo(String brnNo);
}
