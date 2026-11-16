"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Profile = {
  user?: {
    fullName: string;
    email: string;
  };
  phone?: string | null;
};

type PendingInvitation = {
  invitationId: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  expiresAt: string;
};

type Patient = {
  patientId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  birthDate: string | null;
  phone: string | null;
  weight: number | null;
  height: number | null;
  conditions: string | null;
  medications: string | null;
  doctorId: number | null;
  doctorName: string | null;
  doctorSpecialty: string | null;
};

export default function FamilyPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  const [invitations, setInvitations] =
    useState<PendingInvitation[]>([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [editing, setEditing] = useState(false);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");

      /*
       * Cargar perfil familiar.
       */
      const p = await fetchApi<Profile>("/api/family/me");

      setProfile(p);

      setForm({
        fullName: p.user?.fullName || "",
        email: p.user?.email || "",
        phone: p.phone || "",
      });

      /*
       * Buscar paciente actualmente vinculado.
       *
       * Si no existe vínculo, el backend puede responder
       * con error y simplemente dejamos patient = null.
       */
      const linkedPatient =
        await fetchApi<Patient>("/api/family/patient")
          .catch(() => null);

      setPatient(linkedPatient);

      /*
       * Buscar invitaciones pendientes dirigidas
       * al correo del familiar.
       */
      const pendingInvitations =
        await fetchApi<PendingInvitation[]>(
          "/api/family-invitations/pending"
        ).catch(() => []);

      setInvitations(pendingInvitations);

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo cargar el perfil."
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    try {

      setError("");
      setMsg("");

      await fetchApi("/api/family/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setMsg("Perfil actualizado correctamente.");
      setEditing(false);

      await load();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar el perfil."
      );
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">

      {/* HEADER */}
      <header className="overflow-hidden rounded-3xl border bg-white shadow-sm">

        <div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600" />

        <div className="p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-bold tracking-wider text-teal-700">
                VITALI · PERFIL FAMILIAR
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {profile?.user?.fullName || "Perfil familiar"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Perfil, invitaciones y acceso a la información
                de tu familiar.
              </p>

            </div>

            {patient && (
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-700">
                Vínculo activo
              </div>
            )}

          </div>

        </div>

      </header>

      {/* MENSAJE DE ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* MENSAJE DE ÉXITO */}
      {msg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {msg}
        </div>
      )}

      {/* ====================================================== */}
      {/* INVITACIONES PENDIENTES                               */}
      {/* ====================================================== */}

      {!patient && invitations.length > 0 && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <p className="text-xs font-bold tracking-wider text-teal-700">
                NUEVA INVITACIÓN
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Tienes una invitación familiar
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Un paciente te ha invitado a formar parte
                de su vínculo familiar en Vitali.
              </p>

            </div>

            <span className="w-fit rounded-full bg-teal-700 px-3 py-1 text-xs font-bold text-white">
              {invitations.length}
              {invitations.length === 1
                ? " pendiente"
                : " pendientes"}
            </span>

          </div>

          <div className="mt-5 space-y-4">

            {invitations.map((invitation) => (
              <InvitationCard
                key={invitation.invitationId}
                invitation={invitation}
                onAccepted={load}
              />
            ))}

          </div>

        </section>
      )}

      {/* ====================================================== */}
      {/* SIN INVITACIONES                                       */}
      {/* ====================================================== */}

      {!patient && invitations.length === 0 && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
              👨‍👩‍👧
            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                No tienes invitaciones pendientes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cuando un paciente te envíe una invitación,
                aparecerá automáticamente aquí.
              </p>

            </div>

          </div>

        </section>
      )}

      {/* ====================================================== */}
      {/* MI PERFIL                                              */}
      {/* ====================================================== */}

      <section className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between gap-3">

          <div>

            <p className="text-xs font-bold tracking-wider text-slate-400">
              CUENTA
            </p>

            <h2 className="mt-1 font-bold text-slate-900">
              Mi perfil
            </h2>

          </div>

          <button
            onClick={() => {
              setEditing(!editing);
              setMsg("");
              setError("");
            }}
            className="rounded-xl border px-3 py-2 text-sm font-semibold transition hover:bg-slate-50"
          >
            {editing ? "Cancelar" : "Editar perfil"}
          </button>

        </div>

        {editing ? (

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <Input
              l="Nombre completo"
              v={form.fullName}
              set={(v) =>
                setForm({
                  ...form,
                  fullName: v,
                })
              }
            />

            <Input
              l="Correo"
              v={form.email}
              set={(v) =>
                setForm({
                  ...form,
                  email: v,
                })
              }
            />

            <Input
              l="Teléfono"
              v={form.phone}
              set={(v) =>
                setForm({
                  ...form,
                  phone: v,
                })
              }
            />

            <div className="flex items-end">

              <button
                onClick={() => void save()}
                className="w-full rounded-xl bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800"
              >
                Guardar cambios
              </button>

            </div>

          </div>

        ) : (

          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            <Info
              l="Nombre"
              v={profile?.user?.fullName}
            />

            <Info
              l="Correo"
              v={profile?.user?.email}
            />

            <Info
              l="Teléfono"
              v={profile?.phone}
            />

          </div>

        )}

      </section>

      {/* ====================================================== */}
      {/* PACIENTE VINCULADO                                     */}
      {/* ====================================================== */}

      {patient && (
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="border-b bg-gradient-to-r from-teal-50 to-cyan-50 p-6">

            <p className="text-xs font-bold tracking-wider text-teal-700">
              PACIENTE VINCULADO
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {patient.fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {patient.email}
                  {" · "}
                  {patient.phone || "Sin teléfono"}
                </p>

              </div>

              <div className="rounded-xl bg-white px-4 py-3 shadow-sm">

                <p className="text-xs text-slate-400">
                  MÉDICO ASIGNADO
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">

                  {patient.doctorName || "Sin médico asignado"}

                </p>

                {patient.doctorName && (
                  <p className="text-xs text-slate-500">
                    {patient.doctorSpecialty ||
                      "Especialidad no disponible"}
                  </p>
                )}

              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="grid gap-3 sm:grid-cols-2">

              <Info
                l="Fecha de nacimiento"
                v={patient.birthDate}
              />

              <Info
                l="Peso"
                v={
                  patient.weight
                    ? `${patient.weight} kg`
                    : null
                }
              />

              <Info
                l="Estatura"
                v={
                  patient.height
                    ? `${patient.height} cm`
                    : null
                }
              />

              <Info
                l="Condiciones"
                v={patient.conditions}
              />

              <Info
                l="Medicamentos / tratamiento"
                v={patient.medications}
              />

              <Info
                l="Médico asignado"
                v={
                  patient.doctorName
                    ? `${patient.doctorName} · ${
                        patient.doctorSpecialty ||
                        "Especialidad no disponible"
                      }`
                    : "Sin médico asignado"
                }
              />

            </div>

          </div>

        </section>
      )}

    </main>
  );
}


