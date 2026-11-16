package com.example.backend_vitali.auth;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.LocalDateTime;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PasswordResetService {
 private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
 private final JdbcTemplate jdbc; private final PasswordEncoder encoder; private final ObjectProvider<JavaMailSender> mailProvider;
 @Value("${app.frontend-url:http://localhost:3000}") private String frontendUrl;
 @Value("${spring.mail.username:}") private String from;
 @Value("${spring.mail.host:}") private String mailHost;
 public PasswordResetService(JdbcTemplate jdbc, PasswordEncoder encoder, ObjectProvider<JavaMailSender> mailProvider) { this.jdbc=jdbc; this.encoder=encoder; this.mailProvider=mailProvider; }
 @PostConstruct void init(){ jdbc.execute("CREATE TABLE IF NOT EXISTS password_reset_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id))"); }
 @Transactional public void request(String email) {
  JavaMailSender mail=mailProvider.getIfAvailable();
  if(mail==null || mailHost.isBlank()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"El servicio de correo de recuperación no está configurado. Define MAIL_HOST, MAIL_USERNAME y MAIL_PASSWORD.");
  String normalized=email==null?"":email.trim().toLowerCase(Locale.ROOT);
  List<Map<String,Object>> users=jdbc.queryForList("SELECT id,email FROM users WHERE lower(email)=? AND status='ACTIVE'",normalized);
  if(users.isEmpty()) return;
  try {
   byte[] bytes=new byte[32]; SecureRandom.getInstanceStrong().nextBytes(bytes); String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
   Long userId=((Number)users.get(0).get("id")).longValue(); String hash=sha256(token); LocalDateTime now=LocalDateTime.now();
   jdbc.update("UPDATE password_reset_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL",now.toString(),userId);
   jdbc.update("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at,created_at) VALUES(?,?,?,?)",userId,hash,now.plusMinutes(20).toString(),now.toString());
   SimpleMailMessage msg=new SimpleMailMessage(); msg.setTo(normalized); if(!from.isBlank()) msg.setFrom(from); msg.setSubject("Restablecer contraseña de Viatli"); msg.setText("Recibimos una solicitud para cambiar tu contraseña. Abre este enlace dentro de los próximos 20 minutos:\n\n"+frontendUrl+"/reset-password?token="+token+"\n\nSi no solicitaste este cambio, ignora este mensaje."); mail.send(msg);
  } catch (Exception e){ log.error("No se pudo enviar el correo de recuperación de contraseña.", e); }
 }
 @Transactional public void reset(String token,String password) {
  if(token==null||token.isBlank()||password==null||password.length()<12||password.length()>72) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Enlace o contraseña no válidos. La contraseña debe tener entre 12 y 72 caracteres.");
  List<Map<String,Object>> rows=jdbc.queryForList("SELECT id,user_id,expires_at FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL",sha256(token));
  if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El enlace no es válido o ya fue utilizado.");
  Map<String,Object> row=rows.get(0); if(LocalDateTime.parse((String)row.get("expires_at")).isBefore(LocalDateTime.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"El enlace ha vencido. Solicita uno nuevo.");
  Long uid=((Number)row.get("user_id")).longValue(); jdbc.update("UPDATE users SET password_hash=?,updated_at=? WHERE id=?",encoder.encode(password),LocalDateTime.now().toString(),uid); jdbc.update("UPDATE password_reset_tokens SET used_at=? WHERE id=?",LocalDateTime.now().toString(),row.get("id"));
 }
 private String sha256(String v){ try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.UTF_8))); } catch(Exception e){ throw new IllegalStateException(e); } }
}
