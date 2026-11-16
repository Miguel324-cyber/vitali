package com.example.backend_vitali.auth;
import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.http.ResponseEntity; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class PasswordResetController {
 private final PasswordResetService service; public PasswordResetController(PasswordResetService service){this.service=service;}
 public record ForgotRequest(@NotBlank @Email String email){} public record ResetRequest(@NotBlank String token,@NotBlank @Size(min=12,max=72) String password){}
 @PostMapping("/forgot-password") public ResponseEntity<?> forgot(@Valid @RequestBody ForgotRequest r){service.request(r.email()); return ResponseEntity.ok(java.util.Map.of("message","Si existe una cuenta activa con ese correo, recibirás instrucciones para restablecer la contraseña."));}
 @PostMapping("/reset-password") public ResponseEntity<?> reset(@Valid @RequestBody ResetRequest r){service.reset(r.token(),r.password()); return ResponseEntity.ok(java.util.Map.of("message","Contraseña actualizada correctamente."));}
}
