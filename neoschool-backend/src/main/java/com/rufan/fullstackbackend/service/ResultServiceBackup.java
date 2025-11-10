/*
 * package com.rufan.fullstackbackend.service;
 * 
 * import java.util.Comparator; import java.util.List; import
 * java.util.stream.Collectors;
 * 
 * import org.springframework.stereotype.Service;
 * 
 * import com.rufan.fullstackbackend.dto.MeritListDto; import
 * com.rufan.fullstackbackend.dto.ResultCardDto; import
 * com.rufan.fullstackbackend.dto.TabulationSheetDto; import
 * com.rufan.fullstackbackend.model.Marks; import
 * com.rufan.fullstackbackend.model.Student; import
 * com.rufan.fullstackbackend.repository.MarksRepository; import
 * com.rufan.fullstackbackend.repository.StudentRepository;
 * 
 * import lombok.RequiredArgsConstructor;
 * 
 * @Service
 * 
 * @RequiredArgsConstructor public class ResultServiceBackup {
 * 
 * private final MarksRepository marksRepository; private final
 * StudentRepository studentRepository;
 * 
 * // -------------------- RESULT CARD -------------------- public ResultCardDto
 * generateResultCard(Long studentId, String examName) { Marks currentMarks =
 * marksRepository.findByStudentIdAndExamName(studentId, examName)
 * .orElseThrow(() -> new RuntimeException("Marks not found"));
 * 
 * List<Marks> previousExams =
 * marksRepository.findAllByStudentIdOrderByExamDateAsc(studentId);
 * 
 * return mapToResultCardDto(currentMarks, previousExams); }
 * 
 * private ResultCardDto mapToResultCardDto(Marks current, List<Marks> previous)
 * { ResultCardDto dto = new ResultCardDto();
 * 
 * // Basic info dto.setStudentId(current.getStudentId());
 * dto.setStudentName(current.getStudentName());
 * dto.setClassName(current.getClassName());
 * dto.setExamName(current.getExamName());
 * 
 * // Current Exam Totals double obtained = current.getObtainedMarks(); double
 * fullMarks = current.getTotalMarks(); double percentage = (fullMarks > 0) ?
 * (obtained / fullMarks) * 100 : 0;
 * 
 * dto.setSubjects(current.getSubjects()); // assuming List<SubjectMarkDto> or
 * Map<String,Double> dto.setTotalMarks(obtained); dto.setFullMarks(fullMarks);
 * dto.setPercentage(percentage);
 * 
 * dto.setLetterGrade(calculateLetterGrade(percentage));
 * dto.setGradePoint(calculateGradePoint(percentage));
 * 
 * // Previous Exam History List<ResultHistoryDto> history = previous.stream()
 * .filter(m -> !m.getExamName().equals(current.getExamName())) .map(m -> {
 * double prevObt = m.getObtainedMarks(); double prevFull = m.getTotalMarks();
 * double prevPct = (prevFull > 0) ? (prevObt / prevFull) * 100 : 0; return new
 * ResultHistoryDto( m.getExamName(), m.getExamDate(), prevObt, prevFull,
 * prevPct, calculateLetterGrade(prevPct), calculateGradePoint(prevPct) ); })
 * .toList();
 * 
 * dto.setPreviousResults(history);
 * 
 * return dto; }
 * 
 * // -------------------- MERIT LIST -------------------- public
 * List<MeritListDto> generateMeritList(String className, String examName, int
 * topN) { List<Marks> marksList = marksRepository.findByClassAndExam(className,
 * examName);
 * 
 * return marksList.stream() .collect(Collectors.groupingBy(Marks::getStudent))
 * .entrySet().stream() .map(entry -> { Student student = entry.getKey();
 * List<Marks> studentMarks = entry.getValue();
 * 
 * double total =
 * studentMarks.stream().mapToDouble(Marks::getObtainedMarks).sum(); double full
 * = studentMarks.stream().mapToDouble(Marks::getTotalMarks).sum(); double
 * percentage = (full > 0) ? (total / full) * 100 : 0;
 * 
 * return new MeritListDto( student.getId(), student.getName(), total, full,
 * percentage, calculateLetterGrade(percentage), calculateGradePoint(percentage)
 * ); })
 * .sorted(Comparator.comparingDouble(MeritListDto::getPercentage).reversed())
 * .limit(topN) .toList(); }
 * 
 * // -------------------- TABULATION SHEET -------------------- public
 * List<TabulationSheetDto> generateTabulationSheet(String className, String
 * examName) { List<Marks> marksList =
 * marksRepository.findByClassAndExam(className, examName);
 * 
 * return marksList.stream() .collect(Collectors.groupingBy(Marks::getStudent))
 * .entrySet().stream() .map(entry -> mapToTabulationDto(entry.getKey(),
 * entry.getValue()))
 * .sorted(Comparator.comparingDouble(TabulationSheetDto::getPercentage).
 * reversed()) .toList(); }
 * 
 * private TabulationSheetDto mapToTabulationDto(Student student, List<Marks>
 * studentMarks) { double total =
 * studentMarks.stream().mapToDouble(Marks::getObtainedMarks).sum(); double full
 * = studentMarks.stream().mapToDouble(Marks::getTotalMarks).sum(); double
 * percentage = (full > 0) ? (total / full) * 100 : 0;
 * 
 * // subject-level breakdown List<SubjectMarkDto> subjectMarks =
 * studentMarks.stream() .map(m -> new SubjectMarkDto( m.getSubjectName(),
 * m.getObtainedMarks(), m.getTotalMarks(),
 * calculateLetterGrade((m.getObtainedMarks() / m.getTotalMarks()) * 100),
 * calculateGradePoint((m.getObtainedMarks() / m.getTotalMarks()) * 100) ))
 * .toList();
 * 
 * return new TabulationSheetDto( student.getId(), student.getName(),
 * subjectMarks, total, full, percentage, calculateLetterGrade(percentage),
 * calculateGradePoint(percentage) ); }
 * 
 * // -------------------- HELPERS -------------------- private String
 * calculateLetterGrade(double percentage) { if (percentage >= 80) return "A+";
 * if (percentage >= 70) return "A"; if (percentage >= 60) return "A-"; if
 * (percentage >= 50) return "B"; if (percentage >= 40) return "C"; if
 * (percentage >= 33) return "D"; return "F"; }
 * 
 * private double calculateGradePoint(double percentage) { if (percentage >= 80)
 * return 5.0; if (percentage >= 70) return 4.0; if (percentage >= 60) return
 * 3.5; if (percentage >= 50) return 3.0; if (percentage >= 40) return 2.0; if
 * (percentage >= 33) return 1.0; return 0.0; } }
 */