package com.rufan.fullstackbackend.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.borders.Border;
import com.rufan.fullstackbackend.dto.MeritListDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.io.IOException;
import java.io.InputStream;

@Service
public class GenerateMeritListPdfService {
    private static final Logger logger = LoggerFactory.getLogger(GenerateMeritListPdfService.class);
    private static final String FONT_PATH = "fonts/NotoSansBengali-Regular.ttf";
    private static final String LOGO_GOVT = "/static/images/bd_govt.png";
    private static final String LOGO_DPE = "/static/images/bd_dpe.png";
    private PdfFont bengaliFont;
    
    private void addLogos(PdfDocument pdfDoc, Document document) {
        try {
            // Load left logo
            ImageData govtLogoData = ImageDataFactory.create(getClass().getResourceAsStream(LOGO_GOVT).readAllBytes());
            Image govtLogo = new Image(govtLogoData).scaleAbsolute(64, 64);
            
            // Load right logo
            ImageData dpeLogoData = ImageDataFactory.create(getClass().getResourceAsStream(LOGO_DPE).readAllBytes());
            Image dpeLogo = new Image(dpeLogoData).scaleAbsolute(64, 64);
            
            // Position the logos
            float y = pdfDoc.getDefaultPageSize().getTop() - 72; // 72 points = 1 inch from top
            
            // Left logo position
            govtLogo.setFixedPosition(36, y);
            
            // Right logo position
            dpeLogo.setFixedPosition(
                pdfDoc.getDefaultPageSize().getWidth() - 100, 
                y
            );
            
            // Add both images to the document
            document.add(govtLogo);
            document.add(dpeLogo);
            
        } catch (Exception e) {
            logger.error("Error loading logo images: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to load logo images", e);
        }
    }
    
    public byte[] generateMeritListPdf(List<MeritListDto> meritList, String examName, String examYear) throws Exception {
        // Load the Bengali font
        try {
            // Try to load the font from classpath resources
            try (var fontStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(FONT_PATH)) {
                if (fontStream == null) {
                    throw new IOException("Font file not found in classpath: " + FONT_PATH);
                }
                byte[] fontData = fontStream.readAllBytes();
                bengaliFont = PdfFontFactory.createFont(
                    fontData,
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
                );
                logger.info("Successfully loaded Bengali font from classpath: " + FONT_PATH);
            } catch (Exception fontError) {
                logger.warn("Error loading font with context classloader, trying direct path", fontError);
                // Try direct path as fallback
                bengaliFont = PdfFontFactory.createFont(
                    "src/main/resources/" + FONT_PATH,
                    PdfEncodings.IDENTITY_H,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
                );
            }
        } catch (Exception e) {
            logger.error("Error loading Bengali font, falling back to default font", e);
            try {
                bengaliFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
                logger.info("Using default font: " + StandardFonts.HELVETICA);
            } catch (Exception ex) {
                logger.error("Failed to load default font", ex);
                throw new RuntimeException("Failed to load any font", ex);
            }
        }
        
        if (meritList == null || meritList.isEmpty()) {
            throw new IllegalArgumentException("Merit list cannot be empty");
        }

        // Get class and section details from the first record
        MeritListDto firstRecord = meritList.get(0);
        String className = firstRecord.getClassName() != null ? firstRecord.getClassName() : "";
        String sectionName = firstRecord.getSectionName() != null ? firstRecord.getSectionName() : "";
        
        // Create the header with Bangla text using Bengali font
        Paragraph header = new Paragraph()
            .setFontSize(16)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER);
            
        // Add English text with default font
        header.add("Merit List: Class - ")
              .add(className)
              .add(sectionName.isEmpty() ? "" : " (" + sectionName + ")")
              .add("\n");
              
