package com.rufan.fullstackbackend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "grades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grade_id", nullable = false, unique = true, length = 20)
    private String gradeId;

    @Column(name = "grade_letter", nullable = false, length = 5)
    private String gradeLetter;

    @Column(name = "grade_point", precision = 3, scale = 2, nullable = false) 
    private BigDecimal gradePoint; 
    // Example: 3.69, 4.00, etc. -> stored precisely in DB

    @Column(name = "range_min", nullable = false, columnDefinition = "DOUBLE")
    private Double rangeMin;

    @Column(name = "range_max", nullable = false, columnDefinition = "DOUBLE")
    private Double rangeMax;

    @Column(name = "remarks", length = 255)
    private String remarks;
}
