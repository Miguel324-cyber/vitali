package com.example.backend_vitali.security;

import com.example.backend_vitali.user.AppUser;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserPrincipal extends User {

    private final Long userId;
    private final String email;

    public CustomUserPrincipal(
            Long userId,
            String email,
            String password,
            Collection<? extends GrantedAuthority> authorities
    ) {
        super(email, password, authorities);

        this.userId = userId;
        this.email = email;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public static CustomUserPrincipal fromUser(
            AppUser user,
            Collection<? extends GrantedAuthority> authorities
    ) {
        return new CustomUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}