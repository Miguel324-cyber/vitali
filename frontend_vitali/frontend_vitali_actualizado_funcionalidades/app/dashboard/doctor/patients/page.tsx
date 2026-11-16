"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import TreatmentList, { matchesPatient, type PatientWithTreatments } from "@/components/TreatmentList";

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();

export default function DoctorPatients() {
  const [patients, setPatients] = useState<PatientWithTreatments[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi<PatientWithTreatments[]>("/api/doctors/patients").then(setPatients).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const visible = patients.filter((p) => matchesPatient(p, search));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <Link href="/dashboard/doctor" className="text-sm font-medium text-teal-700 hover:underline">← Volver al panel</Link>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mis pacientes</h1>
        <p className="mt-1 text-sm text-slate-500">Pacientes asignados por el administrador, con el tratamiento que tiene cada uno.</p>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre del paciente, correo o medicamento..." className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        {!loading && <p className="mt-2 text-xs text-slate-500">{visible.length} de {patients.length} paciente(s)</p>}
      </header>
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="rounded-2xl bg-white p-6">Cargando pacientes...</div>
        : patients.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">No tienes pacientes asignados.</div>
        : visible.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">Ningún paciente coincide con “{search}”.</div>
        : <div className="grid gap-4 md:grid-cols-2">
          {visible.map((p) => (
            <article key={p.patientId} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">{initials(p.fullName)}</div>
                <div className="min-w-0 flex-1"><h2 className="truncate font-bold text-slate-900">{p.fullName}</h2><p className="truncate text-xs text-slate-500">{p.email}</p></div>
                {p.pendingQuestions > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{p.pendingQuestions} duda(s)</span>}
              </div>
              {p.conditions && <p className="mt-3 text-xs text-slate-600"><span className="font-semibold">Condiciones:</span> {p.conditions}</p>}
              <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Tratamiento</p>
              <TreatmentList treatments={p.treatments} medications={p.medications} compact />
              <Link href={`/dashboard/doctor/patients/${p.patientId}`} className="mt-4 text-sm font-semibold text-teal-700 hover:underline">Ver ficha completa y dudas →</Link>
            </article>
          ))}
        </div>}
    </main>
  );
}
