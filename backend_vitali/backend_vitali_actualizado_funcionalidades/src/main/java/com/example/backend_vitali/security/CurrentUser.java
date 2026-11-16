package com.example.backend_vitali.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {

    private CurrentUser() {
    }

    public static Long getId() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new AccessDeniedException(
                    "Debes iniciar sesión."
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserPrincipal userPrincipal)) {

            throw new AccessDeniedException(
                    "No se pudo identificar al usuario autenticado."
            );
        }

        Long userId =
                userPrincipal.getUserId();

        if (userId == null || userId <= 0) {

            throw new AccessDeniedException(
                    "El usuario autenticado no tiene un ID válido."
            );
        }

        return userId;
    }

    public static String getEmail() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            throw new AccessDeniedException(
                    "Debes iniciar sesión."
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof CustomUserPrincipal userPrincipal)) {

            throw new AccessDeniedException(
                    "No se pudo identificar al usuario autenticado."
            );
        }

        return userPrincipal.getEmail();
    }

    public static boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role));
    }
}