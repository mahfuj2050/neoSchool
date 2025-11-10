package com.rufan.fullstackbackend.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMarks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(name = "class_name", nullable = false, length = 50)
    private String className;

    @Column(name = "class_roll", nullable = false)
    private Integer classRoll;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "subject_marks")
    private Double subjectMarks;

    @Column(name = "exam_name", nullable = false, length = 100)
    private String examName;

    @Column(name = "continuous_assessment_marks")
    private Double continuousAssessmentMarks;

    @Column(name = "aggregate_assessment_marks")
    private Double aggregateAssessmentMarks;

    @Column(name = "total_marks")
    private Double totalMarks;

    @Column(name = "marks_percentage")
    private Double marksPercentage;
    
    @Column(name = "exam_date", updatable = false)
    private LocalDateTime examDate;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
