package com.rufan.fullstackbackend.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TabAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.rufan.fullstackbackend.dto.TabulationSheetDto;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class PdfGenerationService {

    private static final String FONT_NIKOSH = "/fonts/NikoshBAN.ttf";

    public byte[] generateTabulationSheetPdf(TabulationSheetDto tabulationData) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        // Set page size to Legal and orientation to Landscape
        PageSize pageSize = PageSize.LEGAL.rotate(); // This sets landscape orientation
        PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
        Document document = new Document(pdfDoc, pageSize);

        // Initialize fonts
        PdfFont font;
        
        try {
            // Load NikoshBAN font
            font = PdfFontFactory.createFont(FONT_NIKOSH, PdfEncodings.IDENTITY_H);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load NikoshBAN font", e);
        }

        // Set margins
        document.setMargins(36, 36, 36, 36); // ~0.5 inch margins

        // Add header with school information
        addHeader(document, tabulationData, font);

        // Add exam info
        Paragraph examInfo = new Paragraph()
            .add(new Text("পরীক্ষার নাম: " + tabulationData.getExamName()).setFont(font).setFontSize(10))
            .add(new Tab())
            .addTabStops(new TabStop(300, TabAlignment.LEFT))
            .add(new Text("শিক্ষাবর্ষ: " + tabulationData.getExamYear()).setFont(font).setFontSize(10))
            .setTextAlignment(TextAlignment.LEFT);
        document.add(examInfo);
        document.add(new Paragraph("").setMarginBottom(10));

        // Determine all subjects dynamically
        Set<String> subjectNames = new LinkedHashSet<>();
        for (TabulationSheetDto.StudentResultRow student : tabulationData.getStudentResults()) {
            student.getSubjectsMap().forEach((name, marks) -> subjectNames.add(name));
        }

        // Add student table
        addStudentTable(document, tabulationData.getStudentResults(), subjectNames, font);

        document.close();
        return baos.toByteArray();
    }

    private void addHeader(Document document, TabulationSheetDto data, PdfFont font) {
        // Title
        document.add(new Paragraph("ট‌্যাবুলেশন শিট")
            .setFont(font)
            .setFontSize(16)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(10));
            
        // School information
        document.add(new Paragraph("বিদ‌্যালয়ের নাম- " + data.getSchoolName())
            .setFont(font)
            .setFontSize(12)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(2));
            
        document.add(new Paragraph(data.getSchoolAddress() + "।")
            .setFont(font)
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(2));
            
        document.add(new Paragraph("ইএমআইএস কোড: " + data.getEmisCode())
            .setFont(font)
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(15));

        // Exam information
        Paragraph examInfo = new Paragraph()
                .add(new Text("পরীক্ষার নাম: ").setFont(font))
                .add(data.getExamName() + "\n")
                .add(new Text("শিক্ষাবর্ষ: ").setFont(font))
                .add(data.getExamYear() + "\n")
                .add(new Text("শাখা: ").setFont(font))
                .add("N/A")
                .setTextAlignment(TextAlignment.LEFT)
                .setMarginBottom(15);
        document.add(examInfo);
    }

    private void addStudentTable(Document document, List<TabulationSheetDto.StudentResultRow> students, 
            Set<String> subjectNames, PdfFont font) {
        
        // Calculate table width based on number of subjects
        float[] columnWidths = new float[subjectNames.size() + 4]; // +4 for serial, roll, name, total
        columnWidths[0] = 30f; // Serial
        columnWidths[1] = 50f; // Roll
        columnWidths[2] = 150f; // Name
        
        // Distribute remaining width among subjects and total
        float availableWidth = PageSize.LEGAL.getWidth() - 230; // Total width - margins - fixed columns
        float subjectWidth = availableWidth / (subjectNames.size() + 1); // +1 for total column
        
        for (int i = 3; i < columnWidths.length; i++) {
            columnWidths[i] = subjectWidth;
        }
        
        Table table = new Table(columnWidths);
        table.setWidth(PageSize.LEGAL.getWidth() - 72); // Full width minus margins
        table.setFontSize(9);
        
        // Add table headers
        table.addHeaderCell(createHeaderCell("ক্র.নং.", font));
        table.addHeaderCell(createHeaderCell("রোল", font));
        table.addHeaderCell(createHeaderCell("শিক্ষার্থীর নাম", font));
        
        // Add subject headers
        List<String> sortedSubjects = new ArrayList<>(subjectNames);
        java.util.Collections.sort(sortedSubjects);
        for (String subject : sortedSubjects) {
            table.addHeaderCell(createHeaderCell(subject, font));
        }
        
        // Add total header
        table.addHeaderCell(createHeaderCell("সর্বমোট", font));
        
        // Add student rows
        int sl = 1;
        for (TabulationSheetDto.StudentResultRow student : students) {
            table.addCell(createCell(String.valueOf(sl++), font));
            table.addCell(createCell(student.getRollNo(), font));
            table.addCell(createCell(student.getStudentName(), font));
            
            // Add subject marks
            double totalMarks = 0;
            for (String subject : sortedSubjects) {
                TabulationSheetDto.StudentResultRow.SubjectMarks marks = student.getSubjectsMap().get(subject);
                if (marks != null) {
                    table.addCell(createCell(String.valueOf(marks.getTotalMarks()), font));
                    totalMarks += marks.getTotalMarks();
                } else {
                    table.addCell(createCell("-", font));
                }
            }
            
            // Add total marks
            table.addCell(createCell(String.format("%.2f", totalMarks), font));
        }
        
        document.add(table);
    }

    private Cell createHeaderCell(String content, PdfFont font) {
        return new Cell()
                .add(new Paragraph(content).setFont(font).setFontSize(9))
                .setTextAlignment(TextAlignment.CENTER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setPadding(3);
    }
    
    private Cell createCell(String content, PdfFont font) {
        return new Cell()
                .add(new Paragraph(content).setFont(font).setFontSize(9).setFont(font)) // Ensure regular font
                .setTextAlignment(TextAlignment.CENTER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .setPadding(3);
    }
}
