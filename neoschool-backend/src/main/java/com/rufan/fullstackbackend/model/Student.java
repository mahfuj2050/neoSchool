package com.rufan.fullstackbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;   // Primary Key

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;   // Student ID (e.g., STU2023001)

    @Column(name = "roll_no", nullable = false, unique = true)
    private String rollNo;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "student_class", nullable = false)
    private String studentClass;

    @Column(name = "section")
    private String section;

    @Column(name = "main_subject", nullable = false)
    private Integer mainSubject;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "religion")
    private Religion religion;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "brn_no", unique = true)
    private String brnNo;  // Birth Registration Number

    @Column(name = "phone")
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "stipend")
    private StipendStatus stipend;

    // Enums
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    // Enums
    public enum Religion {
        Islam, Hindu, Other
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    public enum StipendStatus {
        APPROVED, REJECTED, PENDING
    }
}
