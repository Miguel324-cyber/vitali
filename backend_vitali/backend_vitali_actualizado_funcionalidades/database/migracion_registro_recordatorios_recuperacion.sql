-- Migracion incremental de Viatli.
-- Los campos adicionales de doctor_profiles se agregan automaticamente mediante
-- spring.jpa.hibernate.ddl-auto=update al iniciar el backend.
-- Los siguientes CREATE son seguros para ejecutarse mas de una vez.
CREATE TABLE IF NOT EXISTS patient_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY(patient_user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
