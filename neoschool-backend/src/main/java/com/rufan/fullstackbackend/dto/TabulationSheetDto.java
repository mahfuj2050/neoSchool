package com.rufan.fullstackbackend.dto;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TabulationSheetDto {

    private String schoolName;
    private String schoolAddress;
    private String emisCode;
    private String className;
    private String sectionName;
    private String examName;
    private String examYear;
    private List<StudentResultRow> studentResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentResultRow {
        private Long studentId;
        private String studentName;
        private String rollNo;

        // <--- Dynamic subjects map
        private Map<String, SubjectMarks> subjectsMap = new LinkedHashMap<>();

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

            public static SubjectMarks of(String subjectName, double caMarks, double aaMarks) {
                double total = caMarks + aaMarks;
                double percentage = total; // Since total is out of 100
                return SubjectMarks.builder()
                        .subjectName(subjectName)
                        .caMarks(caMarks)
                        .aaMarks(aaMarks)
                        .totalMarks(total)
                        .grade(TabulationSheetDto.calculateLetterGrade(percentage))
                        .gradePoint(TabulationSheetDto.calculateInterpolatedGradePoint(percentage))
                        .build();
            }
        }
    }

    public static String calculateLetterGrade(double percentage) {
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "A-";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        if (percentage >= 33) return "D";
        return "F";
    }

    public static double calculateGradePoint(double percentage) {
        if (percentage >= 80) return 5.0;
        if (percentage >= 70) return 4.0;
        if (percentage >= 60) return 3.5;
        if (percentage >= 50) return 3.0;
        if (percentage >= 40) return 2.0;
        if (percentage >= 33) return 1.0;
        return 0.0;
    }
    
    // Calculate interpolated grade points for more precise grading
    public static double calculateInterpolatedGradePoint(double percentage) {
        // Linear interpolation between grade boundaries
        if (percentage >= 80) return 5.0;
        if (percentage >= 70) return 4.0 + (percentage - 70) / 10.0; // 4.0 → 5.0
        if (percentage >= 60) return 3.5 + (percentage - 60) / 10.0 * 0.5;
        if (percentage >= 50) return 3.0 + (percentage - 50) / 10.0 * 0.5;
        if (percentage >= 40) return 2.0 + (percentage - 40) / 10.0 * 1.0;
        if (percentage >= 33) return 1.0 + (percentage - 33) / 7.0 * 1.0;
        return 0.0;
    }
}
