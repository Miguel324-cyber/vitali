package com.example.backend_vitali.security;

import com.example.backend_vitali.user.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:900000}") long expirationMs
    ) {

        byte[] keyBytes = resolveKeyBytes(secret);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret debe contener al menos 32 bytes."
            );
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * Acepta una clave Base64 (formato recomendado). Si JWT_SECRET no es
     * Base64 válido, usa el texto tal cual (UTF-8) en lugar de impedir el
     * arranque del servidor.
     */
    private static byte[] resolveKeyBytes(String secret) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "app.jwt.secret no está configurado."
            );
        }

        String trimmed = secret.trim();

        try {
            byte[] decoded = Decoders.BASE64.decode(trimmed);

            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (RuntimeException ignored) {
            // No es Base64: se usa como texto plano.
        }

        return trimmed.getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    /**
     * Genera el JWT para un usuario activo.
     */
    public String generateToken(AppUser user) {

        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException(
                    "No se puede generar un JWT sin usuario válido."
            );
        }

        if (user.getRole() == null) {
            throw new IllegalArgumentException(
                    "El usuario no tiene un rol válido."
            );
        }

        Instant now = Instant.now();
        Instant expiration = now.plusMillis(expirationMs);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Obtiene el ID del usuario desde el subject del JWT.
     */
    public Long extractUserId(String token) {

        Claims claims = parseClaims(token);

        String subject = claims.getSubject();

        if (subject == null || subject.isBlank()) {
            throw new JwtException(
                    "El token no contiene un usuario válido."
            );
        }

        try {

            Long userId = Long.valueOf(subject);

            if (userId <= 0) {
                throw new IllegalArgumentException();
            }

            return userId;

        } catch (RuntimeException exception) {

            throw new JwtException(
                    "El token contiene un usuario inválido."
            );
        }
    }

    /**
     * Valida firma, usuario y expiración.
     */
    public boolean isTokenValid(
            String token,
            Long expectedUserId
    ) {

        try {

            Claims claims = parseClaims(token);

            String subject = claims.getSubject();

            return subject != null
                    && expectedUserId != null
                    && subject.equals(expectedUserId.toString())
                    && claims.getExpiration() != null
                    && claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException exception) {

            return false;
        }
    }

    /**
     * Obtiene el rol guardado en el JWT.
     */
    public String extractRole(String token) {

        Claims claims = parseClaims(token);

        Object role = claims.get("role");

        if (role == null) {
            throw new JwtException(
                    "El token no contiene un rol."
            );
        }

        return role.toString();
    }

    /**
     * Analiza y verifica la firma del JWT.
     */
    private Claims parseClaims(String token) {

        if (token == null || token.isBlank()) {
            throw new JwtException(
                    "El token está vacío."
            );
        }

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}