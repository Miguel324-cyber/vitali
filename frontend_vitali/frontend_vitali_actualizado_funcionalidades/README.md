# Viatli — Frontend

Aplicación web (Next.js 16 + React 19 + Tailwind 4) para pacientes, médicos, familiares y administradores. Consume la API REST del backend Spring Boot (`backend_vitali_actualizado_funcionalidades`).

## Requisitos

- Node.js compatible con Next.js 16.
- Backend en ejecución, por defecto en `http://localhost:8080`.

## Puesta en marcha

```powershell
npm install
Copy-Item .env.example .env.local   # en Linux/macOS: cp .env.example .env.local
npm run dev                         # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` (en `.env.local`) indica la URL del backend.

`npm run dev` compila cada página la primera vez que se abre, así que la primera navegación es lenta. Para una demostración usa `npm run build` seguido de `npm start`. Si instalas paquetes con el servidor de desarrollo encendido, reinícialo.

## Roles y pantallas

| Rol | Inicio | Funciones principales |
| --- | --- | --- |
| Paciente | `/dashboard/patient` | Perfil, recetas y medicamentos (análisis de dosis e interacciones, subir foto o PDF de la receta), citas, dudas al médico con notificaciones |
| Médico | `/dashboard/doctor` | Pacientes asignados con buscador, ficha con tratamiento, asignar o finalizar tratamientos, responder dudas, citas |
| Familiar | `/dashboard/family` | Invitaciones y vínculo con el paciente |
| Administrador | `/dashboard/admin` | Aprobación de médicos, gestión de pacientes, médicos, familiares, vínculos, recetas y catálogo |

Todas las pantallas de los paneles comparten una barra superior con botón **Inicio** y menú de cuenta (nombre, rol y cerrar sesión).

## Reglas de negocio visibles en el frontend

- **Sesión:** se cierra tras 15 minutos sin actividad, con aviso un minuto antes. El token dura 20 minutos y se renueva solo mientras el usuario está activo (`components/SessionGuard.tsx`).
- **Cupo de médicos:** cada médico puede tener como máximo 5 pacientes. El backend lo valida (`app.doctor.max-patients`) y el panel de administración muestra el cupo y bloquea a los médicos llenos.
- **Medicamentos:** el análisis es orientativo. Se basa en el catálogo y en las reglas de dosis de la base de datos y no reemplaza al médico.

## Estructura

```
app/            Rutas (App Router). app/dashboard/layout.tsx aplica el cierre de sesión a todos los paneles.
components/     Componentes compartidos (menú de usuario, análisis de medicamentos, subida de recetas, etc.).
lib/api.ts      Cliente HTTP con el token JWT.
lib/session.ts  Datos de sesión, rol e inicio de cada rol.
lib/medications.ts  Nombres en español, presentaciones y estados de receta.
```

`README-INTEGRACION.md` contiene notas de una etapa anterior de la integración. Algunos puntos pendientes que menciona (seguridad de recetas y consultas, revisión médica) ya están implementados.
