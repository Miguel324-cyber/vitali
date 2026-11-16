"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { type Treatment } from "@/components/TreatmentList";
import DoctorTreatmentManager from "@/components/DoctorTreatmentManager";
import ConsultationCard, { formatDate, type DoctorConsultation } from "@/components/ConsultationCard";

type Patient = { patientId: number; fullName: string; email: string; birthDate: string | null; phone: string | null; weight: number | null; height: number | null; conditions: string | null; medications: string | null };
type Appointment = { id: number; requestedDateTime: string | null; scheduledDateTime: string | null; reason: string | null; doctorNotes: string | null; status: string };
type Details = { patient: Patient; appointments: Appointment[]; consultations: DoctorConsultation[]; treatments: Treatment[] };

const STATUS: Record<string, string> = { PENDING: "Pendiente", CONFIRMED: "Confirmada", REJECTED: "Rechazada", CANCELLED: "Cancelada", COMPLETED: "Completada" };

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p></div>;
}

export default function DoctorPatientDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Details | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"questions" | "treatments" | "appointments">("questions");

  const load = useCallback(async () => {
    try { setData(await fetchApi<Details>(`/api/doctors/patients/${id}`)); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudo cargar el paciente."); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  if (error) return <main className="mx-auto max-w-5xl p-6"><Link href="/dashboard/doctor/patients" className="text-sm text-teal-700">← Mis pacientes</Link><p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p></main>;
  if (!data) return <main className="p-8">Cargando paciente...</main>;

  const p = data.patient;
  const pending = data.consultations.filter((c) => c.estado === "PENDIENTE").length;
  const tabs = [
    { id: "questions" as const, label: `Dudas${pending ? ` (${pending} pendientes)` : ""}` },
    { id: "treatments" as const, label: `Tratamiento (${data.treatments.length})` },
    { id: "appointments" as const, label: `Citas (${data.appointments.length})` },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link href="/dashboard/doctor/patients" className="text-sm font-medium text-teal-700 hover:underline">← Mis pacientes</Link>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{p.fullName}</h1>
        <p className="text-sm text-slate-500">{p.email}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Info label="Nacimiento" value={p.birthDate} />
          <Info label="Teléfono" value={p.phone} />
          <Info label="Peso" value={p.weight != null ? `${p.weight} kg` : null} />
          <Info label="Estatura" value={p.height != null ? `${p.height} cm` : null} />
        </div>
        {p.conditions && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Condiciones médicas:</span> {p.conditions}</p>}
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.id ? "bg-teal-700 text-white" : "border bg-white text-slate-600"}`}>{t.label}</button>)}
      </div>

      {tab === "questions" && (
        <section className="space-y-3">
          {data.consultations.length === 0
            ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">Este paciente no ha enviado dudas.</p>
            : data.consultations.map((c) => <ConsultationCard key={c.id} c={c} onAnswered={() => void load()} />)}
        </section>
      )}

      {tab === "treatments" && (
        <>
          {p.medications && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600"><span className="font-semibold">Medicamentos que reporta en su perfil:</span> {p.medications.split("\n").filter(Boolean).join(", ")}</p>}
          <DoctorTreatmentManager patientId={p.patientId} treatments={data.treatments} onChanged={() => void load()} />
        </>
      )}

      {tab === "appointments" && (
        <section className="space-y-3">
          {data.appointments.length === 0 ? <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">Sin citas registradas.</p>
            : data.appointments.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                <div className="flex justify-between gap-2"><b>{a.reason || "Consulta"}</b><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs">{STATUS[a.status] || a.status}</span></div>
                <p className="mt-1 text-xs text-slate-500">Solicitada: {formatDate(a.requestedDateTime)}{a.scheduledDateTime ? ` · Programada: ${formatDate(a.scheduledDateTime)}` : ""}</p>
                {a.doctorNotes && <p className="mt-2 text-slate-600">{a.doctorNotes}</p>}
              </div>
            ))}
        </section>
      )}
    </main>
  );
}
