package com.rufan.fullstackbackend.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // primary key (auto-generated)

    @Column(name = "exam_id", nullable = false, unique = true)
    private String examId;  // e.g., EXAM2025001

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "remarks")
    private String remarks;
}
