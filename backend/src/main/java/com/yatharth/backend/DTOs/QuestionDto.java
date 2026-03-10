package com.yatharth.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class QuestionDto {
    private String frontendId;
    private String title;
    private String slug;
    private String difficulty;
    private String status;
    private List<UserDto> users; //list of users who have solved this question
//    private List<String> topics;
}
