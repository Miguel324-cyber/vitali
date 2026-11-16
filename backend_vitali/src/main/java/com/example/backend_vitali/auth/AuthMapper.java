
package com.example.backend_vitali.auth;

import com.example.backend_vitali.auth.AuthDtos.UserResponse;
import com.example.backend_vitali.user.AppUser;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public UserResponse toUserResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
