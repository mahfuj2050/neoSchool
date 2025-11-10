package com.rufan.fullstackbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubjectMarkDto {
    private String subjectName;
    private Double obtainedMarks;
    private Double totalMarks;
    private String letterGrade;
    private Double gradePoint;
}
