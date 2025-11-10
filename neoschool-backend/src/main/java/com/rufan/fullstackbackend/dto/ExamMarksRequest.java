package com.rufan.fullstackbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class ExamMarksRequest {
    private Long studentId;
    private String studentName;
    private String className;
    private Integer classRoll;
    private String examName;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSX")
    private OffsetDateTime examDate;
    private List<SubjectMarksDto> subjects; // <-- change from array to List
    private Double totalMarks;
    private Double marksPercentage;
    private String remarks;
}

