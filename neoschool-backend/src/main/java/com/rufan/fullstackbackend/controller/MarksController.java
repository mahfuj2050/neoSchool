package com.rufan.fullstackbackend.controller;



import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rufan.fullstackbackend.dto.ExamMarksRequest;
import com.rufan.fullstackbackend.dto.SubjectMarksDto;
import com.rufan.fullstackbackend.model.Grade;
import com.rufan.fullstackbackend.model.Marks;
import com.rufan.fullstackbackend.model.Student;
import com.rufan.fullstackbackend.repository.GradeRepository;
import com.rufan.fullstackbackend.service.MarksService;
import com.rufan.fullstackbackend.service.StudentService;

import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
@Slf4j
@RestController
@RequestMapping("/api/exam-marks")
public class MarksController {

    private final MarksService marksService;
    private final StudentService studentService;
    private final GradeRepository gradeRepository;
    

    // Constructor injection for both services
    public MarksController(MarksService marksService, StudentService studentService, GradeRepository gradeRepository) {
        this.marksService = marksService;
        this.studentService = studentService;
        this.gradeRepository = gradeRepository;
    }
    
    // Get Marks by Student ID
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Marks>> getByStudentId(@PathVariable("studentId") Long studentId) {
        List<Marks> marks = marksService.findByStudentId(studentId);
        return ResponseEntity.ok(marks);
    }
    
    
    
