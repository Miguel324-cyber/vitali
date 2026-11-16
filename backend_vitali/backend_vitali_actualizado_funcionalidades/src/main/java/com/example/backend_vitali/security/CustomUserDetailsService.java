package com.example.backend_vitali.security;

import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        AppUser user =
                userRepository.findByEmailIgnoreCase(email)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Usuario no encontrado."
                                )
                        );

        return buildUserDetails(user);
    }

    public UserDetails loadUserById(
            Long userId
    ) throws UsernameNotFoundException {

        if (userId == null || userId <= 0) {

            throw new UsernameNotFoundException(
                    "ID de usuario inválido."
            );
        }

        AppUser user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Usuario no encontrado."
                                )
                        );

        return buildUserDetails(user);
    }

    /** Construye el principal a partir de un usuario ya cargado (evita otra consulta). */
    public UserDetails fromUser(AppUser user) {
        return buildUserDetails(user);
    }

    private UserDetails buildUserDetails(
            AppUser user
    ) {

        String authority =
                "ROLE_" + user.getRole().name();

        return new CustomUserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                List.of(
                        new SimpleGrantedAuthority(authority)
                )
        );
    }
}