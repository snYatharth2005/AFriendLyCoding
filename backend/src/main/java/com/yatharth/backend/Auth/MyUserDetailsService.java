package com.yatharth.backend.Auth;

import com.yatharth.backend.Model.User;
import com.yatharth.backend.Model.UserPrinciple;
import com.yatharth.backend.Repository.UserRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class MyUserDetailsService implements UserDetailsService {
    private UserRepository repo;

    MyUserDetailsService(UserRepository repo){
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(@NotNull String username) throws UsernameNotFoundException {
        Optional<User> user = repo.findByUsername(username);

        if(user.isEmpty()){
            System.out.println("User Not Found");
            throw new UsernameNotFoundException("User Not Found");
        }

        return new UserPrinciple(user.get());
    }
}