    @PostMapping("/bulk")
    public ResponseEntity<Marks> saveExamMarksBulk(@RequestBody ExamMarksRequest request) {
        log.info("🔥 Received bulk exam marks request: {}", request);

        if (request == null || request.getStudentId() == null) {
            log.error("❌ Invalid request or studentId is null");
            return ResponseEntity.badRequest().build();
        }

        // 1️⃣ Fetch student
        Long studentId = request.getStudentId();
        Optional<Student> studentOpt = studentService.getStudentByStudentId(studentId);
        if (studentOpt.isEmpty()) {
            log.error("❌ Student not found: {}", studentId);
            return ResponseEntity.badRequest().build();
        }
        Student student = studentOpt.get();

        int mainSubjectsCount = student.getMainSubject() != null ? student.getMainSubject() : 0;

        // 2️⃣ Define main subject codes
        Set<String> mainSubjectCodes = Set.of("bn", "en", "ma", "sc", "bwp", "ism", "hin");

        // 3️⃣ Prepare marks entity
        Marks marks = marksService.findByStudentAndExam(studentId, request.getExamName())
                .orElse(new Marks());

        // Convert OffsetDateTime to LocalDateTime for storage
        LocalDateTime examDateTime = request.getExamDate() != null 
            ? request.getExamDate().toLocalDateTime() 
            : LocalDateTime.now();

        marks.setStudentId(studentId);
        marks.setStudentName(student.getName());
        marks.setClassName(request.getClassName());
        marks.setClassRoll(request.getClassRoll());
        marks.setExamName(request.getExamName());
        marks.setExamDate(examDateTime);

        double obtainedMarks = 0.0;
        double mainSubjectsObtained = 0.0;
        double optionalSubjectsObtained = 0.0;

        if (request.getSubjects() != null) {
            for (SubjectMarksDto subject : request.getSubjects()) {
                if (subject == null) continue;
                
                // Get subject name and code
                String subjectName = subject.getSubjectName() != null ? subject.getSubjectName().trim() : "";
                String subjectCode = subject.getSubjectCode() != null ? subject.getSubjectCode().trim() : "";
                
                // Map subject name to code if code is not provided or empty
                if (subjectCode.isBlank() && !subjectName.isBlank()) {
                    subjectCode = mapSubjectCode(subjectName);
                    log.info("Mapped subject '{}' to code: {}", subjectName, subjectCode);
                }
                
                if (subjectCode == null || subjectCode.isBlank()) {
                    log.warn("Skipping subject with empty code and unmappable name: {}", subjectName);
                    continue;
                }

                double subjectTotal = subject.getTotalMarks() != null ? subject.getTotalMarks() : 0.0;
                
                // Track marks for main and optional subjects
                if (mainSubjectCodes.contains(subjectCode)) {
                    mainSubjectsObtained += subjectTotal;
                    obtainedMarks += subjectTotal;
                    log.debug("Added to main subjects - Code: {}, Marks: {}", subjectCode, subjectTotal);
                } else {
                    optionalSubjectsObtained += subjectTotal;
                    log.debug("Added to optional subjects - Code: {}, Marks: {}", subjectCode, subjectTotal);
                }

                // Get CA and AA marks with null checks and default to 0.0
                Double caMarks = subject.getCaMarks() != null ? subject.getCaMarks() : 0.0;
                Double aaMarks = subject.getAaMarks() != null ? subject.getAaMarks() : 0.0;
                
                // Ensure subjectTotal is the sum of CA and AA marks if not provided
                if (subjectTotal == 0.0) {
                    subjectTotal = caMarks + aaMarks;
                }
                
                log.debug("Processing subject - Name: {}, Code: {}, CA: {}, AA: {}, Total: {}", 
                    subjectName, subjectCode, caMarks, aaMarks, subjectTotal);
                
                // Save marks per subject using the determined code
                switch (subjectCode) {
                    case "bn" -> {
                        marks.setBnSubCode("bn");
                        marks.setBanglaCa(caMarks);
                        marks.setBanglaAa(aaMarks);
                        marks.setBanglaTotal(subjectTotal);
                        log.debug("Set Bengali marks - CA: {}, AA: {}, Total: {}", 
                                marks.getBanglaCa(), marks.getBanglaAa(), marks.getBanglaTotal());
                    }
                    case "en" -> {
                        marks.setEnSubCode("en");
                        marks.setEnglishCa(caMarks);
                        marks.setEnglishAa(aaMarks);
                        marks.setEnglishTotal(subjectTotal);
                        log.debug("Set English marks - CA: {}, AA: {}, Total: {}", 
                                marks.getEnglishCa(), marks.getEnglishAa(), marks.getEnglishTotal());
                    }
                    case "ma" -> {
                        marks.setMaSubCode("ma");
                        marks.setMathCa(caMarks);
                        marks.setMathAa(aaMarks);
                        marks.setMathTotal(subjectTotal);
                        log.debug("Set Math marks - CA: {}, AA: {}, Total: {}", 
                                marks.getMathCa(), marks.getMathAa(), marks.getMathTotal());
                    }
                    case "sc" -> {
                        marks.setScSubCode("sc");
                        marks.setScienceCa(caMarks);
                        marks.setScienceAa(aaMarks);
                        marks.setScienceTotal(subjectTotal);
                        log.debug("Set Science marks - CA: {}, AA: {}, Total: {}", 
                                marks.getScienceCa(), marks.getScienceAa(), marks.getScienceTotal());
                    }
                    case "bwp" -> {
                        marks.setBwpSubCode("bwp");
                        marks.setBwpCa(caMarks);
                        marks.setBwpAa(aaMarks);
                        marks.setBwpTotal(subjectTotal);
                        log.debug("Set BWP marks - CA: {}, AA: {}, Total: {}", 
                                marks.getBwpCa(), marks.getBwpAa(), marks.getBwpTotal());
                    }
                    case "ism" -> {
                        marks.setIsmSubCode("ism");
                        marks.setIslamCa(caMarks);
                        marks.setIslamAa(aaMarks);
                        marks.setIslamTotal(subjectTotal);
                        log.debug("Set Islam marks - CA: {}, AA: {}, Total: {}", 
                                marks.getIslamCa(), marks.getIslamAa(), marks.getIslamTotal());
                    }
                    case "hin" -> {
                        marks.setHinSubCode("hin");
                        marks.setHinduCa(caMarks);
                        marks.setHinduAa(aaMarks);
                        marks.setHinduTotal(subjectTotal);
                        log.debug("Set Hindu marks - CA: {}, AA: {}, Total: {}", 
                                marks.getHinduCa(), marks.getHinduAa(), marks.getHinduTotal());
                    }
                    case "sss" -> {
                        marks.setSssSubCode("sss");
                        marks.setSssCa(caMarks);
                        marks.setSssAa(aaMarks);
                        marks.setSssTotal(subjectTotal);
                        log.debug("Set SSS marks - CA: {}, AA: {}, Total: {}", 
                                marks.getSssCa(), marks.getSssAa(), marks.getSssTotal());
                    }
                    case "mus" -> {
                        marks.setMusSubCode("mus");
                        marks.setMusicPhyCa(caMarks);
                        marks.setMusicPhyAa(aaMarks);
                        marks.setMusicTotal(subjectTotal);
                        log.debug("Set Music marks - CA: {}, AA: {}, Total: {}", 
                                marks.getMusicPhyCa(), marks.getMusicPhyAa(), marks.getMusicTotal());
                    }
                    case "art" -> {
                        marks.setArtSubCode("art");
                        marks.setArtCraftCa(caMarks);
                        marks.setArtCraftAa(aaMarks);
                        marks.setArtTotal(subjectTotal);
                        log.debug("Set Art marks - CA: {}, AA: {}, Total: {}", 
                                marks.getArtCraftCa(), marks.getArtCraftAa(), marks.getArtTotal());
                    }
                    case "fa" -> {
                        marks.setFaSubCode("fa");
                        marks.setFineArtCa(caMarks);
                        marks.setFineArtAa(aaMarks);
                        marks.setFaTotal(subjectTotal);
                        log.debug("Set Fine Art marks - CA: {}, AA: {}, Total: {}", 
                                marks.getFineArtCa(), marks.getFineArtAa(), marks.getFaTotal());
                    }
                    case "phy" -> {
                        // Handle Physical Education
                        marks.setPhySubCode("phy");
                        marks.setPhyEduCa(caMarks);
                        marks.setPhyEduAa(aaMarks);
                        marks.setPhyTotal(subjectTotal);
                        log.info("Set Physical Education marks - CA: {}, AA: {}, Total: {}", 
                                marks.getPhyEduCa(), marks.getPhyEduAa(), marks.getPhyTotal());
                    }
                    default -> {
                        log.warn("Unknown subject code: {}", subjectCode);
                    }
                }
            }
        }

     // 4️⃣ Optional subjects
        SubjectMarksDto[] subjectsArray = request.getSubjects() != null ? 
            request.getSubjects().toArray(new SubjectMarksDto[0]) : new SubjectMarksDto[0];

        // Get all subjects that are not in mainSubjectCodes or are explicitly marked as optional
        SubjectMarksDto[] optionalSubjectsArray = java.util.Arrays.stream(subjectsArray)
                .filter(Objects::nonNull)
                .filter(s -> {
                    String subjectName = s.getSubjectName() != null ? s.getSubjectName().trim() : "";
                    String subjectCode = s.getSubjectCode() != null ? s.getSubjectCode().trim() : "";
                    
                    // If subject code is empty, try to get it from the subject name
                    if (subjectCode.isBlank() && !subjectName.isBlank()) {
                        subjectCode = mapSubjectCode(subjectName);
                    }
                    
                    if (subjectCode == null || subjectCode.isBlank()) {
                        log.warn("Skipping subject with empty code and unmappable name: {}", subjectName);
                        return false;
                    }
                    
                    // Check if this is a physical education subject (should be optional)
                    boolean isPhy = "phy".equalsIgnoreCase(subjectCode) || 
                                 subjectName.contains("শারীরিক শিক্ষা") || 
                                 subjectName.contains("Physical");
                    
                    // Include if not in main subjects or is physical education
                    boolean include = !mainSubjectCodes.contains(subjectCode) || isPhy;
                    
                    if (isPhy) {
                        log.info("Including physical education as optional subject: {} ({})", subjectName, subjectCode);
                    }
                    
                    return include;
                })
                .toArray(SubjectMarksDto[]::new);

        int optionalSubjectsCount = optionalSubjectsArray.length; // use length for array



        // 5️⃣ Calculate totals and percentage
        // Update mainSubjectsCount based on actual main subjects found
        mainSubjectsCount = (int) java.util.Arrays.stream(subjectsArray)
                .filter(Objects::nonNull)
                .filter(s -> s.getSubjectCode() != null && !s.getSubjectCode().isBlank())
                .map(s -> mapSubjectCode(s.getSubjectCode()))
                .filter(Objects::nonNull)
                .filter(mainSubjectCodes::contains)
                .count();
                
        // Calculate main subject total (all main subjects)
        double mainSubjectTotal = mainSubjectsCount * 100.0;
        
        // Calculate main subjects obtained (sum of all main subject marks)
        mainSubjectsObtained = java.util.Arrays.stream(subjectsArray)
            .filter(Objects::nonNull)
            .filter(s -> {
                String code = s.getSubjectCode() != null ? s.getSubjectCode().trim() : "";
                if (code.isBlank() && s.getSubjectName() != null) {
                    code = mapSubjectCode(s.getSubjectName().trim());
                }
                return code != null && mainSubjectCodes.contains(code);
            })
            .mapToDouble(s -> s.getTotalMarks() != null ? s.getTotalMarks() : 0.0)
            .sum();

        // For optional subjects, take top 3 marks out of all optional subjects
        double[] optionalMarks = java.util.Arrays.stream(optionalSubjectsArray)
            .filter(Objects::nonNull)
            .mapToDouble(s -> s.getTotalMarks() != null ? s.getTotalMarks() : 0.0)
            .boxed()
            .sorted(java.util.Collections.reverseOrder())
            .limit(3)
            .mapToDouble(Double::doubleValue)
            .toArray();
            
        // Calculate total obtained from optional subjects (top 3)
        optionalSubjectsObtained = java.util.Arrays.stream(optionalMarks).sum();
            
        // Calculate total marks and obtained marks
        double totalMarks = (6 * 100) + (3 * 50); // 600 (main) + 150 (optional) = 750
        obtainedMarks = mainSubjectsObtained + optionalSubjectsObtained;
        
        // Log detailed information for debugging
        log.info("Main Subjects Obtained: {}/600", mainSubjectsObtained);
        log.info("Top 3 Optional Subjects: {}", java.util.Arrays.toString(optionalMarks));
        log.info("Optional Subjects Obtained: {}/150", optionalSubjectsObtained);
        log.info("Total Obtained: {}/{}", obtainedMarks, totalMarks);

        BigDecimal percentage = totalMarks > 0
                ? BigDecimal.valueOf(obtainedMarks)
                           .divide(BigDecimal.valueOf(totalMarks), 4, RoundingMode.HALF_UP)
                           .multiply(BigDecimal.valueOf(100))
                           .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal averageMarks = mainSubjectsCount > 0
                ? BigDecimal.valueOf(mainSubjectsObtained / mainSubjectsCount).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 6️⃣ Grade & remarks with interpolated grade point
        double percentageValue = percentage.doubleValue();
        Optional<Grade> gradeOpt = gradeRepository.findByPercentage(percentageValue);
        String gradeLetter = gradeOpt.map(Grade::getGradeLetter).orElse("");
        String remarks = gradeOpt.map(Grade::getRemarks).orElse("");
        
        // Calculate interpolated grade point
        double gradePoint = calculateInterpolatedGradePoint(percentageValue);

        // 7️⃣ Finalize marks entity
        marks.setObtainedMarks(obtainedMarks);
        marks.setMainSubjectTotal(mainSubjectTotal);
        marks.setMainSubjectObtained(mainSubjectsObtained);
        marks.setTotalMarks(totalMarks);
        marks.setMarksPercentage(percentage);
        marks.setAverageMarks(averageMarks);
        marks.setGrandePoint(BigDecimal.valueOf(gradePoint));
        marks.setGradeLetter(gradeLetter);
        marks.setRemarks(remarks);
        
        // Log detailed information for debugging
        log.info("📊 Marks Calculation Details: ");
        log.info("  - Main Subjects Count: {}", mainSubjectsCount);
        log.info("  - Optional Subjects Count: {}", optionalSubjectsCount);
        log.info("  - Main Subjects Obtained: {}", mainSubjectsObtained);
        log.info("  - Optional Subjects Obtained: {}", optionalSubjectsObtained);
        log.info("  - Total Obtained: {}", obtainedMarks);
        log.info("  - Total Possible: {}", totalMarks);
        log.info("  - Percentage: {}%", percentage);
        log.info("  - Grade: {} - {}", gradeLetter, remarks);

        if (marks.getCreatedAt() == null) marks.setCreatedAt(LocalDateTime.now());
        marks.setUpdatedAt(LocalDateTime.now());

        Marks saved = marksService.saveExamMarks(marks);

        log.info("✅ Marks saved for student {} | Exam: {} | Obtained: {} | Total: {} | Percentage: {} | Avg: {}",
                saved.getStudentId(), saved.getExamName(), saved.getObtainedMarks(), saved.getTotalMarks(),
                saved.getMarksPercentage(), saved.getAverageMarks());

        return ResponseEntity.ok(saved);
    }

