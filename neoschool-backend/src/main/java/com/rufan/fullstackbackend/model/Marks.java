package com.rufan.fullstackbackend.model;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_exam_marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "student_id", insertable = false, updatable = false)
    private Student student;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(name = "class_name", nullable = false, length = 50)
    private String className;

    @Column(name = "class_roll", nullable = false)
    private Integer classRoll;
    
    @Column(name = "exam_name", nullable = false, length = 100)
    private String examName;
    
    @Column(name = "exam_date", updatable = false)
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime examDate;
    
    @Column(name = "education_year", length = 10)
    private String educationYear;
    
    @Column(name = "bn_sub_code")
    private String bnSubCode;
    
    @Column(name = "bangla_ca")
    private Double banglaCa;
    
    @Column(name = "bangla_aa")
    private Double banglaAa;
    
    @Column(name = "bangla_total")
    private Double banglaTotal;
    
    @Column(name = "en_sub_code")
    private String enSubCode;
    
    @Column(name = "english_ca")
    private Double englishCa;
    
    @Column(name = "english_aa")
    private Double englishAa;
    
    @Column(name = "english_total")
    private Double englishTotal;
    
    @Column(name = "ma_sub_code")
    private String maSubCode;
    
    @Column(name = "math_ca")
    private Double mathCa;
    
    @Column(name = "math_aa")
    private Double mathAa;
    
    @Column(name = "math_total")
    private Double mathTotal;

    @Column(name = "sc_sub_code")
    private String scSubCode;
    
    @Column(name = "science_ca")
    private Double scienceCa;
    
    @Column(name = "science_aa")
    private Double scienceAa;
    
    @Column(name = "science_total")
    private Double scienceTotal;
    
    @Column(name = "bwp_sub_code")
    private String bwpSubCode;
    
    @Column(name = "bwp_ca")
    private Double bwpCa;
    
    @Column(name = "bwp_aa")
    private Double bwpAa;
    
    @Column(name = "bwp_total")
    private Double bwpTotal;
    
    @Column(name = "ism_sub_code")
    private String ismSubCode;
    
    @Column(name = "islam_ca")
    private Double islamCa;
    
    @Column(name = "islam_aa")
    private Double islamAa;
    
    @Column(name = "islam_total")
    private Double islamTotal;
    
    @Column(name = "hin_sub_code")
    private String hinSubCode;
    
    @Column(name = "hindu_ca")
    private Double hinduCa;
    
    @Column(name = "hindu_aa")
    private Double hinduAa;
    
    @Column(name = "hindu_total")
    private Double hinduTotal;
    
    @Column(name = "sss_sub_code")
    private String sssSubCode;
    
    @Column(name = "sss_ca")
    private Double sssCa;
    
    @Column(name = "sss_aa")
    private Double sssAa;
    
    @Column(name = "sss_total")
    private Double sssTotal;
    
    @Column(name = "mus_sub_code")
    private String musSubCode;
    
    @Column(name = "music_phy_ca")
    private Double musicPhyCa;
    
    @Column(name = "music_phy_aa")
    private Double musicPhyAa;
    
    @Column(name = "music_total")
    private Double musicTotal;
    
    @Column(name = "art_sub_code")
    private String artSubCode;
    
    @Column(name = "art_craft_ca")
    private Double artCraftCa;
    
    @Column(name = "art_craft_aa")
    private Double artCraftAa;
    
    @Column(name = "art_total")
    private Double artTotal;
    
    @Column(name = "fa_sub_code")
    private String faSubCode;
    
    @Column(name = "fine_art_ca")
    private Double fineArtCa;
    
    @Column(name = "fine_art_aa")
    private Double fineArtAa;
    
    @Column(name = "fa_total")
    private Double faTotal;
    
    @Column(name = "phy_sub_code")
    private String phySubCode;
    
    @Column(name = "phy_edu_ca")
    private Double phyEduCa;
    
    @Column(name = "phy_edu_aa")
    private Double phyEduAa;
    
    @Column(name = "phy_total")
    private Double phyTotal;

    @Column(name = "total_marks") 
    private Double totalMarks;    
    // 👉 Full marks of ALL subjects (main + others).
    // Example: if 3 main subjects (3*100=300) + 2 optional subjects (3*50=150) => total_marks = 450

    @Column(name = "obtained_marks")
    private Double obtainedMarks; 
    // 👉 Obtained marks from ALL subjects combined

    @Column(name = "main_subject_total")  
    private Double mainSubjectTotal;  
    // 👉 Full marks of only main subjects (e.g., 3*100=300, 6*100=600)

    @Column(name = "main_subject_obtained")  
    private Double mainSubjectObtained;  
    // 👉 Obtained marks of only main subjects (e.g., 85+75+60=220)

    @Column(name = "marks_percentage") 
    private BigDecimal marksPercentage; 
    // 👉 Based on main subjects only = (main_subject_obtained / main_subject_total) * 100
    
    @Column(name = "average_marks") 
    private BigDecimal averageMarks; 
    // 👉 Based on main subjects only = main_subject_obtained / main_subject_total(3/6)

    @Column(name = "grade_point") 
    private BigDecimal grandePoint; //👉 Based on a helper method
    
@Column(name = "grade_letter") //👉 Based on a helper method
private String gradeLetter; 
    
@Column(name = "remarks", length = 255)
private String remarks;

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

    @Override
    public String toString() {
        return "Marks{" +
                "id=" + id +
                ", studentId=" + studentId +
                ", studentName='" + studentName + '\'' +
                ", className='" + className + '\'' +
                ", classRoll=" + classRoll +
                ", examName='" + examName + '\'' +
                ", examDate=" + examDate +
                ", obtainedMarks=" + obtainedMarks +
                ", totalMarks=" + totalMarks +
                ", marksPercentage=" + marksPercentage +
                ", gradeLetter='" + gradeLetter + '\'' +
                ", gradePoint=" + grandePoint +
                ", remarks='" + remarks + '\'' +
                '}';
    }
}
