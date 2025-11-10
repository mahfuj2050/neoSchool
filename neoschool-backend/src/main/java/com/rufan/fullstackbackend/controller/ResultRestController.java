
package com.rufan.fullstackbackend.controller;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rufan.fullstackbackend.dto.MeritListDto;
import com.rufan.fullstackbackend.dto.ResultCardDto;
import com.rufan.fullstackbackend.dto.TabulationSheetDto;
import com.rufan.fullstackbackend.service.GenerateMeritListPdfService;
import com.rufan.fullstackbackend.service.GeneratePdfService;
import com.rufan.fullstackbackend.service.ResultService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController

@RequestMapping("/api/results")
public class ResultRestController {
    private static final Logger logger = LoggerFactory.getLogger(ResultRestController.class);

	@Autowired
	private GenerateMeritListPdfService generateMeritListPdfService;

	@Autowired
	private ResultService resultService;

	@Autowired
	private GeneratePdfService pdfGenerationService;
	
	@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
	@GetMapping(value = "/tabulation-pdf/{educationYear}/{examName}/{className}")
	public ResponseEntity<byte[]> getTabulationSheetPdf(
	        @PathVariable String educationYear,
	        @PathVariable String examName,
	        @PathVariable String className) {
	    
	    logger.info("Received PDF generation request - Year: {}, Exam: {}, Class: {}", 
	            educationYear, examName, className);

	    try {
	        logger.info("Generating tabulation data...");
	        List<TabulationSheetDto> tabulationData = resultService.generateTabulationSheet(educationYear, examName, className);
	        logger.info("Generated tabulation data for {} students", tabulationData.size());
	        
	        logger.info("Generating PDF...");
	        byte[] pdfBytes = pdfGenerationService.generateTabulationSheetPdf(tabulationData);
	        logger.info("Generated PDF with size: {} bytes", pdfBytes.length);

	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_PDF);
	        headers.setContentDispositionFormData("attachment", "tabulation-sheet.pdf");
	        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
	        headers.setContentLength(pdfBytes.length);

	        logger.info("Sending PDF response with headers: {}", headers);
	        return ResponseEntity.ok()
	                .headers(headers)
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(pdfBytes);
	    } catch (Exception e) {
	        logger.error("Error generating PDF: {}", e.getMessage(), e);
	        throw e;
	    }
	}

	/*-
	@GetMapping("/tabulation/{educationYear}/{examName}/{className}")
	public ResponseEntity<List<TabulationSheetDto>> getTabulationSheet(
			@PathVariable String educationYear,
			@PathVariable String examName,
			@PathVariable String className) {
		return ResponseEntity.ok(resultService.generateTabulationSheet(educationYear, examName, className));
	}
   */
	
	@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
	@GetMapping(value = "/merit-pdf/{educationYear}/{examName}/{className}")
	public ResponseEntity<byte[]> getMeritListPdf(
	        @PathVariable String educationYear,
	        @PathVariable String examName,
	        @PathVariable String className) {

	    logger.info("Generating Merit List PDF - Year: {}, Exam: {}, Class: {}", educationYear, examName, className);

	    try {
	        // Fetch top 10 students' merit list
	        List<MeritListDto> meritList = resultService.generateMeritList(className, examName, 10);
	        logger.info("Top {} students fetched", meritList.size());

	        if (meritList == null || meritList.isEmpty()) {
	            logger.warn("No students found for merit list with class: {}, exam: {}", className, examName);
	            Map<String, String> errorResponse = new HashMap<>();
	            errorResponse.put("message", "No students found for the selected criteria. Please check the exam and class selection.");
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .contentType(MediaType.APPLICATION_JSON)
	                    .body(errorResponse.toString().getBytes());
	        }

	        // Generate PDF with exam details
	        byte[] pdfBytes = generateMeritListPdfService.generateMeritListPdf(meritList, examName, educationYear);

	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_PDF);
	        headers.setContentDispositionFormData("attachment", "merit-list.pdf");
	        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
	        headers.setContentLength(pdfBytes.length);

	        logger.info("PDF generation completed, size: {} bytes", pdfBytes.length);
	        return ResponseEntity.ok()
	                .headers(headers)
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(pdfBytes);

	    } catch (Exception e) {
	        logger.error("Error generating Merit List PDF", e);
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	@GetMapping("/mark-sheet/{studentId}/{examName}")
	public ResponseEntity<ResultCardDto> getResultCard(

			@PathVariable Long studentId,

			@PathVariable String examName) {
		return ResponseEntity.ok(resultService.generateResultCard(studentId, examName));
	}

	/*-
	@GetMapping(value = "/test-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> testPdfGeneration() {
		try {
			// Create sample data for testing
			TabulationSheetDto.StudentResultRow.SubjectMarks banglaMarks = TabulationSheetDto.StudentResultRow.SubjectMarks.builder()
					.subjectName("Bangla")
					.caMarks(45.0)
					.aaMarks(45.0)
					.totalMarks(90.0)
					.build();

			TabulationSheetDto.StudentResultRow student1 = TabulationSheetDto.StudentResultRow.builder()
					.studentId(1L)
					.studentName("John Doe")
					.rollNo("101")
					.bangla(banglaMarks)
					.totalObtainedMarks(450.0)
					.totalFullMarks(500.0)
					.percentage(90.0)
					.letterGrade("A+")
					.gradePoint(5.0)
					.position(1)
					.build();

			TabulationSheetDto tabulationSheet = TabulationSheetDto.builder()
					.schoolName("Sample School")
					.schoolAddress("123 School St, City")
					.emisCode("SCH12345")
					.className("Class 5")
					.sectionName("A")
					.examName("Half Yearly Exam 2025")
					.examYear("2025")
					.studentResults(List.of(student1))
					.build();

			byte[] pdfBytes = pdfGenerationService.generateTabulationSheetPdf(tabulationSheet);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentDispositionFormData("filename", "test-tabulation-sheet.pdf");

			return ResponseEntity.ok()
					.headers(headers)
					.contentType(MediaType.APPLICATION_PDF)
					.body(pdfBytes);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.internalServerError().build();
		}
	}
	*/
}