    // 🔹 Helper method for mapping subject codes to short codes
    // Handles numeric codes, short codes, and full Bengali subject names
    /**
     * Calculates the interpolated grade point based on percentage
     * This provides a continuous/proportional GPA calculation within each grade range
     * @param percentage The percentage to calculate grade point for
     * @return Interpolated grade point rounded to 2 decimal places
     */
    private double calculateInterpolatedGradePoint(double percentage) {
        // Hardcoded grade ranges based on the provided scale
        if (percentage >= 80) {
            return 5.0; // A+
        } else if (percentage >= 70) {
            // Interpolate between 4.0 and 5.0 for 70-80%
            double position = (percentage - 70) / 10.0;
            double gp = 4.0 + (position * 1.0);
            // Ensure we don't exceed 5.0 due to floating point precision
            return Math.min(5.0, BigDecimal.valueOf(gp)
                          .setScale(2, RoundingMode.HALF_UP)
                          .doubleValue());
        } else if (percentage >= 60) {
            // Interpolate between 3.5 and 4.0 for 60-70%
            double position = (percentage - 60) / 10.0;
            return BigDecimal.valueOf(3.5 + (position * 0.5))
                          .setScale(2, RoundingMode.HALF_UP)
                          .doubleValue();
        } else if (percentage >= 50) {
            // Interpolate between 3.0 and 3.5 for 50-60%
            double position = (percentage - 50) / 10.0;
            return BigDecimal.valueOf(3.0 + (position * 0.5))
                          .setScale(2, RoundingMode.HALF_UP)
                          .doubleValue();
        } else if (percentage >= 40) {
            // Interpolate between 2.0 and 3.0 for 40-50%
            double position = (percentage - 40) / 10.0;
            return BigDecimal.valueOf(2.0 + (position * 1.0))
                          .setScale(2, RoundingMode.HALF_UP)
                          .doubleValue();
        } else if (percentage >= 33) {
            // Interpolate between 1.0 and 2.0 for 33-40%
            double position = (percentage - 33) / 7.0;
            return BigDecimal.valueOf(1.0 + (position * 1.0))
                          .setScale(2, RoundingMode.HALF_UP)
                          .doubleValue();
        } else {
            return 0.0; // Below 33%
        }
    }

