package com.rufan.fullstackbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;   // Primary Key

    @Column(name = "name", nullable = false)
    private String name;  // Subject Name

    @Column(name = "code", nullable = false, unique = true)
    private String code;  // Subject Code

    @Enumerated(EnumType.STRING)
    @Column(name = "class_level", nullable = false)
    private ClassLevel classLevel;  // Class level (PRE_PRIMARY_4, PRE_PRIMARY_5, etc.)

    @Column(name = "marks")
    private Integer marks;  // Total marks for the subject

    @Enumerated(EnumType.STRING)
    @Column(name = "teacher")
    private TeacherName teacher;  // Teacher's name

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubjectStatus status;  // Active/Inactive status

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // Subject description

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ---------------- ENUMS ---------------- //
    public enum ClassLevel {
        PRE_PRIMARY_4("Pre Primary 4+"),
        PRE_PRIMARY_5("Pre Primary 5+"),
        CLASS_ONE("Class One"),
        CLASS_TWO("Class Two"),
        CLASS_THREE("Class Three"),
        CLASS_FOUR("Class Four"),
        CLASS_FIVE("Class Five");

        private final String displayName;

        ClassLevel(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum SubjectStatus {
        MAIN("Main"),
        SUB("Sub");

        private final String displayName;

        SubjectStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum TeacherName {
        MAHFUJ_KHAN("Mahfuj Khan"),
        SHEIKH_HASINA_BEGUM("Sheikh Hasina Begum"),
        PARTHA_SAROTHI_DAS("Partha Sarothi Das"),
        SABBYSACHI_ROY("Sabbysachi Roy"),
        SUPTI_TALUKDER("Supti Talukder"),
        ARIFUZZAMAN_KHAN("Arifuzzaman Khan");

        private final String teacherName;

        TeacherName(String teacherName) {
            this.teacherName = teacherName;
        }

        public String getTeacherName() {
            return teacherName;
        }
    }
}
