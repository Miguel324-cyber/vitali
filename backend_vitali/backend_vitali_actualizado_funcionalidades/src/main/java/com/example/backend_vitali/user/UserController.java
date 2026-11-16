
package com.example.backend_vitali.user;

import com.example.backend_vitali.auth.AuthDtos;
import com.example.backend_vitali.security.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse getCurrentUser() {
        // El username del principal es el correo; el ID se toma de CurrentUser.
        AppUser user = userService.getById(CurrentUser.getId());

        return new AuthDtos.UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