    private String mapSubjectCode(String code) {
        if (code == null || code.isBlank()) {
            log.warn("Received null or blank subject code");
            return "";
        }
        
        // Trim the code and convert to lowercase for case-insensitive matching
        String trimmedCode = code.trim().toLowerCase();
        log.debug("Mapping subject code: {}", trimmedCode);
        
        // Handle numeric codes and subj_* patterns first
        switch (trimmedCode) {
            case "1":
            case "subj_1":
                return "bn";   // বাংলা
            case "2":
            case "subj_2":
                return "en";   // ইংরেজি
            case "3":
            case "subj_3":
                return "ma";   // গণিত
            case "4":
            case "subj_4":
                return "sc";   // বিজ্ঞান
            case "5":
            case "subj_5":
                return "bwp";  // বাংলাদেশ ও বিশ্ব পরিচয়
            case "6":
            case "subj_6":
                return "ism";  // ইসলাম ধর্ম শিক্ষা
            case "7":
            case "subj_7":
                return "hin";  // হিন্দু ধর্ম শিক্ষা
            case "8":
            case "subj_8":
                return "sss";  // সমন্বিত সামাজিক বিজ্ঞান
            case "9":
            case "subj_9":
                return "mus";  // সংগীত ও শারীরিক শিক্ষা
            case "10":
            case "subj_10":
                return "art";  // চারু ও কারুকলা
            case "11":
            case "subj_11":
                return "fa";   // শিল্পকলা
            case "12":
            case "subj_12":
                return "phy";  // শারীরিক শিক্ষা ও মানসিক স্বাস্থ্য সুরক্ষা
        }
        
        // Check for direct short code matches (bn, en, etc.)
        Set<String> validCodes = Set.of("bn", "en", "ma", "sc", "bwp", "ism", "hin", "sss", "mus", "art", "fa", "phy");
        if (validCodes.contains(trimmedCode)) {
            return trimmedCode;
        }
        
        // Check for partial matches in subject names (case-insensitive)
        // Check for BWP first to avoid conflict with Bangla
        if ((trimmedCode.contains("বিশ্ব") && trimmedCode.contains("পরিচয়")) || 
            trimmedCode.contains("bwp") || 
            trimmedCode.contains("bishwo") || 
            trimmedCode.contains("porichoy") ||
            trimmedCode.contains("বিশ্বপরিচয়")) return "bwp";
            
        if (trimmedCode.contains("বাংলা") || trimmedCode.contains("bangla")) return "bn";
        if (trimmedCode.contains("ইংরেজি") || trimmedCode.contains("english") || trimmedCode.contains("ingreji")) return "en";
        if (trimmedCode.contains("গণিত") || trimmedCode.contains("math")) return "ma";
        if ((trimmedCode.contains("বিজ্ঞান") || trimmedCode.contains("science")) && !trimmedCode.contains("সামাজিক")) return "sc";
        if (trimmedCode.contains("ইসলাম") || trimmedCode.contains("islam")) return "ism";
        if (trimmedCode.contains("হিন্দু") || trimmedCode.contains("hindu")) return "hin";
        if (trimmedCode.contains("সামাজিক") || trimmedCode.contains("social") || trimmedCode.contains("somajik")) return "sss";
        if (trimmedCode.contains("সংগীত") || trimmedCode.contains("music") || trimmedCode.contains("sangeet")) return "mus";
        if (trimmedCode.contains("চারু") || trimmedCode.contains("কারুকলা") || trimmedCode.contains("art") || trimmedCode.contains("charu")) return "art";
        if (trimmedCode.contains("শিল্প") || trimmedCode.contains("fine art") || trimmedCode.contains("shilpo")) return "fa";
        if (trimmedCode.contains("শারীরিক") || trimmedCode.contains("physical") || trimmedCode.contains("sharirik") || 
            trimmedCode.contains("শিক্ষা") || trimmedCode.contains("shikkha")) return "phy";
        
        log.warn("Could not map subject code: {}", code);
        return "";
    }


    // Get All Marks
    @GetMapping
    public ResponseEntity<List<Marks>> getAllExamMarks() {
        return ResponseEntity.ok(marksService.getAllExamMarks());
    }

    // Get Marks by ID
    @GetMapping("/{id}")
    public ResponseEntity<Marks> getExamMarksById(@PathVariable Long id) {
        return marksService.getExamMarksById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete Marks
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExamMarks(@PathVariable Long id) {
        marksService.deleteExamMarks(id);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Custom Endpoints (require repository methods in MarksRepository)
    

    // Get Marks by Class Name
    @GetMapping("/class/{className}")
    public ResponseEntity<List<Marks>> getByClassName(@PathVariable String className) {
        return ResponseEntity.ok(marksService.getByClassName(className));
    }

    // Get Marks by Exam Name
    @GetMapping("/exam/{examName}")
    public ResponseEntity<List<Marks>> getByExamName(@PathVariable String examName) {
        return ResponseEntity.ok(marksService.getByExamName(examName));
    }
}
