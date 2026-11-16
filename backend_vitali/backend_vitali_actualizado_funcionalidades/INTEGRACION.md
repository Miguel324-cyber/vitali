# Backend Vitali integrado

## Qué se conservó
- Se mantuvo como proyecto principal `backend_vitali` y el paquete Java
  `com.example.backend_vitali`.
- Se conservó la arquitectura principal: autenticación JWT, usuarios/roles,
  perfiles de paciente, médico y familiar, citas, auditoría, seguridad y CORS.
- No se mezcló el modelo `Usuario` del segundo backend con `AppUser`: el principal
  ya tiene una tabla `users` con roles y estados, y la migración SQL indica que
  recetas y consultas deben reutilizar esa tabla.

## Qué se incorporó
- La base `vitali.db` actualizada incluida en `files.zip`, que conserva las tablas
  del backend principal e incorpora `alertas_medicamentos`,
  `presentaciones_medicamento`, `reglas_dosis`, `receta`, `detalle_receta`,
  `consulta_medica` y `anti_sobremedicacion_readme`.
- Endpoints para consultar medicamentos, presentaciones y reglas.
- Endpoints básicos para registrar recetas y consultas, consultar historial y
  responder consultas médicas.

## Endpoints nuevos (requieren JWT, igual que el backend principal)
- `GET /api/medicamentos`
- `GET /api/medicamentos?q=paracetamol`
- `GET /api/medicamentos/presentaciones`
- `GET /api/medicamentos/presentaciones?medicamento=...`
- `GET /api/medicamentos/reglas?medicamento=...`
- `GET /api/medicamentos/buscar?nombre=...`
- `POST /api/recetas`
- `GET /api/recetas/paciente/{patientId}`
- `POST /api/consultas`
- `GET /api/consultas/paciente/{patientId}`
- `POST /api/consultas/{consultationId}/responder`

### Ejemplo POST /api/recetas
```json
{
  "patientId": 12,
  "items": [
    {
      "medicine": "Nombre del medicamento",
      "indicatedDose": "Según fórmula médica",
      "presentationId": 1,
      "unitsPerDay": 2,
      "consumptionUnit": "tableta",
      "indication": "Indicación registrada por el profesional",
      "treatmentDays": 5
    }
  ]
}
```

### Ejemplo POST /api/consultas
```json
{
  "patientId": 12,
  "recipeId": 1,
  "message": "Tengo una duda sobre la fórmula."
}
```

### Ejemplo POST /api/consultas/{consultationId}/responder
```json
{
  "doctorId": 3,
  "answer": "Respuesta del profesional."
}
```

## Importante sobre seguridad y uso clínico
La autenticación JWT existente se mantiene. Los endpoints nuevos quedan protegidos
por la regla `.anyRequest().authenticated()` del backend principal. Antes de
publicar, se debe reforzar la autorización por propiedad del recurso: validar que
el paciente autenticado sea el dueño de la receta/consulta y que quien responda
sea el médico asignado o autorizado. Los IDs de paciente/médico de estos endpoints
son una integración inicial, no un sustituto de esa autorización.

El registro de recetas queda en estado `PENDIENTE_REVISION_MEDICA`. No se calcula
ni diagnostica sobredosis automáticamente: el segundo ZIP contiene un controlador
que depende de clases/repositorios que no vienen incluidos y no debe copiarse
incompleto ni presentar un resultado de dosis como diagnóstico. La información
de reglas es de referencia y requiere validación profesional.

## Base de datos
La aplicación usa `./vitali.db` desde la carpeta raíz del proyecto. Haz una copia
de seguridad antes de modificar datos. La migración SQL original se conserva en
`database/migracion_anti_sobremedicacion.sql` como documentación; no es necesario
ejecutarla sobre el archivo integrado porque `files.zip` ya contiene las tablas.

## Cambios adicionales: registro, recuperación y recordatorios

- El registro de pacientes consulta `GET /api/medicamentos` y guarda la selección ordenada en `patient_profiles.medications`.
- El registro de médicos ahora captura documento, teléfono, nacimiento, universidad, año de grado, experiencia, modalidad y perfil profesional. La especialidad se consulta desde `GET /api/auth/specialties` y se valida en el backend.
- Recuperación: `POST /api/auth/forgot-password` y `POST /api/auth/reset-password`. Para enviar enlaces reales configura `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` y `FRONTEND_URL` en el entorno del backend. El token dura 20 minutos y se almacena únicamente como hash.
- Recordatorios: `GET/POST /api/patient/reminders`, `PATCH /api/patient/reminders/{id}/completed` y `DELETE /api/patient/reminders/{id}`. Cada registro queda asociado al paciente autenticado.
- El perfil de paciente ahora devuelve también correo, especialidad y registro del médico asignado cuando existe la relación `patient_profiles.assigned_doctor_id`.
- Hibernate actualiza las columnas nuevas de `doctor_profiles`; las tablas de recordatorios y recuperación se crean automáticamente al iniciar. También se incluye `database/migracion_registro_recordatorios_recuperacion.sql` como referencia.

### Configuración SMTP de ejemplo (PowerShell)

```powershell
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="tu-correo@gmail.com"
$env:MAIL_PASSWORD="tu-clave-de-aplicacion"
$env:FRONTEND_URL="http://localhost:3000"
```

Usa una contraseña de aplicación del proveedor de correo; no la contraseña normal de la cuenta. No subas estas variables ni credenciales al repositorio.

## Funcionalidades agregadas
- Gestión de citas por médico: aceptación, rechazo, modificación y cancelación.
- Consultas del tratamiento restringidas al paciente, su médico asignado o su familiar vinculado.
- Médico con múltiples pacientes y ficha individual con tratamientos, citas y consultas.
- Vínculo familiar único por paciente con aceptación y captura de parentesco/detalles.
- Perfil familiar editable y acceso a la información clínica autorizada del paciente.
- Administración con búsqueda/filtros de usuarios, CRUD de cuentas, asignación médico-paciente y consulta de vínculos.
- Perfil del paciente muestra familiar y botón de información básica del médico.
