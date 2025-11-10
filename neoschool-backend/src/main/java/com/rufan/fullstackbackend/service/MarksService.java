package com.rufan.fullstackbackend.service;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rufan.fullstackbackend.model.Grade;
import com.rufan.fullstackbackend.model.Marks;
import com.rufan.fullstackbackend.model.Student;
import com.rufan.fullstackbackend.repository.GradeRepository;
import com.rufan.fullstackbackend.repository.MarksRepository;
import com.rufan.fullstackbackend.repository.StudentRepository;

import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;



@Service
@Slf4j
public class MarksService {

    private final MarksRepository marksRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;

    public MarksService(MarksRepository marksRepository, 
                       GradeRepository gradeRepository,
                       StudentRepository studentRepository) {
        this.marksRepository = marksRepository;
        this.gradeRepository = gradeRepository;
        this.studentRepository = studentRepository;
    }

    public Optional<Marks> findByStudentAndExam(Long studentId, String examName) {
        return marksRepository.findByStudentIdAndExamName(studentId, examName);
    }
    
    @Transactional
    public Marks saveExamMarks(Marks marks) {
        log.info("📝 Saving marks for student {} | Exam: {}", marks.getStudentId(), marks.getExamName());

        // 1. Calculate per-subject totals
        marks.setBanglaTotal(sum(marks.getBanglaCa(), marks.getBanglaAa()));
        marks.setEnglishTotal(sum(marks.getEnglishCa(), marks.getEnglishAa()));
        marks.setMathTotal(sum(marks.getMathCa(), marks.getMathAa()));
        marks.setScienceTotal(sum(marks.getScienceCa(), marks.getScienceAa()));
        marks.setBwpTotal(sum(marks.getBwpCa(), marks.getBwpAa()));
        marks.setIslamTotal(sum(marks.getIslamCa(), marks.getIslamAa()));
        marks.setHinduTotal(sum(marks.getHinduCa(), marks.getHinduAa()));
        marks.setSssTotal(sum(marks.getSssCa(), marks.getSssAa()));
        marks.setMusicTotal(sum(marks.getMusicPhyCa(), marks.getMusicPhyAa()));
        marks.setArtTotal(sum(marks.getArtCraftCa(), marks.getArtCraftAa()));
        marks.setFaTotal(sum(marks.getFineArtCa(), marks.getFineArtAa()));
        
        // Ensure Physical Education marks are calculated and included
        Double phyTotal = sum(marks.getPhyEduCa(), marks.getPhyEduAa());
        marks.setPhyTotal(phyTotal);
        
        // If Physical Education marks are not set, initialize them to 0
        if (marks.getPhyEduCa() == null) marks.setPhyEduCa(0.0);
        if (marks.getPhyEduAa() == null) marks.setPhyEduAa(0.0);

        // 2. Get student's main subject count
        Optional<Student> studentOpt = studentRepository.findById(marks.getStudentId());
        int mainSubjectCount = studentOpt.map(Student::getMainSubject).orElse(6); // Default to 6 if not found
        
        // List to track main subjects with their marks and names for debugging
        List<SubjectMark> mainSubjects = new ArrayList<>();
        
        // Add all main subjects to the list with their actual marks
        addSubjectMark(mainSubjects, "Bangla", marks.getBanglaTotal(), marks.getBanglaCa(), marks.getBanglaAa());
        addSubjectMark(mainSubjects, "English", marks.getEnglishTotal(), marks.getEnglishCa(), marks.getEnglishAa());
        addSubjectMark(mainSubjects, "Math", marks.getMathTotal(), marks.getMathCa(), marks.getMathAa());
        addSubjectMark(mainSubjects, "Science", marks.getScienceTotal(), marks.getScienceCa(), marks.getScienceAa());
        addSubjectMark(mainSubjects, "BWP", marks.getBwpTotal(), marks.getBwpCa(), marks.getBwpAa());
        addSubjectMark(mainSubjects, "Islam", marks.getIslamTotal(), marks.getIslamCa(), marks.getIslamAa());
        addSubjectMark(mainSubjects, "Hindu", marks.getHinduTotal(), marks.getHinduCa(), marks.getHinduAa());
        
        // Filter out subjects with 0 or null marks
        List<SubjectMark> validMainSubjects = mainSubjects.stream()
                .filter(subj -> subj.totalMarks != null && subj.totalMarks > 0)
                .sorted((a, b) -> Double.compare(b.totalMarks, a.totalMarks)) // Sort descending by marks
                .collect(Collectors.toList());
                
        // Log the subjects being considered as main
        log.info("All main subjects with marks: {}", validMainSubjects);
        
        // Take top N main subjects based on student's class
        List<SubjectMark> topMainSubjects = validMainSubjects.stream()
                .limit(mainSubjectCount)
                .collect(Collectors.toList());
        
        // Log the selected main subjects
        log.info("Selected top {} main subjects: {}", mainSubjectCount, topMainSubjects);
        
        // Calculate main subjects obtained marks and total
        double mainSubjectsObtained = topMainSubjects.stream()
                .mapToDouble(subj -> subj.totalMarks)
                .sum();
                
        double mainSubjectTotal = mainSubjectCount * 100.0;
        
        log.info("Main subjects calculation - Obtained: {}, Total: {}, Count: {}", 
                mainSubjectsObtained, mainSubjectTotal, mainSubjectCount);

        // 3. Calculate total marks based on student's class
        double optionalSubjectTotal = 3 * 50.0;  // 3 optional subjects × 50 marks each
        double totalMarks = mainSubjectTotal + optionalSubjectTotal;
        
        // 4. Process optional subjects
        List<Double> optionalMarks = new ArrayList<>();
        
        // Add all optional subjects including Physical Education
        // Ensure we include all optional subjects even if marks are 0
        addIfValid(optionalMarks, marks.getSssTotal());
        addIfValid(optionalMarks, marks.getMusicTotal());
        addIfValid(optionalMarks, marks.getArtTotal());
        addIfValid(optionalMarks, marks.getFaTotal());
        
        // Handle Physical Education marks
        double phyMarks = 0.0;
        if (marks.getPhyTotal() != null) {
            phyMarks = marks.getPhyTotal();
        } else if (marks.getPhyEduCa() != null || marks.getPhyEduAa() != null) {
            // If phyTotal is null but we have CA/AA marks, calculate the total
            phyMarks = sum(marks.getPhyEduCa(), marks.getPhyEduAa());
            marks.setPhyTotal(phyMarks);
        }
        optionalMarks.add(phyMarks);
        
        // Ensure we have at least 3 optional subjects for calculation
        while (optionalMarks.size() < 3) {
            optionalMarks.add(0.0);
        }

        // Sort in descending order and take top 3
        optionalMarks.sort(Collections.reverseOrder());
        List<Double> topOptionalSubjects = optionalMarks.stream()
                .limit(3)  // Always take top 3 optional subjects
                .collect(Collectors.toList());

        // Calculate optional subjects obtained marks
        double optionalSubjectsObtained = topOptionalSubjects.stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        
        // Calculate total obtained marks
        double obtainedMarks = mainSubjectsObtained + optionalSubjectsObtained;
                
        log.info("All optional subjects marks: {}", optionalMarks);
        log.info("Top 3 optional subjects: {}", topOptionalSubjects);
        log.info("Physical Education marks - CA: {}, AA: {}, Total: {}", 
                marks.getPhyEduCa(), marks.getPhyEduAa(), phyMarks);
                
        // Log the calculated values for debugging
        log.info("Main subjects obtained: {} / {}", mainSubjectsObtained, mainSubjectTotal);
        log.info("Optional subjects obtained: {} / 150.0", optionalSubjectsObtained);
        log.info("Total obtained: {} / {}", obtainedMarks, totalMarks);

        // 5. Calculate percentage
        BigDecimal percentage = totalMarks > 0
                ? BigDecimal.valueOf(obtainedMarks)
                        .divide(BigDecimal.valueOf(totalMarks), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 6. Get grade and remarks
        double gradePoint = calculateInterpolatedGradePoint(percentage.doubleValue());
        Optional<Grade> gradeOpt = gradeRepository.findByPercentage(percentage.doubleValue());
        String gradeLetter = gradeOpt.map(Grade::getGradeLetter).orElse("");
        String remarks = gradeOpt.map(Grade::getRemarks).orElse("");

        // 7. Update marks entity
        marks.setObtainedMarks(obtainedMarks);
        marks.setMainSubjectTotal(mainSubjectTotal);
        marks.setMainSubjectObtained(mainSubjectsObtained);
        marks.setTotalMarks(totalMarks);
        marks.setMarksPercentage(percentage);
        marks.setAverageMarks(mainSubjectCount > 0 
                ? BigDecimal.valueOf(mainSubjectsObtained / mainSubjectCount).setScale(2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO);
        marks.setGrandePoint(BigDecimal.valueOf(gradePoint));
        marks.setGradeLetter(gradeLetter);
        marks.setRemarks(remarks);

        // 8. Set timestamps
        if (marks.getCreatedAt() == null) {
            marks.setCreatedAt(LocalDateTime.now());
        }
        marks.setUpdatedAt(LocalDateTime.now());

        return marksRepository.save(marks);
    }

    @Data
    private static class SubjectMark {
        private final String subjectName;
        private final Double totalMarks;
        private final Double caMarks;
        private final Double aaMarks;

        @Override
        public String toString() {
            return String.format("%s (CA: %s, AA: %s, Total: %s)", 
                subjectName, 
                caMarks != null ? String.format("%.2f", caMarks) : "N/A",
                aaMarks != null ? String.format("%.2f", aaMarks) : "N/A",
                totalMarks != null ? String.format("%.2f", totalMarks) : "N/A");
        }
    }

    private void addSubjectMark(List<SubjectMark> list, String subjectName, Double totalMarks, Double caMarks, Double aaMarks) {
        // Include subject if either CA or AA marks are present and greater than 0
        boolean hasCaMarks = caMarks != null && caMarks > 0;
        boolean hasAaMarks = aaMarks != null && aaMarks > 0;
        
        if (hasCaMarks || hasAaMarks) {
            // Calculate total if not provided
            double calculatedTotal = (caMarks != null ? caMarks : 0) + (aaMarks != null ? aaMarks : 0);
            list.add(new SubjectMark(
                subjectName,
                totalMarks != null ? totalMarks : calculatedTotal,
                hasCaMarks ? caMarks : 0.0,
                hasAaMarks ? aaMarks : 0.0
            ));
            
            log.debug("Added subject {} with CA: {}, AA: {}, Total: {}", 
                subjectName, 
                hasCaMarks ? caMarks : 0.0,
                hasAaMarks ? aaMarks : 0.0,
                totalMarks != null ? totalMarks : calculatedTotal);
        }
    }

    // Keep the old method for backward compatibility
    private void addIfValid(List<Double> list, Double value) {
        if (value != null && value >= 0) {
            list.add(value);
        }
    }

    public double calculateInterpolatedGradePoint(double percentage) {
        Optional<Grade> gradeOpt = gradeRepository.findByPercentage(percentage);
        if (gradeOpt.isEmpty()) return 0.0;

        Grade grade = gradeOpt.get();
        double minPercent = grade.getRangeMin();
        double maxPercent = grade.getRangeMax();
        double minGP = grade.getGradePoint().doubleValue();

        // Next higher grade GP
        Optional<Grade> nextGradeOpt = gradeRepository
                .findByRangeMinGreaterThanOrderByRangeMinAsc(minPercent)
                .stream()
                .findFirst();

        double maxGP = nextGradeOpt.map(g -> g.getGradePoint().doubleValue()).orElse(minGP);

        // Proportional interpolation
        double gp = minGP + ((percentage - minPercent) / (maxPercent - minPercent)) * (maxGP - minGP);
        return BigDecimal.valueOf(gp).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

	/* - 
    @Transactional
    public Marks saveExamMarks(Marks marks) {
        log.info("📝 Saving marks for student {} | Exam: {}", marks.getStudentId(), marks.getExamName());

        // ---- calculate per-subject totals ----
        marks.setBanglaTotal(sum(marks.getBanglaCa(), marks.getBanglaAa()));
        marks.setEnglishTotal(sum(marks.getEnglishCa(), marks.getEnglishAa()));
        marks.setMathTotal(sum(marks.getMathCa(), marks.getMathAa()));
        marks.setScienceTotal(sum(marks.getScienceCa(), marks.getScienceAa()));
        marks.setBwpTotal(sum(marks.getBwpCa(), marks.getBwpAa()));
        marks.setIslamTotal(sum(marks.getIslamCa(), marks.getIslamAa()));
        marks.setHinduTotal(sum(marks.getHinduCa(), marks.getHinduAa()));
        marks.setSsTotal(sum(marks.getSssCa(), marks.getSssAa()));
        marks.setMusicTotal(sum(marks.getMusicPhyCa(), marks.getMusicPhyAa()));
        marks.setArtTotal(sum(marks.getArtCraftCa(), marks.getArtCraftAa()));
        marks.setFaTotal(sum(marks.getFineArtCa(), marks.getFineArtAa()));
        marks.setPhyTotal(sum(marks.getPhyEduCa(), marks.getPhyEduAa()));

        // ---- obtained marks (all subjects) ----
        double obtainedMarks = nullSafe(marks.getBanglaTotal())
                             + nullSafe(marks.getEnglishTotal())
                             + nullSafe(marks.getMathTotal())
                             + nullSafe(marks.getScienceTotal())
                             + nullSafe(marks.getBwpTotal())
                             + nullSafe(marks.getIslamTotal())
                             + nullSafe(marks.getHinduTotal())
                             + nullSafe(marks.getSssTotal())
                             + nullSafe(marks.getMusicTotal())
                             + nullSafe(marks.getArtTotal())
                             + nullSafe(marks.getFaTotal())
                             + nullSafe(marks.getPhyTotal());
        marks.setObtainedMarks(obtainedMarks);

        // ---- fetch student to get main subjects count ----
        Student student = studentRepository.findByStudentId(marks.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + marks.getStudentId()));

        int mainSubjectsCount = student.getMainSubject(); // 3 or 6
        int subsidiaryCount = (mainSubjectsCount == 6) ? 3 : 0;

        // ---- calculate main subject totals ----
        double mainSubjectTotal = mainSubjectsCount * 100.0;
        double subsidiaryTotal = subsidiaryCount * 50.0;
        double totalFullMarks = mainSubjectTotal + subsidiaryTotal;

        double mainSubjectObtained = nullSafe(marks.getBanglaTotal())
                                   + nullSafe(marks.getEnglishTotal())
                                   + nullSafe(marks.getMathTotal())
                                   + nullSafe(marks.getScienceTotal())
                                   + nullSafe(marks.getBwpTotal())
                                   + nullSafe(marks.getIslamTotal())
                                   + nullSafe(marks.getHinduTotal());

        marks.setMainSubjectTotal(mainSubjectTotal);
        marks.setMainSubjectObtained(mainSubjectObtained);
        marks.setTotalMarks(totalFullMarks);

        // ---- percentage based on main subjects ----
        BigDecimal percentage = mainSubjectTotal > 0
                ? BigDecimal.valueOf(mainSubjectObtained)
                    .divide(BigDecimal.valueOf(mainSubjectTotal), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        marks.setMarksPercentage(percentage);

        log.info("✅ Marks saved: studentId={}, obtained={}, total={}, percentage={}",
                marks.getStudentId(), obtainedMarks, totalFullMarks, percentage);

        return marksRepository.save(marks);
    }
*/
    public List<Marks> getAllExamMarks() {
        return marksRepository.findAll();
    }

    public Optional<Marks> getExamMarksById(Long id) {
        return marksRepository.findById(id);
    }

    public void deleteExamMarks(Long id) {
        marksRepository.deleteById(id);
        log.info("🗑 Deleted marks with id {}", id);
    }

    // Custom Finders
    public List<Marks> findByStudentId(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    public List<Marks> getByClassName(String className) {
        return marksRepository.findByClassName(className);
    }

    public List<Marks> getByExamName(String examName) {
        return marksRepository.findByExamName(examName);
    }

    // --- helpers ---
    private Double sum(Double ca, Double aa) {
        double total = 0.0;
        if (ca != null) total += ca;
        if (aa != null) total += aa;
        return total > 0 ? total : null;
    }

    private double nullSafe(Double val) {
        return (val != null) ? val : 0.0;
    }
}
