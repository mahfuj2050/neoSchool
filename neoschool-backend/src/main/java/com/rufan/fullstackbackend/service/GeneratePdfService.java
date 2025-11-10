package com.rufan.fullstackbackend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.font.constants.StandardFonts;
import java.util.Map;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.borders.Border;
import com.rufan.fullstackbackend.dto.TabulationSheetDto;
import com.rufan.fullstackbackend.dto.TabulationSheetDto.StudentResultRow.SubjectMarks;

@Service
public class GeneratePdfService {
    private static final Logger logger = LoggerFactory.getLogger(GeneratePdfService.class);
    private static final String FONT_REGULAR = "/fonts/NotoSansBengali-Regular.ttf";
    private static final String FONT_BOLD = "/fonts/NotoSansBengali-Bold.ttf";
    private static final String LOGO_GOVT = "/static/images/bd_govt.png";
    private static final String LOGO_DPE = "/static/images/bd_dpe.png";
    //private static final String FONT_REGULAR = "/fonts/SolaimanLipi.ttf";
    
    private static final Map<String, String> ALL_SUBJECTS = Map.ofEntries(
        Map.entry("BAN", "বাংলা"),
        Map.entry("ENG", "ইংরেজি"),
        Map.entry("MATH", "গণিত"),
        Map.entry("SCI", "বিজ্ঞান"),
        Map.entry("BWP", "বাংলাদেশ ও বিশ্ব পরিচয়"),
        Map.entry("ISL", "ইসলাম ধর্ম শিক্ষা"),
        Map.entry("HIN", "হিন্দু ধর্ম শিক্ষা"),
        Map.entry("SSS", "সমন্বিত সামাজিক বিজ্ঞান"),
        Map.entry("MUS", "সংগীত ও শারীরিক শিক্ষা"),
        Map.entry("ART", "চারু ও কারুকলা"),
        Map.entry("FA", "শিল্পকলা"),
        Map.entry("PE", "শারীরিক শিক্ষা ও মানসিক স্বাস্থ্য সুরক্ষা")
    );
    
    public byte[] generateTabulationSheetPdf(List<TabulationSheetDto> tabulationDataList) {
        if (tabulationDataList == null || tabulationDataList.isEmpty()) {
            throw new IllegalArgumentException("Tabulation data list cannot be null or empty");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument pdfDoc = null;
        Document document = null;
        
        try {
            logger.info("Starting PDF generation for {} tabulation records", tabulationDataList.size());
            
            TabulationSheetDto firstRecord = tabulationDataList.get(0);
            logger.debug("First record data - School: {}, Class: {}, Exam: {}", 
                firstRecord.getSchoolName(), 
                firstRecord.getClassName(), 
                firstRecord.getExamName());
            
            // Initialize font with fallback to standard font if custom font fails
            PdfFont fontRegular;
            PdfFont fontBold;
            try {
                fontRegular = PdfFontFactory.createFont(FONT_REGULAR, PdfEncodings.IDENTITY_H);
                fontBold = PdfFontFactory.createFont(FONT_BOLD, PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                logger.warn("Using fallback font as Bengali font could not be loaded: {}", e.getMessage());
                fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                fontBold = PdfFontFactory.createFont(FONT_BOLD, StandardFonts.HELVETICA);
            }
            
            // Initialize PDF document with landscape orientation
            PdfWriter writer = new PdfWriter(baos);
            pdfDoc = new PdfDocument(writer);
            document = new Document(pdfDoc, PageSize.LEGAL.rotate());
            
            // Set document properties with smaller margins to fit more content
            document.setMargins(10, 10, 10, 10);
            
            // Add main title and header (only once)
            if (!tabulationDataList.isEmpty()) {
                TabulationSheetDto firstData = tabulationDataList.get(0);
                document.add(new Paragraph("Tabulation Sheet")
                    .setFont(fontBold)
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(5));
                
                // Add header info (school name, exam info, etc.)
                addHeader(document, firstData, fontBold, pdfDoc);
                
                // Create a single table for all students
                createUnifiedStudentTable(document, tabulationDataList, fontRegular);
            }
            
            // Close the document to ensure all content is written
            if (document != null) {
                document.close();
            }
            
            byte[] pdfBytes = baos.toByteArray();
            logger.info("Successfully generated PDF. Size: {} bytes", pdfBytes.length);
            
            if (pdfBytes.length < 200) { // PDF header is usually more than 200 bytes
                logger.warn("Generated PDF is suspiciously small. Size: {} bytes", pdfBytes.length);
                logger.warn("First 100 bytes: {}", Arrays.toString(Arrays.copyOfRange(pdfBytes, 0, Math.min(100, pdfBytes.length))));
            }
            
            return pdfBytes;
            
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        } finally {
            // Ensure resources are properly closed even if an exception occurs
            try {
                if (document != null && !document.getPdfDocument().isClosed()) {
                    document.close();
                } else if (pdfDoc != null && !pdfDoc.isClosed()) {
                    pdfDoc.close();
                }
                baos.close();
            } catch (Exception e) {
                logger.warn("Error closing PDF resources: {}", e.getMessage());
            }
        }
    }

    private void addLogos(PdfDocument pdfDoc, Document document) {
        try {
            // Load left logo
            ImageData govtLogoData = ImageDataFactory.create(getClass().getResource(LOGO_GOVT));
            Image govtLogo = new Image(govtLogoData).scaleAbsolute(64, 64);
            govtLogo.setFixedPosition(pdfDoc.getNumberOfPages(), 36, 
                pdfDoc.getDefaultPageSize().getTop() - 72); // left margin, top offset
    
            // Load right logo
            ImageData dpeLogoData = ImageDataFactory.create(getClass().getResource(LOGO_DPE));
            Image dpeLogo = new Image(dpeLogoData).scaleAbsolute(64, 64);
            dpeLogo.setFixedPosition(pdfDoc.getNumberOfPages(), 
                pdfDoc.getDefaultPageSize().getWidth() - 100, 
                pdfDoc.getDefaultPageSize().getTop() - 72); // right margin, top offset
    
            // Add both images to document (absolute positioning)
            document.add(govtLogo);
            document.add(dpeLogo);
    
        } catch (Exception e) {
            logger.warn("Could not load logo images: {}", e.getMessage());
        }
    }
    
    
    private void addHeader(Document document, TabulationSheetDto data, PdfFont fontBold, PdfDocument pdfDoc) throws IOException {
        // Add logos at the top
        addLogos(pdfDoc, document);
        // Create regular font
        PdfFont fontRegular;
        try {
            fontRegular = PdfFontFactory.createFont(FONT_REGULAR, PdfEncodings.IDENTITY_H);
        } catch (Exception e) {
            fontRegular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
        }

        // School header
        document.add(new Paragraph(data.getSchoolName())
                .setFont(fontBold)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER));
                
        document.add(new Paragraph(data.getSchoolAddress())
                .setFont(fontBold)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));
                
        document.add(new Paragraph("EMIS Code: " + data.getEmisCode())
                .setFont(fontBold)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.CENTER));

