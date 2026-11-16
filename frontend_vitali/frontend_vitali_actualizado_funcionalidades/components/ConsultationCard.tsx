"use client";
import { useState } from "react";
import { fetchApi } from "@/lib/api";

export type DoctorConsultation = {
  id: number; id_paciente: number; nombre_paciente?: string; email_paciente?: string;
  id_receta: number | null; mensaje_duda: string; respuesta_medico: string | null;
  estado: string; fecha_consulta: string | null; fecha_respuesta?: string | null;
};

export const formatDate = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
};

/** Duda de un paciente con el formulario para que el médico la responda. */
export default function ConsultationCard({ c, showPatient, onAnswered }: { c: DoctorConsultation; showPatient?: boolean; onAnswered: () => void }) {
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const pending = c.estado === "PENDIENTE";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const doctorId = Number(localStorage.getItem("userId"));
      await fetchApi(`/api/consultas/${c.id}/responder`, { method: "POST", body: JSON.stringify({ doctorId, answer: answer.trim() }) });
      setAnswer(""); onAnswered();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la respuesta.");
    } finally { setSaving(false); }
  }

  return (
    <article className={`rounded-2xl border bg-white p-5 ${pending ? "border-amber-200" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {showPatient && <p className="font-semibold text-slate-900">{c.nombre_paciente}</p>}
          <p className="text-xs text-slate-500">Duda #{c.id}{c.id_receta ? ` · Receta #${c.id_receta}` : ""} · {formatDate(c.fecha_consulta)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{pending ? "Pendiente" : "Respondida"}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{c.mensaje_duda}</p>
      {c.respuesta_medico ? (
        <div className="mt-3 rounded-xl bg-teal-50 p-3">
          <p className="text-xs font-semibold text-teal-800">Tu respuesta {c.fecha_respuesta ? `· ${formatDate(c.fecha_respuesta)}` : ""}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-teal-950">{c.respuesta_medico}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <textarea required maxLength={1000} rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Escribe tu respuesta para el paciente..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
          {error && <p className="text-xs text-red-700">{error}</p>}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-400">{answer.length}/1000 · El paciente recibirá una notificación.</span>
            <button disabled={saving || !answer.trim()} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Enviando..." : "Responder"}</button>
          </div>
        </form>
      )}
    </article>
  );
}
