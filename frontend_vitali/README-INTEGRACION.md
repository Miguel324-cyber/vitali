# Viatli Frontend integrado

Frontend Next.js preparado para conectarse al backend Spring Boot del proyecto.

## Requisitos
- Node.js compatible con Next.js 16
- Backend Spring Boot ejecutándose en `http://localhost:8080`
- Base de datos SQLite del backend inicializada con sus migraciones/datos

## Instalación
```bash
npm install
cp .env.example .env.local
npm run dev
```
En Windows PowerShell, copia el archivo con:
```powershell
Copy-Item .env.example .env.local
```
Abre `http://localhost:3000`.

## Funcionalidades conectadas
- Inicio de sesión JWT; guarda `accessToken`, rol, ID y correo devueltos por `/api/auth/login`.
- Registro de paciente, médico y familiar.
- Perfil del paciente: consulta y actualización en `/api/patient/profile`.
- Solicitud, consulta y cancelación de citas del paciente.
- Bandeja de solicitudes y decisión de citas del médico.
- Catálogo de medicamentos y presentaciones desde `/api/medicamentos`.
- Registro de medicamentos/recetas y consulta del historial desde `/api/recetas`.
- Envío y consulta de dudas médicas desde `/api/consultas`.
- Invitación y vinculación familiar usando los endpoints reales `/api/family-invitations` y `/api/patients/me/family-links`.
- Aprobación de médicos y estadísticas de administración.

## Notas importantes de integración
1. El usuario autenticado debe iniciar sesión nuevamente para que el navegador guarde `userId`; el módulo de recetas/consultas lo utiliza porque los endpoints actuales de ese módulo piden `patientId`.
2. El backend actual no expone endpoints para recordatorios de toma, notificaciones/alertas clínicas, revisión médica de recetas, ni listado de recetas asignadas al médico. Por eso no se añadieron pantallas que simulen esas acciones.
3. **Seguridad pendiente en backend:** `MedicationWorkflowController` (`/api/recetas`, `/api/recetas/paciente/{patientId}`, `/api/consultas` y `/api/consultas/paciente/{patientId}`) no tiene `@PreAuthorize` y recibe `patientId` desde el cliente. Antes de usar datos reales, protege esos endpoints con roles y deriva el ID del paciente del principal autenticado (`CurrentUser`); el médico debe poder consultar/responder únicamente las consultas/recetas que tenga asignadas. El frontend no puede reemplazar esa autorización.
4. Los registros de medicamentos son informativos y quedan en estado `PENDIENTE_REVISION_MEDICA`; la interfaz no recomienda dosis ni sustituye la fórmula de un profesional.
5. Si el backend usa otro puerto/host, cambia `NEXT_PUBLIC_API_URL` en `.env.local`. Configura CORS en Spring Boot para permitir el origen del frontend.


## Nuevas pantallas
- Médico: `dashboard/doctor/patients` y ficha individual por paciente.
- Familiar: perfil editable, aceptación de vínculo y vista de información del paciente.
- Administrador: búsqueda/filtros, CRUD de usuarios y vínculos.
- Paciente: vínculo familiar e información básica del médico.