        // Exam info with academic year
        String academicYear = data.getExamYear() != null && !data.getExamYear().isEmpty() 
                ? data.getExamYear() 
                : String.valueOf(java.time.Year.now().getValue());
        
        Paragraph examInfo = new Paragraph()
                .add(new Text("Exam: ").setFont(fontBold).setFontSize(8))
                .add(new Text(data.getExamName()).setFont(fontRegular).setFontSize(8))
                .add("  |  ")
                .add(new Text("Class: ").setFont(fontBold).setFontSize(8))
                .add(new Text(data.getClassName()).setFont(fontRegular).setFontSize(8));
                
        // Only add academic year if it's not empty
        if (academicYear != null && !academicYear.isEmpty()) {
            examInfo
                .add("  |  ")
                .add(new Text("Academic Year: ").setFont(fontBold).setFontSize(8))
                .add(new Text(academicYear).setFont(fontRegular).setFontSize(8));
        }
        
        examInfo
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(10);
                
        document.add(examInfo);
    }

    private void createUnifiedStudentTable(Document document, List<TabulationSheetDto> tabulationDataList, PdfFont fontRegular) {
        // Check if the input list is empty
        if (tabulationDataList == null || tabulationDataList.isEmpty()) {
            logger.warn("No tabulation data provided");
            return;
        }
        
        // Process each tabulation data
        for (TabulationSheetDto data : tabulationDataList) {
            if (data == null || data.getStudentResults() == null) {
                logger.warn("Skipping null data or student results");
                continue;
            }
            
            // Create a new mutable list from the student results and sort by total marks
            List<TabulationSheetDto.StudentResultRow> sortedStudents = new ArrayList<>(data.getStudentResults());
            
            // Sort by total obtained marks in descending order
            sortedStudents.sort((s1, s2) -> 
                Double.compare(s2.getTotalObtainedMarks(), s1.getTotalObtainedMarks())
            );
            
            // Assign positions with proper tie handling
            int position = 1;
            for (int i = 0; i < sortedStudents.size(); i++) {
                TabulationSheetDto.StudentResultRow current = sortedStudents.get(i);
                if (i > 0) {
                    TabulationSheetDto.StudentResultRow previous = sortedStudents.get(i-1);
                    if (Math.abs(current.getTotalObtainedMarks() - previous.getTotalObtainedMarks()) > 0.001) {
                        position = i + 1;
                    }
                }
                current.setPosition(position);
            }
            
            // Update the data with the sorted students
            data.setStudentResults(sortedStudents);
        }
        
        // Process all students across all classes for merit position calculation
        if (tabulationDataList.isEmpty()) {
            return;
        }
        
        TabulationSheetDto lastData = tabulationDataList.get(tabulationDataList.size() - 1);
        List<TabulationSheetDto.StudentResultRow> allStudents = new ArrayList<>();
        
        // Collect all students from all classes
        tabulationDataList.forEach(data -> {
            if (data.getStudentResults() != null) {
                allStudents.addAll(data.getStudentResults().stream()
                    .filter(student -> student != null && student.getRollNo() != null && !student.getRollNo().isEmpty())
                    .collect(java.util.stream.Collectors.toList()));
            }
        });
        
        // Sort students by total obtained marks in descending order
        allStudents.sort((s1, s2) -> 
            Double.compare(s2.getTotalObtainedMarks(), s1.getTotalObtainedMarks())
        );
        
        // Assign merit positions with proper tie handling
        int position = 1;
        for (int i = 0; i < allStudents.size(); i++) {
            TabulationSheetDto.StudentResultRow current = allStudents.get(i);
            if (i > 0) {
                TabulationSheetDto.StudentResultRow previous = allStudents.get(i-1);
                if (Math.abs(current.getTotalObtainedMarks() - previous.getTotalObtainedMarks()) > 0.001) {
                    position = i + 1;
                }
            }
            current.setPosition(position);
        }
        
        // Calculate subject totals across all classes
        Map<String, Double> subjectTotals = new HashMap<>();
        for (TabulationSheetDto.StudentResultRow student : allStudents) {
            if (student.getSubjectsMap() != null) {
                student.getSubjectsMap().forEach((subjectCode, marks) -> {
                    if (marks != null) {
                        double total = marks.getCaMarks() + marks.getAaMarks();
                        subjectTotals.merge(subjectCode, total, Double::sum);
                    }
                });
            }
        }
        
        // Remove any existing total row to avoid duplicates
        lastData.getStudentResults().removeIf(student -> student.getRollNo() == null || student.getRollNo().isEmpty());
        
        // Add total row to the last class data
        TabulationSheetDto.StudentResultRow totalRow = new TabulationSheetDto.StudentResultRow();
        totalRow.setStudentName("মোট");
        totalRow.setRollNo("");
        totalRow.setSubjectsMap(new HashMap<>());
        
        // Add subject totals to the total row
        for (String subjectCode : ALL_SUBJECTS.keySet()) {
            Double total = subjectTotals.getOrDefault(subjectCode, 0.0);
            SubjectMarks marks = new SubjectMarks();
            marks.setCaMarks(total);
            marks.setAaMarks(0);
            marks.setTotalMarks(total);
            totalRow.getSubjectsMap().put(subjectCode, marks);
        }
        
        // Add the total row to the last class
		/*
		 * if (lastData.getStudentResults() != null) {
		 * lastData.getStudentResults().add(totalRow); }
		 */
        
        // Calculate table dimensions
        int subjectCount = ALL_SUBJECTS.size();
        int totalColumns = 3 + subjectCount + 4; // SL, Name, Roll + subjects + Total, Grade Point, Grade, Position

        float[] columnWidths = new float[totalColumns];
        
        // Set column widths
        columnWidths[0] = 4;   // SL No
        columnWidths[1] = 18;  // Student Name
        columnWidths[2] = 8;   // Roll No
        
        // Set subject column widths
        for (int i = 3; i < 3 + subjectCount; i++) {
            columnWidths[i] = 7f;
        }
        
        // Set remaining column widths
        columnWidths[3 + subjectCount] = 7;  // Total
        columnWidths[4 + subjectCount] = 5;  // Grade Point
        columnWidths[5 + subjectCount] = 5;  // Grade
        columnWidths[6 + subjectCount] = 5;  // Position

        
        // Create the main table
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setFixedLayout();
        table.setMarginTop(10);
        table.setFontSize(7);
        
        // Add table headers
        table.addHeaderCell(createHeaderCell("SL#", fontRegular));
        table.addHeaderCell(createHeaderCell("Student Name", fontRegular));
        table.addHeaderCell(createHeaderCell("Roll No.", fontRegular));
        
        // Add subject headers
        for (String subjectCode : ALL_SUBJECTS.keySet()) {
            table.addHeaderCell(createHeaderCell(subjectCode, fontRegular));
        }
        
        table.addHeaderCell(createHeaderCell("Total", fontRegular));
        table.addHeaderCell(createHeaderCell("Grade Point", fontRegular));
        table.addHeaderCell(createHeaderCell("Grade", fontRegular));
        table.addHeaderCell(createHeaderCell("Position", fontRegular));

        
        // Add all students from all classes
        int slNo = 1;
        for (TabulationSheetDto data : tabulationDataList) {
            if (data.getStudentResults() == null) continue;

            for (TabulationSheetDto.StudentResultRow student : data.getStudentResults()) {
                if (student == null) continue;

                boolean isTotalRow = student.getRollNo().isEmpty() || "মোট".equals(student.getStudentName());
                double totalObtained = 0;

                // Add student info
                table.addCell(createCell(String.valueOf(slNo++), fontRegular));
                table.addCell(createCell(student.getStudentName() != null ? student.getStudentName() : "", fontRegular));
                table.addCell(createCell(student.getRollNo() != null ? student.getRollNo() : "", fontRegular));

                // Add subject marks
                for (String subjectCode : ALL_SUBJECTS.keySet()) {
                    if (student.getSubjectsMap() != null && student.getSubjectsMap().containsKey(subjectCode)) {
                        SubjectMarks marks = student.getSubjectsMap().get(subjectCode);
                        if (marks != null) {
                            // For all rows, show CA + AA = Total
                            String markText = String.format("%.0f+%.0f=%.0f", 
                                marks.getCaMarks(), 
                                marks.getAaMarks(), 
                                marks.getTotalMarks());
                            table.addCell(createCell(markText, fontRegular));
                            totalObtained += marks.getTotalMarks();
                            continue;
                        }
                    }
                    table.addCell(createCell("", fontRegular));
                }
                
                // Add total marks
                if (isTotalRow) {
                    table.addCell(createCell(String.format("%.0f", totalObtained), fontRegular));
                } else {
                    double totalFullMarks = student.getTotalFullMarks();
                    table.addCell(createCell(String.format("%.0f/%.0f", totalObtained, totalFullMarks), fontRegular));
                }
                
             // 👉 Add Grade Point here
                table.addCell(createCell(
                    student.getGradePoint() > 0 ? String.format("%.2f", student.getGradePoint()) : "", 
                    fontRegular
                ));
                
                // Add grade and grade point
                table.addCell(createCell(student.getLetterGrade() != null ? student.getLetterGrade() : "", fontRegular));
                
                // Format position with proper suffix (1st, 2nd, 3rd, etc.)
                String formattedPosition = "";
                if (student.getPosition() > 0 && !isTotalRow) {
                    int pos = student.getPosition();
                    int lastDigit = pos % 10;
                    int lastTwoDigits = pos % 100;
                    
                    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
                        formattedPosition = pos + "th";
                    } else {
                        switch (lastDigit) {
                            case 1: formattedPosition = pos + "st"; break;
                            case 2: formattedPosition = pos + "nd"; break;
                            case 3: formattedPosition = pos + "rd"; break;
                            default: formattedPosition = pos + "th";
                        }
                    }
                }
                table.addCell(createCell(formattedPosition, fontRegular));
            }
        }
        
        // Add the table to the document
        document.add(table);
    }
    
    // addStudentTable method has been removed as we're using createUnifiedStudentTable

	private Cell createHeaderCell(String content, PdfFont font) {
		return new Cell()
				.add(new Paragraph(content)
						.setFont(font)
						.setFontSize(8)
						.setTextAlignment(TextAlignment.CENTER)
						.setMargin(0))
				.setBackgroundColor(ColorConstants.LIGHT_GRAY)
				.setPaddingTop(4)
				.setPaddingBottom(4)
				.setPaddingLeft(2)
				.setPaddingRight(2)
				.setTextAlignment(TextAlignment.CENTER)
				.setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
	}

	private Cell createCell(String content, PdfFont font) {
		// Handle null or empty content
		String displayContent = (content == null || content.trim().isEmpty()) ? "" : content.trim();
		
		return new Cell()
				.add(new Paragraph(displayContent)
						.setFont(font)
						.setFontSize(8)
						.setTextAlignment(TextAlignment.CENTER)
						.setMargin(0))
				.setPaddingTop(3)
				.setPaddingBottom(3)
				.setPaddingLeft(2)
				.setPaddingRight(2)
				.setTextAlignment(TextAlignment.CENTER)
				.setVerticalAlignment(com.itextpdf.layout.properties.VerticalAlignment.MIDDLE);
	}
}