/* ========================================================== */
/* TARJETA DE INVITACIÓN                                      */
/* ========================================================== */

function InvitationCard({
  invitation,
  onAccepted,
}: {
  invitation: PendingInvitation;
  onAccepted: () => Promise<void>;
}) {

  const [relationship, setRelationship] =
    useState("");

  const [details, setDetails] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function acceptInvitation() {

    if (!relationship.trim()) {

      setError(
        "Debes indicar el parentesco."
      );

      return;
    }

    try {

      setLoading(true);
      setError("");

      await fetchApi(
        "/api/family-invitations/accept-pending",
        {
          method: "POST",
          body: JSON.stringify({
            invitationId:
              invitation.invitationId,

            relationship:
              relationship.trim(),

            relationshipDetails:
              details.trim(),
          }),
        }
      );

      await onAccepted();

    } catch (e) {

      setError(
        e instanceof Error
          ? e.message
          : "No se pudo aceptar la invitación."
      );

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="text-xs font-bold tracking-wider text-slate-400">
            INVITACIÓN DE
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {invitation.patientName}
          </h3>

          <p className="text-sm text-slate-500">
            {invitation.patientEmail}
          </p>

        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          Pendiente
        </span>

      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">

        <p className="text-sm text-slate-600">
          Te han invitado a vincularte con este paciente
          como familiar.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Invitación válida hasta:{" "}
          <span className="font-semibold text-slate-700">
            {formatDate(invitation.expiresAt)}
          </span>
        </p>

      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">

        <Input
          l="Parentesco"
          v={relationship}
          set={setRelationship}
          placeholder="Madre, padre, esposo/a, hijo/a..."
        />

        <label className="text-sm font-medium text-slate-700 sm:col-span-2">

          Detalles adicionales

          <textarea
            value={details}
            onChange={(e) =>
              setDetails(e.target.value)
            }
            rows={3}
            placeholder="Información adicional sobre el vínculo"
            className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-teal-500"
          />

        </label>

      </div>

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">

        <button
          onClick={() => void acceptInvitation()}
          disabled={
            loading ||
            !relationship.trim()
          }
          className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Aceptando..."
            : "Aceptar invitación"}
        </button>

      </div>

    </div>
  );
}


/* ========================================================== */
/* INPUT                                                       */
/* ========================================================== */

function Input({
  l,
  v,
  set,
  placeholder,
}: {
  l: string;
  v: string;
  set: (v: string) => void;
  placeholder?: string;
}) {

  return (
    <label className="block text-sm font-medium text-slate-700">

      {l}

      <input
        value={v}
        onChange={(e) =>
          set(e.target.value)
        }
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
      />

    </label>
  );
}


/* ========================================================== */
/* INFO                                                        */
/* ========================================================== */

function Info({
  l,
  v,
}: {
  l: string;
  v: any;
}) {

  return (
    <div className="rounded-xl border border-slate-100 p-4">

      <p className="text-xs text-slate-500">
        {l}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {v || "No disponible"}
      </p>

    </div>
  );
}


/* ========================================================== */
/* FECHA                                                       */
/* ========================================================== */

function formatDate(value: string) {

  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}