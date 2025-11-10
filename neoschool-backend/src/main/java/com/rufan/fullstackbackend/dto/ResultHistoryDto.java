package com.rufan.fullstackbackend.dto;

import java.time.LocalDateTime;

public class ResultHistoryDto {
    private String examName;
    private LocalDateTime examDate;
    private double obtainedMarks;
    private double totalMarks;
    private double percentage;
    private String letterGrade;
    private double gradePoint;

    public ResultHistoryDto() {
    }

    public ResultHistoryDto(String examName, LocalDateTime examDate, double obtainedMarks, 
                           double totalMarks, double percentage, String letterGrade, 
                           double gradePoint) {
        this.examName = examName;
        this.examDate = examDate;
        this.obtainedMarks = obtainedMarks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.letterGrade = letterGrade;
        this.gradePoint = gradePoint;
    }

    // Getters and Setters
    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public LocalDateTime getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDateTime examDate) {
        this.examDate = examDate;
    }

    public double getObtainedMarks() {
        return obtainedMarks;
    }

    public void setObtainedMarks(double obtainedMarks) {
        this.obtainedMarks = obtainedMarks;
    }

    public double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public String getLetterGrade() {
        return letterGrade;
    }

    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }

    public double getGradePoint() {
        return gradePoint;
    }

    public void setGradePoint(double gradePoint) {
        this.gradePoint = gradePoint;
    }
}
