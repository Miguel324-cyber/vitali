"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import ConsultationCard, { type DoctorConsultation } from "@/components/ConsultationCard";

const FILTERS = [{ id: "PENDIENTE", label: "Pendientes" }, { id: "ATENDIDA", label: "Respondidas" }, { id: "", label: "Todas" }];

export default function DoctorConsultations() {
  const [rows, setRows] = useState<DoctorConsultation[]>([]);
  const [estado, setEstado] = useState("PENDIENTE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchApi<DoctorConsultation[]>(`/api/consultas/medico${estado ? `?estado=${estado}` : ""}`)); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar las dudas."); }
    finally { setLoading(false); }
  }, [estado]);
  useEffect(() => { void load(); }, [load]);

  const term = search.trim().toLowerCase();
  const visible = rows.filter((c) => !term || (c.nombre_paciente || "").toLowerCase().includes(term) || c.mensaje_duda.toLowerCase().includes(term));

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <Link href="/dashboard/doctor" className="text-sm font-medium text-teal-700 hover:underline">← Volver al panel</Link>
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Dudas de pacientes</h1>
        <p className="mt-1 text-sm text-slate-500">Preguntas que te envían tus pacientes asignados. Al responder, el paciente recibe una notificación.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => <button key={f.id} onClick={() => setEstado(f.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${estado === f.id ? "bg-teal-700 text-white" : "border text-slate-600"}`}>{f.label}</button>)}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por paciente o texto..." className="min-w-0 flex-1 rounded-xl border p-2 text-sm" />
        </div>
      </header>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p className="rounded-2xl bg-white p-6">Cargando...</p>
        : visible.length === 0 ? <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">{estado === "PENDIENTE" ? "No tienes dudas pendientes." : "No hay dudas para mostrar."}</p>
        : <div className="space-y-3">{visible.map((c) => <ConsultationCard key={c.id} c={c} showPatient onAnswered={() => void load()} />)}</div>}
    </main>
  );
}
