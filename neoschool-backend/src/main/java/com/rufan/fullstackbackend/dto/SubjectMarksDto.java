package com.rufan.fullstackbackend.dto;


import lombok.Data;

@Data
public class SubjectMarksDto {
    private String subjectCode;
    private String subjectName;
    private Double caMarks;
    private Double aaMarks;
    private Double totalMarks;
}
