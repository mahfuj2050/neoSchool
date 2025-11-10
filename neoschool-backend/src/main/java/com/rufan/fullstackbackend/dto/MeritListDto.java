package com.rufan.fullstackbackend.dto;


public class MeritListDto {
	
    private Long studentId;
    private String studentName;
    private Integer rollNo;
    private String className;
    private String sectionName;

    private Double totalMarks;
    private Double obtainedMarks;
    private Double percentage;
    private String letterGrade;
    private Double gradePoint;

    private Integer position;   // 1st, 2nd, 3rd...



	public Long getStudentId() {
		return studentId;
	}

	public void setStudentId(Long studentId) {
		this.studentId = studentId;
	}

	public String getStudentName() {
		return studentName;
	}

	public void setStudentName(String studentName) {
		this.studentName = studentName;
	}

	public Integer getRollNo() {
		return rollNo;
	}

	public void setRollNo(Integer rollNo) {
		this.rollNo = rollNo;
	}

	public String getClassName() {
		return className;
	}

	public void setClassName(String className) {
		this.className = className;
	}

	public String getSectionName() {
		return sectionName;
	}

	public void setSectionName(String sectionName) {
		this.sectionName = sectionName;
	}

	public Double getTotalMarks() {
		return totalMarks;
	}

	public void setTotalMarks(Double totalMarks) {
		this.totalMarks = totalMarks;
	}

	public Double getObtainedMarks() {
		return obtainedMarks;
	}

	public void setObtainedMarks(Double obtainedMarks) {
		this.obtainedMarks = obtainedMarks;
	}

	public Double getPercentage() {
		return percentage;
	}

	public void setPercentage(Double percentage) {
		this.percentage = percentage;
	}

	public String getLetterGrade() {
		return letterGrade;
	}

	public void setLetterGrade(String letterGrade) {
		this.letterGrade = letterGrade;
	}

	public Double getGradePoint() {
		return gradePoint;
	}

	public void setGradePoint(Double gradePoint) {
		this.gradePoint = gradePoint;
	}

	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

    // getters and setters
    
    
}
