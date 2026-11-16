package com.example.backend_vitali.patient;

import com.example.backend_vitali.security.CurrentUser;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/patient/reminders")
@PreAuthorize("hasRole('PATIENT')")
public class PatientReminderController {
 private final JdbcTemplate jdbc;
 public PatientReminderController(JdbcTemplate jdbc) { this.jdbc = jdbc; }
 @PostConstruct void init() { jdbc.execute("CREATE TABLE IF NOT EXISTS patient_reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_user_id INTEGER NOT NULL, title TEXT NOT NULL, reason TEXT NOT NULL, scheduled_at TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, FOREIGN KEY(patient_user_id) REFERENCES users(id))"); }
 public record ReminderRequest(@NotBlank @Size(max=120) String title, @NotBlank @Size(max=500) String reason, @NotNull LocalDateTime scheduledAt) {}
 @GetMapping public List<Map<String,Object>> list() { return jdbc.queryForList("SELECT id, title, reason, scheduled_at AS scheduledAt, completed, created_at AS createdAt FROM patient_reminders WHERE patient_user_id = ? ORDER BY scheduled_at ASC", CurrentUser.getId()); }
 @PostMapping public Map<String,Object> create(@Valid @RequestBody ReminderRequest r) {
  Long uid=CurrentUser.getId(); jdbc.update("INSERT INTO patient_reminders(patient_user_id,title,reason,scheduled_at,completed,created_at) VALUES(?,?,?,?,0,?)",uid,r.title().trim(),r.reason().trim(),r.scheduledAt().toString(),LocalDateTime.now().toString());
  Long id=jdbc.queryForObject("SELECT last_insert_rowid()",Long.class); return jdbc.queryForMap("SELECT id,title,reason,scheduled_at AS scheduledAt,completed,created_at AS createdAt FROM patient_reminders WHERE id=? AND patient_user_id=?",id,uid);
 }
 @PatchMapping("/{id}/completed") public Map<String,Object> complete(@PathVariable Long id,@RequestBody Map<String,Boolean> body) {
  int n=jdbc.update("UPDATE patient_reminders SET completed=? WHERE id=? AND patient_user_id=?",Boolean.TRUE.equals(body.get("completed"))?1:0,id,CurrentUser.getId());
  if(n==0) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
  return Map.of("id",id,"completed",Boolean.TRUE.equals(body.get("completed")));
 }
 @DeleteMapping("/{id}") public org.springframework.http.ResponseEntity<Void> delete(@PathVariable Long id) {
  int n=jdbc.update("DELETE FROM patient_reminders WHERE id=? AND patient_user_id=?",id,CurrentUser.getId());
  return n==0?org.springframework.http.ResponseEntity.notFound().build():org.springframework.http.ResponseEntity.noContent().build();
 }
}
