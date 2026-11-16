package com.example.backend_vitali.security;

import com.example.backend_vitali.user.AccountStatus;
import com.example.backend_vitali.user.AppUser;
import com.example.backend_vitali.user.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public JwtAuthFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization =
                request.getHeader("Authorization");

        /*
         * Si no hay Authorization, dejamos continuar.
         * Spring Security decidirá posteriormente si el endpoint
         * permite acceso anónimo o requiere autenticación.
         */
        if (authorization == null
                || !authorization.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token =
                authorization.substring(7).trim();

        if (token.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }

        try {

            Long userId =
                    jwtService.extractUserId(token);

            /*
             * Evitamos sobrescribir una autenticación
             * que ya exista.
             */
            /*
             * La firma y la expiración se validan antes de ir a la base,
             * y el usuario se consulta una sola vez por request.
             */
            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null
                    && jwtService.isTokenValid(token, userId)) {

                AppUser appUser =
                        userRepository.findById(userId)
                                .orElse(null);

                /*
                 * El usuario debe existir y estar activo.
                 */
                if (appUser != null
                        && appUser.getStatus()
                        == AccountStatus.ACTIVE) {

                    UserDetails userDetails =
                            userDetailsService.fromUser(appUser);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (JwtException
                 | IllegalArgumentException
                 | org.springframework.security.core.AuthenticationException exception) {

            /*
             * Token inválido, expirado o usuario inexistente.
             * No autenticamos la solicitud.
             */
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}