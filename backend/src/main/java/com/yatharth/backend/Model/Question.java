package com.yatharth.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Table(
        name = "question",
        indexes = {
                @Index(name = "idx_question_slug", columnList = "slug", unique = true)
        }
)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq")
    @SequenceGenerator(name = "seq", allocationSize = 4000)
    private Long id;

    private String frontendId;
    private String title;
    private String difficulty;
    private String slug;
    private String status;

//    private List<String> topics;

    @OneToMany(mappedBy = "question")
    List<SolvedQuestion> solvedQuestions;
}
