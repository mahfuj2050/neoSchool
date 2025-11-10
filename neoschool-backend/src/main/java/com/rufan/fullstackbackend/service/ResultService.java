
package com.rufan.fullstackbackend.service;

import com.rufan.fullstackbackend.model.School;
import com.rufan.fullstackbackend.repository.SchoolRepository;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.time.LocalDate;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rufan.fullstackbackend.dto.*;
import com.rufan.fullstackbackend.dto.TabulationSheetDto.StudentResultRow;
import com.rufan.fullstackbackend.model.Marks;
import com.rufan.fullstackbackend.model.Student;
import com.rufan.fullstackbackend.repository.MarksRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResultService {
    private static final Logger logger = LoggerFactory.getLogger(ResultService.class);

    private final MarksRepository marksRepository;
    
    @Autowired(required = false) // Make this optional
    private SchoolRepository schoolRepository;

    // -------------------- RESULT CARD --------------------
    public ResultCardDto generateResultCard(Long studentId, String examName) {
        Marks currentMarks = marksRepository.findByStudentIdAndExamName(studentId, examName)
                .orElseThrow(() -> new RuntimeException("Marks not found"));

        List<Marks> previousExams = marksRepository.findAllByStudentIdOrderByExamDateAsc(studentId);

        return mapToResultCardDto(currentMarks, previousExams);
    }

    private ResultCardDto mapToResultCardDto(Marks current, List<Marks> previous) {
        ResultCardDto dto = new ResultCardDto();

        // Basic info
        dto.setStudentId(current.getStudentId());
        dto.setStudentName(current.getStudentName());
        dto.setClassName(current.getClassName());
        dto.setExamName(current.getExamName());

        // Current Exam Totals
        double obtained = current.getObtainedMarks();
        double fullMarks = current.getTotalMarks();
        double percentage = (fullMarks > 0) ? (obtained / fullMarks) * 100 : 0;

        // Map individual subject fields to SubjectResult map
        Map<String, ResultCardDto.SubjectResult> subjectResults = new HashMap<>();
        
        // Add each subject with its marks if they exist
        if (current.getBanglaTotal() != null) {
            ResultCardDto.SubjectResult bangla = new ResultCardDto.SubjectResult();
            bangla.subjectName = "Bangla";
            bangla.marksObtained = current.getBanglaTotal();
            bangla.fullMarks = 100.0; // Adjust full marks as needed
            bangla.letterGrade = calculateLetterGrade((current.getBanglaTotal() / 100) * 100);
            bangla.gradePoint = calculateGradePoint((current.getBanglaTotal() / 100) * 100);
            subjectResults.put("BANGLA", bangla);
        }
        
        // Add other subjects similarly
        // Example for English:
        // if (current.getEnglishTotal() != null) { ... }
        
        dto.setSubjectResults(subjectResults);
        dto.setTotalMarks(obtained);
        dto.setFullMarks(fullMarks);
        dto.setPercentage(percentage);

        dto.setLetterGrade(calculateLetterGrade(percentage));
        dto.setGradePoint(calculateGradePoint(percentage));

        // Previous Exam History
        List<ResultCardDto.PreviousExamSummary> history = previous.stream()
                .filter(m -> !m.getExamName().equals(current.getExamName()))
                .map(m -> {
                    double prevObt = m.getObtainedMarks();
                    double prevFull = m.getTotalMarks();
                    double prevPct = (prevFull > 0) ? (prevObt / prevFull) * 100 : 0;
                    ResultCardDto.PreviousExamSummary summary = new ResultCardDto.PreviousExamSummary();
                    summary.setExamName(m.getExamName());
                    summary.setTotalMarks(prevObt);
                    summary.setPercentage(prevPct);
                    summary.setLetterGrade(calculateLetterGrade(prevPct));
                    summary.setGradePoint(calculateGradePoint(prevPct));
                    return summary;
                })
                .toList();

        dto.setPreviousExams(history);

        return dto;
    }

    // -------------------- MERIT LIST --------------------
    public List<MeritListDto> generateMeritList(String className, String examName, int topN) {
        List<Marks> marksList = marksRepository.findByClassNameAndExamName(className, examName);

        List<MeritListDto> result = marksList.stream()
                .filter(m -> m.getStudent() != null) // Ensure student is loaded
                .collect(Collectors.groupingBy(Marks::getStudentId))
                .entrySet()
                .stream()
                .map(entry -> {
                    // Get the first marks entry to access student info
                    Marks firstMark = entry.getValue().get(0);
                    Student student = firstMark.getStudent();
                    
                    if (student == null) {
                        throw new IllegalStateException("Student not loaded for marks with ID: " + firstMark.getId());
                    }

                    // Calculate total obtained marks
                    double totalObtained = entry.getValue().stream()
                            .mapToDouble(m -> {
                                double sum = 0.0;
                                // Main subjects (100 marks each)
                                if (m.getBanglaTotal() != null) sum += m.getBanglaTotal();
                                if (m.getEnglishTotal() != null) sum += m.getEnglishTotal();
                                if (m.getMathTotal() != null) sum += m.getMathTotal();
                                if (m.getScienceTotal() != null) sum += m.getScienceTotal();
                                if (m.getBwpTotal() != null) sum += m.getBwpTotal();
                                if (m.getIslamTotal() != null) sum += m.getIslamTotal();
                                if (m.getHinduTotal() != null) sum += m.getHinduTotal();
                                // Optional subjects (50 marks each)
                                if (m.getSssTotal() != null) sum += m.getSssTotal();
                                if (m.getMusicTotal() != null) sum += m.getMusicTotal();
                                if (m.getArtTotal() != null) sum += m.getArtTotal();
                                if (m.getFaTotal() != null) sum += m.getFaTotal();
                                if (m.getPhyTotal() != null) sum += m.getPhyTotal();
                                return sum;
                            })
                            .sum();
                    
                    // Calculate total full marks based on class
                    double totalFullMarks;
                    if (className != null && (className.contains("Third") || className.contains("Fourth") || className.contains("Fifth"))) {
                        // For Third, Fourth, Fifth: 6 main subjects (100 each) + 3 optional (50 each) = 750
                        totalFullMarks = 750.0;
                    } else {
                        // For other classes, calculate based on available subjects (default to 100 per subject)
                        int subjectCount = (int) entry.getValue().stream()
                                .flatMap(m -> List.of(
                                    m.getBanglaTotal(), m.getEnglishTotal(), m.getMathTotal(),
                                    m.getScienceTotal(), m.getBwpTotal(), m.getIslamTotal(),
                                    m.getSssTotal(), m.getMusicTotal(), m.getArtTotal()
                                ).stream())
                                .filter(Objects::nonNull)
                                .count();
                        totalFullMarks = subjectCount * 100.0; // Default to 100 per subject if not primary class
                    }
                    
                    double percentage = (totalFullMarks > 0) ? (totalObtained / totalFullMarks) * 100 : 0;

                    MeritListDto dto = new MeritListDto();
                    dto.setStudentId(student.getId());
                    dto.setStudentName(student.getName());
                    // Convert rollNo from String to Integer safely
                    try {
                        dto.setRollNo(Integer.parseInt(student.getRollNo()));
                    } catch (NumberFormatException e) {
                        dto.setRollNo(null); // or set a default value if needed
                    }
                    dto.setClassName(className); 
                    dto.setSectionName(student.getSection()); 
                    dto.setTotalMarks(totalFullMarks);
                    dto.setObtainedMarks(totalObtained);
                    dto.setPercentage(percentage);
                    // Use the same calculation methods as in TabulationSheetDto for consistency
                    dto.setLetterGrade(TabulationSheetDto.calculateLetterGrade(percentage));
                    dto.setGradePoint(TabulationSheetDto.calculateInterpolatedGradePoint(percentage));
                    return dto;
                })
                .sorted(Comparator.comparingDouble(MeritListDto::getPercentage).reversed())
                .limit(topN)
                .collect(Collectors.toList());
                
        // Set positions after sorting
        for (int i = 0; i < result.size(); i++) {
            result.get(i).setPosition(i + 1);
        }
        
        return result;
    }

    // -------------------- TABULATION SHEET --------------------
    public List<TabulationSheetDto> generateTabulationSheet(String educationYear, String examName, String className) {
        logger.info("Searching for marks - Class: '{}', Exam: '{}', Year: {}", className, examName, educationYear);
        
        // Get school from database or use default
        final School school = getSchoolInfo();
        
        // Parse the education year to integer
        int year;
        try {
            year = Integer.parseInt(educationYear);
        } catch (NumberFormatException e) {
            logger.warn("Invalid education year: {}. Using current year as fallback.", educationYear);
            year = LocalDate.now().getYear();
        }
        
        // Try exact match first with year
        List<Marks> marksList = marksRepository.findByClassNameAndExamNameAndYear(className, examName, year);
        logger.debug("Exact match with year results: {}", marksList.size());
        
        // If no results, try without year filter (backward compatibility)
        if (marksList.isEmpty()) {
            logger.info("No results with year filter, trying without year");
            marksList = marksRepository.findByClassNameAndExamName(className, examName);
            logger.debug("Exact match results (no year): {}", marksList.size());
        }
        
        // If still no results, try with just the class name part (e.g., "পঞ্চম" instead of "পঞ্চম শ্রেণি")
        if (marksList.isEmpty() && className.contains(" ")) {
            String shortClassName = className.split(" ")[0];
            logger.info("No results with full class name, trying with: {}", shortClassName);
            marksList = marksRepository.findByClassNameContainingAndExamNameAndYear(shortClassName, examName, year);
            if (marksList.isEmpty()) {
                marksList = marksRepository.findByClassNameContainingAndExamName(shortClassName, examName);
            }
            logger.debug("Partial class name match results: {}", marksList.size());
        }
        
        // If still no results, try with just the exam name part
        if (marksList.isEmpty() && examName.contains(" ")) {
            String shortExamName = examName.split(" ")[0];
            logger.info("No results with full exam name, trying with: {}", shortExamName);
            String searchClassName = className.contains(" ") ? className.split(" ")[0] : className;
            marksList = marksRepository.findByClassNameContainingAndExamNameContainingAndYear(searchClassName, shortExamName, year);
            if (marksList.isEmpty()) {
                marksList = marksRepository.findByClassNameContainingAndExamNameContaining(searchClassName, shortExamName);
            }
            logger.debug("Partial exam name match results: {}", marksList.size());
        }
        
        if (marksList.isEmpty()) {
            logger.warn("No marks found for Class: '{}', Exam: '{}', Year: {}", className, examName, educationYear);
        } else {
            logger.info("Found {} matching records for Class: '{}', Exam: '{}'", 
                marksList.size(), className, examName);
            
            // Log some sample data for debugging
            marksList.stream().limit(3).forEach(mark -> 
                logger.debug("Sample mark - ID: {}, Student: {}, Class: {}, Exam: {}", 
                    mark.getId(), 
                    mark.getStudent() != null ? mark.getStudent().getName() : "null", 
                    mark.getClassName(), 
                    mark.getExamName())
            );
        }

        return marksList.stream()
                .filter(m -> m.getStudent() != null) // Ensure student is loaded
                .collect(Collectors.groupingBy(Marks::getStudentId))
                .entrySet()
                .stream()
                .map(entry -> {
                    Marks firstMark = entry.getValue().get(0);
                    return mapToTabulationDto(firstMark.getStudent(), entry.getValue(), school);
                })
                .sorted(Comparator.comparingDouble((TabulationSheetDto dto) -> 
                        dto.getStudentResults().stream()
                        .mapToDouble(StudentResultRow::getPercentage)
                        .average()
                        .orElse(0.0))
                        .reversed())
                .toList();
    }

    private TabulationSheetDto mapToTabulationDto(Student student, List<Marks> studentMarks, School school) {
        logger.info("Mapping student to tabulation DTO - Student: {}, Roll: {}, Marks count: {}", 
            student.getName(), student.getRollNo(), studentMarks.size());
            
        TabulationSheetDto.StudentResultRow resultRow = TabulationSheetDto.StudentResultRow.builder()
                .studentId(student.getId())
                .studentName(student.getName())
                .rollNo(student.getRollNo())
                .subjectsMap(new LinkedHashMap<>())
                .build();

        double totalObtained = 0;
        double totalFull = 0;
        
        // Check if this is Third, Fourth, or Fifth class
        boolean isPrimaryClass = student.getStudentClass() != null && 
                              (student.getStudentClass().contains("Third") || 
                               student.getStudentClass().contains("Fourth") || 
                               student.getStudentClass().contains("Fifth"));

        if (!studentMarks.isEmpty()) {
            Marks marks = studentMarks.get(0);
            logger.debug("Processing marks for student: {}, Class: {}, Exam: {}", 
                student.getName(), marks.getClassName(), marks.getExamName());

            // List of subjects and their getter lambdas for CA, AA, Total
            // Using subject codes that match the ALL_SUBJECTS map
            Map<String, Double[]> subjects = Map.ofEntries(
            	    Map.entry("BAN", new Double[]{marks.getBanglaCa(), marks.getBanglaAa(), marks.getBanglaTotal()}),
            	    Map.entry("ENG", new Double[]{marks.getEnglishCa(), marks.getEnglishAa(), marks.getEnglishTotal()}),
            	    Map.entry("MATH", new Double[]{marks.getMathCa(), marks.getMathAa(), marks.getMathTotal()}),
            	    Map.entry("SCI", new Double[]{marks.getScienceCa(), marks.getScienceAa(), marks.getScienceTotal()}),
            	    Map.entry("BWP", new Double[]{marks.getBwpCa(), marks.getBwpAa(), marks.getBwpTotal()}),
            	    Map.entry("ISL", new Double[]{marks.getIslamCa(), marks.getIslamAa(), marks.getIslamTotal()}),
            	    Map.entry("HIN", new Double[]{marks.getHinduCa(), marks.getHinduAa(), marks.getHinduTotal()}),
            	    Map.entry("SSS", new Double[]{marks.getSssCa(), marks.getSssAa(), marks.getSssTotal()}),
            	    Map.entry("MUS", new Double[]{marks.getMusicPhyCa(), marks.getMusicPhyAa(), marks.getMusicTotal()}),
            	    Map.entry("ART", new Double[]{marks.getArtCraftCa(), marks.getArtCraftAa(), marks.getArtTotal()}),
            	    Map.entry("FA", new Double[]{marks.getFineArtCa(), marks.getFineArtAa(), marks.getFaTotal()}),
            	    Map.entry("PE", new Double[]{marks.getPhyEduCa(), marks.getPhyEduAa(), marks.getPhyTotal()})
            	);


            for (Map.Entry<String, Double[]> entry : subjects.entrySet()) {
                String subj = entry.getKey();
                Double ca = entry.getValue()[0] != null ? entry.getValue()[0] : 0;
                Double aa = entry.getValue()[1] != null ? entry.getValue()[1] : 0;
                Double total = entry.getValue()[2] != null ? entry.getValue()[2] : 0;

                if (total > 0) {
                    resultRow.getSubjectsMap().put(subj, TabulationSheetDto.StudentResultRow.SubjectMarks.of(subj, ca, aa));
                    totalObtained += total;
                    // For primary classes (Third, Fourth, Fifth), first 6 subjects are 100 marks each, rest are 50
                    if (isPrimaryClass) {
                        if (resultRow.getSubjectsMap().size() <= 6) {
                            totalFull = 600; // First 6 subjects * 100 = 600
                        } else {
                            // Optional subjects (7th onwards) are 50 marks each
                            // We already have 600 for main subjects, now add 50 for each optional subject
                            totalFull = 600 + ((resultRow.getSubjectsMap().size() - 6) * 50);
                        }
                    } else {
                        totalFull += 100; // For non-primary classes, assume 100 marks per subject
                    }
                }
            }
        }

        double percentage = totalFull > 0 ? (totalObtained / totalFull) * 100 : 0;
        resultRow.setTotalObtainedMarks(totalObtained);
        resultRow.setTotalFullMarks(totalFull);
        resultRow.setPercentage(percentage);
        resultRow.setLetterGrade(TabulationSheetDto.calculateLetterGrade(percentage));
        // Use interpolated grade point for more accurate calculation
        resultRow.setGradePoint(TabulationSheetDto.calculateInterpolatedGradePoint(percentage));

        return TabulationSheetDto.builder()
                .schoolName(school.getName())
                .schoolAddress(school.getAddress())
                .emisCode(school.getEmisCode())
                .className(student.getStudentClass())
                .sectionName(student.getSection())
                .examName(studentMarks.isEmpty() ? "" : studentMarks.get(0).getExamName())
                .examYear(studentMarks.isEmpty() ? "" : String.valueOf(studentMarks.get(0).getExamDate().getYear()))
                .studentResults(List.of(resultRow))
                .build();
    }


    // -------------------- HELPERS --------------------
    private String calculateLetterGrade(double percentage) {
        if (percentage >= 80) return "A+";
        if (percentage >= 70) return "A";
        if (percentage >= 60) return "A-";
        if (percentage >= 50) return "B";
        if (percentage >= 40) return "C";
        if (percentage >= 33) return "D";
        return "F";
    }

    private double calculateGradePoint(double percentage) {
        if (percentage >= 80) return 5.0;
        if (percentage >= 70) return 4.0;
        if (percentage >= 60) return 3.5;
        if (percentage >= 50) return 3.0;
        if (percentage >= 33) return 2.0;  // Changed from 40% to 33% for passing grade
        return 0.0;  // Failing grade
    }

    private School createDefaultSchool() {
        return School.builder()
            .name("Kagapasha Government Primary School")
            .address("Kagapasha-3350, Baniyachong, Habiganj")
            .emisCode("EMIS Code: 603040601")
            .phone("+88 01717 020632")
            .email("info@kagapashagps.edu.bd")
            .build();
    }
    
    private School getSchoolInfo() {
        if (schoolRepository != null) {
            try {
                return schoolRepository.findAll().stream()
                    .findFirst()
                    .orElseGet(this::createDefaultSchool);
            } catch (Exception e) {
                logger.warn("Could not fetch school information from database: {}", e.getMessage());
            }
        }
        return createDefaultSchool();
    }
}
