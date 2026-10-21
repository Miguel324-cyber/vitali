
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  HeartPulse,
  Mail,
  Pencil,
  Phone,
  Ruler,
  ShieldCheck,
  UserRound,
  Weight,
  Save,
  X,
  LoaderCircle,
} from "lucide-react";

type PatientProfile = {
  profileId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  phone: string | null;
  weight: number | null;
  height: number | null;
  conditions: string | null;
  medications: string | null;
  assignedDoctorName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ProfileForm = {
  fullName: string;
  avatarUrl: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  weight: string;
  height: string;
  conditions: string;
  medications: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const emptyForm: ProfileForm = {
  fullName: "",
  avatarUrl: "",
  documentType: "",
  documentNumber: "",
  birthDate: "",
  phone: "",
  weight: "",
  height: "",
  conditions: "",
  medications: "",
};

async function requestProfile(
  token: string,
  method: "GET" | "PUT",
  body?: ProfileForm
): Promise<PatientProfile> {
  const response = await fetch(`${API_URL}/api/patient/profile`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify({
      fullName: body.fullName,
      avatarUrl: body.avatarUrl || null,
      documentType: body.documentType || null,
      documentNumber: body.documentNumber || null,
      birthDate: body.birthDate || null,
      phone: body.phone || null,
      weight: body.weight === "" ? null : Number(body.weight),
      height: body.height === "" ? null : Number(body.height),
      conditions: body.conditions || null,
      medications: body.medications || null,
    }) } : {}),
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || `Error HTTP ${response.status}`;

    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.detail || message;
    } catch {
      // La respuesta no era JSON.
    }

    throw new Error(
      response.status === 401
        ? "Tu sesión ha expirado. Inicia sesión de nuevo."
        : response.status === 403
        ? "No tienes permiso para consultar este perfil."
        : response.status === 404
        ? "No se encontró el perfil del paciente."
        : message
    );
  }

  return response.json();
}

function toForm(profile: PatientProfile): ProfileForm {
  return {
    fullName: profile.fullName ?? "",
    avatarUrl: profile.avatarUrl ?? "",
    documentType: profile.documentType ?? "",
    documentNumber: profile.documentNumber ?? "",
    birthDate: profile.birthDate ?? "",
    phone: profile.phone ?? "",
    weight: profile.weight == null ? "" : String(profile.weight),
    height: profile.height == null ? "" : String(profile.height),
    conditions: profile.conditions ?? "",
    medications: profile.medications ?? "",
  };
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className="mt-0.5 rounded-lg bg-slate-50 p-2 text-slate-500">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value !== null && value !== undefined && value !== ""
            ? value
            : "No disponible"}
        </p>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: keyof ProfileForm;
  value: string;
  onChange: (name: keyof ProfileForm, value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

export default function PatientProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await requestProfile(token, "GET");
      setProfile(data);
      setForm(toForm(data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el perfil.";

      setError(message);

      if (message.includes("sesión ha expirado")) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function changeField(name: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function cancelEditing() {
    if (profile) setForm(toForm(profile));
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!form.fullName.trim()) {
      setError("El nombre completo es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await requestProfile(token, "PUT", {
        ...form,
        fullName: form.fullName.trim(),
      });

      setProfile(updated);
      setForm(toForm(updated));
      setEditing(false);
      setSuccess("Tu perfil se actualizó correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
        <LoaderCircle className="animate-spin" size={22} />
        Cargando tu perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">
          No pudimos cargar tu perfil
        </h1>
        <p className="text-sm text-red-600">
          {error || "No se recibieron datos del backend."}
        </p>
        <button
          onClick={() => void loadProfile()}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const initials = profile.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "VP";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/patient"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700"
      >
        <ArrowLeft size={17} />
        Volver al dashboard
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 sm:h-36" />

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-teal-50 text-2xl font-bold text-teal-800 shadow-sm">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatarUrl}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="pb-1">
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {profile.fullName || "Mi perfil"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Información de mi cuenta y salud
                </p>
              </div>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setForm(toForm(profile));
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <Pencil size={16} />
                Editar perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="patient-profile-form"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-blue-700" />
            <p className="text-sm leading-6 text-blue-900">
              Tu información personal y médica es privada. Compártela solo con
              profesionales o familiares autorizados.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          {success}
        </div>
      )}

      <form id="patient-profile-form" onSubmit={saveProfile} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <UserRound size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Datos personales</h2>
              <p className="mt-1 text-sm text-slate-500">
                Información básica de tu cuenta.
              </p>
            </div>
          </div>

          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Nombre completo" name="fullName" value={form.fullName} onChange={changeField} />
              <InputField label="Teléfono" name="phone" value={form.phone} onChange={changeField} />
              <InputField label="Fecha de nacimiento" name="birthDate" type="date" value={form.birthDate} onChange={changeField} />
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Tipo de documento</span>
                <select
                  value={form.documentType}
                  onChange={(event) => changeField("documentType", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              </label>
              <InputField label="Número de documento" name="documentNumber" value={form.documentNumber} onChange={changeField} />
              <InputField label="URL o imagen de perfil" name="avatarUrl" value={form.avatarUrl} onChange={changeField} />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre completo" value={profile.fullName} icon={UserRound} />
              <Field label="Correo electrónico" value={profile.email} icon={Mail} />
              <Field label="Teléfono" value={profile.phone} icon={Phone} />
              <Field label="Fecha de nacimiento" value={profile.birthDate} icon={CalendarDays} />
              <Field label="Tipo de documento" value={profile.documentType} icon={FileText} />
              <Field label="Número de documento" value={profile.documentNumber} icon={FileText} />
            </div>
          )}
          {!editing && (
            <div className="mt-3">
              <Field label="Correo electrónico" value={profile.email} icon={Mail} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-rose-50 p-3 text-rose-700">
              <HeartPulse size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Información de salud</h2>
              <p className="mt-1 text-sm text-slate-500">
                Datos registrados en tu perfil médico.
              </p>
            </div>
          </div>

          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Peso (kg)" name="weight" type="number" value={form.weight} onChange={changeField} />
              <InputField label="Estatura (cm)" name="height" type="number" value={form.height} onChange={changeField} />
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Condiciones médicas</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={form.conditions}
                  onChange={(event) => changeField("conditions", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Medicamentos actuales</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={form.medications}
                  onChange={(event) => changeField("medications", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Estatura" value={profile.height == null ? null : `${profile.height} cm`} icon={Ruler} />
                <Field label="Peso" value={profile.weight == null ? null : `${profile.weight} kg`} icon={Weight} />
                <Field label="Médico asignado" value={profile.assignedDoctorName} icon={UserRound} />
              </div>
              <div className="mt-3 grid gap-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-500">Condiciones médicas registradas</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {profile.conditions || "No hay información disponible para mostrar."}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-xs font-medium text-slate-500">Medicamentos registrados</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {profile.medications || "No hay información disponible para mostrar."}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </form>
    </div>
  );
}
