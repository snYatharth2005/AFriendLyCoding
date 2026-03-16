package com.yatharth.backend.Controller;

import com.yatharth.backend.DTOs.UserProfileDto;
import com.yatharth.backend.DTOs.UserProfileResponseDto;
import com.yatharth.backend.DTOs.UserSearchResponse;
import com.yatharth.backend.Service.UserSearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search/users")
public class UserSearchController {
    private final UserSearchService service;

    public UserSearchController(UserSearchService service){
        this.service = service;
    }

    @GetMapping("/get")
    public List<UserSearchResponse> userSearch(@RequestParam String query){
         return service.searchUsers(query);
    }

    @GetMapping("/profile")
    public UserProfileResponseDto getUserProfile(@RequestParam String username){
        return service.getProfile(username);
    }


}
