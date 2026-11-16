export type Role = "ADMIN" | "DOCTOR" | "PATIENT" | "FAMILY";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador", DOCTOR: "Médico", PATIENT: "Paciente", FAMILY: "Familiar",
};

/** Página de inicio de cada rol. */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/dashboard/admin", DOCTOR: "/dashboard/doctor", PATIENT: "/dashboard/patient", FAMILY: "/dashboard/family",
};

/** Página de perfil, si el rol tiene una propia. */
export const ROLE_PROFILE: Partial<Record<Role, string>> = {
  PATIENT: "/dashboard/patient/profile",
};

const KEYS = ["token", "userRole", "userId", "userEmail", "userName", "lastActivity"] as const;

export type Session = { role: Role | null; name: string; email: string; userId: number | null };

export function readSession(): Session {
  const role = localStorage.getItem("userRole") as Role | null;
  return {
    role: role && role in ROLE_LABEL ? role : null,
    name: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    userId: Number(localStorage.getItem("userId")) || null,
  };
}

export function clearSession() {
  KEYS.forEach((k) => localStorage.removeItem(k));
}

export const initials = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join("").toUpperCase() || "?";
