package com.rufan.fullstackbackend.dto;

import java.util.LinkedHashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResultRow {
	   private String studentId;
	    private String studentName;
	    private String className;
	    private String section;
	    private int roll;
	    private int totalMarks;   // ✅ New field
	    private int meritPosition; // ✅ New field

    // Dynamic subject marks
    private Map<String, SubjectMarks> subjectsMap = new LinkedHashMap<>();

    // Totals
    private double totalObtainedMarks;
    private double totalFullMarks;
    private double percentage;
    private String letterGrade;
    private double gradePoint;
    private int position;
    private String remarks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectMarks {
        private String subjectName;
        private double caMarks;
        private double aaMarks;
        private double totalMarks;
        private String grade;
        private double gradePoint;
        private String remarks;

        public static SubjectMarks of(String subjectName, double caMarks, double aaMarks, double totalMarks) {
            double percentage = totalMarks > 0 ? (caMarks + aaMarks) / totalMarks * 100 : 0;
            return SubjectMarks.builder()
                    .subjectName(subjectName)
                    .caMarks(caMarks)
                    .aaMarks(aaMarks)
                    .totalMarks(totalMarks)
                    .grade(TabulationSheetDto.calculateLetterGrade(percentage))
                    .gradePoint(TabulationSheetDto.calculateGradePoint(percentage))
                    .build();
        }
    }
}
