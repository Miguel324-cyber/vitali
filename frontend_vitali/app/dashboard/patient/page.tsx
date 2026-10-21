
"use client";

import { Pill } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  LoaderCircle,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

type PatientData = {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  bloodType?: string;
  avatarUrl?: string;
};

type FamilyLink = {
  linkId?: number;
  id?: number;
  familyUserId?: number;
  familyName?: string;
  familyFullName?: string;
  fullName?: string;
  email?: string;
  familyEmail?: string;
  active?: boolean;
  createdAt?: string;
};

type ApiError = Error & {
  status?: number;
  statusCode?: number;
};

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    return apiError.status ?? apiError.statusCode;
  }

  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

function getInitials(name?: string): string {
  if (!name?.trim()) return "PA";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PatientDashboard() {
  const router = useRouter();

  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [familyLinks, setFamilyLinks] = useState<FamilyLink[]>([]);
  const [familyEmail, setFamilyEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleUnauthorized = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
    }

    router.replace("/login");
  }, [router]);

  const loadPatientData = useCallback(async (showRefresh = false) => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMsg("");

    try {
      const profile = await fetchApi("/api/patient/profile");

      setPatientData(profile as PatientData);

      try {
        const links = await fetchApi("/api/family/links");
        setFamilyLinks(Array.isArray(links) ? (links as FamilyLink[]) : []);
      } catch (error) {
        const status = getErrorStatus(error);

        if (status === 401) {
          handleUnauthorized();
          return;
        }

        // El perfil sigue siendo útil aunque falle la consulta de familiares.
        setFamilyLinks([]);
        console.error("No se pudieron cargar los vínculos familiares:", error);
      }
    } catch (error) {
      const status = getErrorStatus(error);

      if (status === 401) {
        handleUnauthorized();
        return;
      }

      if (status === 403) {
        setErrorMsg(
          "Tu cuenta no tiene permiso para consultar este panel. Verifica que hayas iniciado sesión como paciente."
        );
      } else {
        setErrorMsg(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [handleUnauthorized, router]);

  useEffect(() => {
    void loadPatientData();
  }, [loadPatientData]);

  const handleSendInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = familyEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMsg("Escribe el correo electrónico de tu familiar.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setSendingInvitation(true);

    try {
      await fetchApi("/api/family/invitations", {
        method: "POST",
        body: JSON.stringify({ familyEmail: normalizedEmail }),
      });

      setSuccessMsg(
        "La invitación se ha procesado correctamente. Tu familiar deberá aceptarla para completar el vínculo."
      );
      setFamilyEmail("");

      await loadPatientData(true);
    } catch (error) {
      const status = getErrorStatus(error);

      if (status === 401) {
        handleUnauthorized();
        return;
      }

      if (status === 403) {
        setErrorMsg("No tienes permiso para enviar invitaciones familiares.");
      } else {
        setErrorMsg(getErrorMessage(error));
      }
    } finally {
      setSendingInvitation(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F8FC] px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <LoaderCircle className="animate-spin" size={28} />
          </div>
          <p className="mt-4 font-semibold text-slate-800">
            Cargando tu espacio de salud...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Estamos consultando la información de tu cuenta.
          </p>
        </div>
      </main>
    );
  }

  const patientName = patientData?.fullName || "Paciente";

  return (
    <main className="min-h-screen bg-[#F5F8FC] text-slate-800">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard/patient/profile"
              aria-label="Mi perfil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-800"
            >
              {getInitials(patientData?.fullName)}
            </Link>
            <button
              type="button"
              onClick={() => void loadPatientData(true)}
              disabled={refreshing}
              aria-label="Actualizar información"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Bienvenida */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-700 p-6 text-white sm:p-9">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
              <Activity size={15} />
              Espacio del paciente
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ¡Hola, {patientName}!
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50 sm:text-base">
              Organiza tu información de salud, mantén tus vínculos familiares
              al día y consulta tu información desde un solo lugar.
            </p>

            <Link
              href="/dashboard/patient/profile"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
            >
              Consultar mi perfil
              <ArrowRight size={17} />
            </Link>
          </div>

          <HeartPulse
            className="absolute -bottom-8 -right-4 h-44 w-44 text-white/10 sm:right-8 sm:h-56 sm:w-56"
            strokeWidth={1}
          />
        </section>

        {/* Mensajes */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <XCircle className="mt-0.5 shrink-0" size={20} />
            <div className="flex-1">{errorMsg}</div>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              aria-label="Cerrar mensaje de error"
            >
              <XCircle size={17} />
            </button>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
            <p className="flex-1">{successMsg}</p>
            <button
              type="button"
              onClick={() => setSuccessMsg("")}
              aria-label="Cerrar mensaje de éxito"
            >
              <XCircle size={17} />
            </button>
          </div>
        )}

        {/* Resumen */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Resumen de mi salud
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Accesos rápidos a la información de tu cuenta.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Perfil del paciente
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {patientData ? "Disponible" : "Sin datos"}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Información de tu cuenta
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <UserRound size={21} />
                </div>
              </div>
              <Link
                href="/dashboard/patient/profile"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Ver perfil <ArrowRight size={15} />
              </Link>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Vínculos familiares
                  </p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">
                    {familyLinks.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Registros devueltos por el servidor
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                  <Users size={21} />
                </div>
              </div>
              <a
                href="#family"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                Gestionar familiares <ArrowRight size={15} />
              </a>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Citas médicas
                  </p>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    Próximamente
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Esta sección aún no está conectada.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                  <CalendarDays size={21} />
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Familiares */}
        <section
          id="family"
          className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                <Users size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">
                  Vínculos familiares
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Invita a un familiar para que pueda acceder a la información
                  que le autorices. El vínculo debe ser aceptado y estar activo
                  para conceder acceso.
                </p>
              </div>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
              <ShieldCheck size={15} />
              Acceso autorizado
            </span>
          </div>

          <form
            onSubmit={handleSendInvitation}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={familyEmail}
                onChange={(event) => setFamilyEmail(event.target.value)}
                placeholder="Correo electrónico de tu familiar"
                aria-label="Correo electrónico del familiar"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={sendingInvitation}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendingInvitation ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              {sendingInvitation ? "Enviando..." : "Invitar familiar"}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Familiares vinculados
              </h3>
              <span className="text-xs text-slate-400">
                {familyLinks.length} registro(s)
              </span>
            </div>

            {familyLinks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <Users size={23} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Aún no hay familiares para mostrar
                </p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Envía una invitación para comenzar el proceso de vinculación.
                  Si ya tienes familiares conectados, actualiza la información.
                </p>
                <button
                  type="button"
                  onClick={() => void loadPatientData(true)}
                  disabled={refreshing}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw size={16} />
                  Actualizar lista
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {familyLinks.map((link, index) => {
                  const name =
                    link.familyFullName ||
                    link.familyName ||
                    link.fullName ||
                    link.familyEmail ||
                    link.email ||
                    "Familiar";

                  const key =
                    link.linkId ??
                    link.id ??
                    link.familyUserId ??
                    link.familyEmail ??
                    link.email ??
                    `family-${index}`;

                  return (
                    <article
                      key={key}
                      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                          {getInitials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {name}
                          </p>
                          {(link.familyEmail || link.email) && (
                            <p className="mt-1 text-xs text-slate-500">
                              {link.familyEmail || link.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          link.active === false
                            ? "bg-slate-200 text-slate-600"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {link.active === false ? (
                          <Clock3 size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {link.active === false ? "Inactivo" : "Vínculo activo"}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Citas y recordatorios */}
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <Link
  href="/dashboard/patient/appointments"
  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
>
  <div className="flex items-start justify-between gap-4">
    <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
      <CalendarDays size={24} />
    </div>

    <span className="text-sm font-medium text-teal-700 group-hover:underline">
      Ver citas →
    </span>
  </div>

  <h2 className="mt-4 font-bold text-slate-900">
    Mis citas médicas
  </h2>

  <p className="mt-2 text-sm leading-6 text-slate-500">
    Solicita una cita con tu médico asignado y consulta las fechas,
    confirmaciones y el estado de tus solicitudes.
  </p>
</Link>

  
            </div>

            
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Bell size={21} />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Recordatorios</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Seguimiento de tus tratamientos.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Datos aún no conectados
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                No mostraremos horarios ni medicamentos inventados. Esta
                sección se completará al conectar los servicios correspondientes.
              </p>
            </div>
          </article>
        </section>


// Coloca esta tarjeta dentro de la cuadrícula existente.
<Link
  href="/dashboard/patient/recipes"
  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-md"
>
  <div className="flex items-center justify-between">
    <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
      <Pill size={24} />
    </div>
    <span className="text-sm font-medium text-teal-700">
      Consultar →
    </span>
  </div>

  <h2 className="mt-4 font-bold text-slate-900">
    Mis recetas y tratamientos
  </h2>

  <p className="mt-2 text-sm leading-6 text-slate-500">
    Consulta las fórmulas médicas y las indicaciones de tus tratamientos.
  </p>
</Link>



        {/* Pie */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 py-5 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Viatli · Tu salud, organizada.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Protege tus credenciales y comparte tus datos solo con personas autorizadas.
          </p>
        </footer>
      </div>
    </main>
  );
}