        // Add Bangla text with Bengali font
        header.add("Exam Name: ").setFont(bengaliFont)
              .add(examName != null ? examName : "N/A")
              .setFont(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD))
              .add(" | ")
              .add("Year: ").setFont(bengaliFont)
              .add(examYear != null ? examYear : "N/A");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        // iText PDF Document
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.LEGAL.rotate()); // Legal, landscape
        
        // Add logos at the top of the document
        addLogos(pdfDoc, document);
        document.setMargins(10, 10, 10, 10); // Minimum margins

        // Add header to document
        document.add(header);

        // School Info
        Paragraph schoolInfo = new Paragraph()
                .add("Kagapasha Government Primary School\n")
                .add("Kagapasha-3350, Baniyachong, Habiganj\n")
                .add("EMIS Code: 603040601 | Phone: 01717020632\n")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(10)
                .setMarginBottom(10);
        document.add(schoolInfo);

        // Exam Details
        Paragraph examInfo = new Paragraph()
                .add("Exam: " + examName + "  |  ")
                .add("Year: " + examYear + "  |  ")
                .add("Class: " + className)
                .add(sectionName != null && !sectionName.isEmpty() ? " (" + sectionName + ")" : "")
                .setTextAlignment(TextAlignment.CENTER)
                .setFontSize(11)
                .setBold()
                .setMarginBottom(15);
        document.add(examInfo);

        // Table columns - adjusted widths for better fit
        float[] columnWidths = {25f, 150f, 40f, 50f, 60f, 50f, 50f, 40f, 40f};
        Table table = new Table(columnWidths);
        table.setWidth(UnitValue.createPercentValue(100));
        table.setFontSize(10); // Slightly smaller font for better fit

        // Table header with styling
        String[] headerTitles = {"SL#", "Student Name", "Roll", "Total", "Obtained", "%", "GPA", "Grade", "Pos."};
        for (String title : headerTitles) {
            Cell headerCell = new Cell()
                .add(new Paragraph(title).setBold())
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(3);
            table.addHeaderCell(headerCell);
        }

        // Table rows
        int sl = 1;
        for (MeritListDto dto : meritList) {
            if (dto.getStudentName() == null || dto.getStudentName().trim().isEmpty()) {
                logger.warn("Skipping student with null or empty name");
                continue;
            }
            
            // SL#
            table.addCell(new Cell().add(new Paragraph(String.valueOf(sl++))).setTextAlignment(TextAlignment.CENTER));
            // Student Name (ensure non-null and trim any whitespace)
            String studentName = dto.getStudentName() != null ? dto.getStudentName().trim() : "";
            table.addCell(new Cell()
                .add(new Paragraph()
                    .setFont(bengaliFont)
                    .add(studentName))
                .setPaddingLeft(5));
            // Roll No.
            table.addCell(new Cell().add(new Paragraph(dto.getRollNo() != null ? dto.getRollNo().toString() : "")).setTextAlignment(TextAlignment.CENTER));
            // Total Possible Marks (sum of all subject marks)
            double totalPossibleMarks = dto.getTotalMarks() != null ? dto.getTotalMarks() : 0.0;
            table.addCell(new Cell().add(new Paragraph(String.format("%.0f", totalPossibleMarks))).setTextAlignment(TextAlignment.CENTER));
            // Obtained Marks (calculated from individual subjects)
            double obtainedMarks = dto.getObtainedMarks() != null ? dto.getObtainedMarks() : 0.0;
            table.addCell(new Cell().add(new Paragraph(String.format("%.0f", obtainedMarks))).setTextAlignment(TextAlignment.CENTER));
            // Percentage
            table.addCell(new Cell().add(new Paragraph(String.format("%.1f%%", dto.getPercentage()))).setTextAlignment(TextAlignment.CENTER));
            // GPA
            table.addCell(new Cell().add(new Paragraph(String.format("%.2f", dto.getGradePoint()))).setTextAlignment(TextAlignment.CENTER));
            // Grade
            table.addCell(new Cell().add(new Paragraph(dto.getLetterGrade() != null ? dto.getLetterGrade() : "")).setTextAlignment(TextAlignment.CENTER));
            // Position
            table.addCell(new Cell().add(new Paragraph(dto.getPosition() != null ? dto.getPosition().toString() : "")).setTextAlignment(TextAlignment.CENTER));
        }

        document.add(table);
        document.close();

        return baos.toByteArray();
    }
}
