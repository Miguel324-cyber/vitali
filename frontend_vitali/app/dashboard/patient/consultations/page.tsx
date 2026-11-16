"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, RefreshCw, Stethoscope } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Consultation = { id: number; id_paciente: number; id_medico: number | null; id_receta: number | null; mensaje_duda: string; respuesta_medico: string | null; estado: string; fecha_consulta: string; fecha_respuesta: string | null; leida_paciente: number | null; nombre_medico: string | null };
type RecipeRow = { id: number; fecha_subida: string | null; nombre_medicamento: string | null };
type Profile = { assignedDoctorName: string | null; assignedDoctorSpecialty?: string | null };

const fmt = (v?: string | null) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }); };

export default function ConsultationsPage() {
  const [rows, setRows] = useState<Consultation[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [doctor, setDoctor] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const patientId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : 0;
  const hasDoctor = !!doctor?.assignedDoctorName && doctor.assignedDoctorName !== "Sin médico asignado";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchApi<Consultation[]>(`/api/consultas/paciente/${patientId}`);
      setRows(Array.isArray(d) ? d : []);
      // Al ver la lista, las respuestas nuevas quedan como leídas.
      if (d.some((c) => c.respuesta_medico && !c.leida_paciente)) {
        await fetchApi("/api/consultas/notificaciones/leidas", { method: "POST" }).catch(() => {});
        window.dispatchEvent(new Event("patient-notifications-changed"));
      }
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar las consultas."); }
    finally { setLoading(false); }
  }, [patientId]);

  useEffect(() => {
    if (!patientId) { setError("No se encontró el ID de usuario de la sesión."); setLoading(false); return; }
    void load();
    fetchApi<Profile>("/api/patient/profile").then(setDoctor).catch(() => {});
    fetchApi<RecipeRow[]>(`/api/recetas/paciente/${patientId}`).then(setRecipes).catch(() => {});
  }, [patientId, load]);

  const recipeOptions = useMemo(() => {
    const byId = new Map<number, { id: number; date: string | null; meds: string[] }>();
    for (const r of recipes) {
      const e = byId.get(r.id) ?? { id: r.id, date: r.fecha_subida, meds: [] };
      if (r.nombre_medicamento) e.meds.push(r.nombre_medicamento);
      byId.set(r.id, e);
    }
    return [...byId.values()];
  }, [recipes]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setOk(""); setSaving(true);
    try {
      await fetchApi("/api/consultas", { method: "POST", body: JSON.stringify({ patientId, recipeId: recipeId ? Number(recipeId) : null, message: message.trim() }) });
      setMessage(""); setRecipeId(""); setOk("Tu duda fue enviada a tu médico. Te avisaremos cuando responda."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "No fue posible enviar la consulta."); }
    finally { setSaving(false); }
  }

  return (
    <main className="space-y-6">
      <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-sm text-teal-700"><ArrowLeft size={16} /> Volver al panel</Link>
      <header><h1 className="text-2xl font-bold">Consultas al médico</h1><p className="mt-1 text-sm text-slate-500">Envía dudas sobre tu tratamiento a tu médico asignado y lee sus respuestas.</p></header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {ok && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{ok}</p>}

      <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-5">
        <div className="flex items-center gap-3 rounded-xl bg-teal-50/60 p-3">
          <Stethoscope className="text-teal-700" size={20} />
          {doctor === null ? <p className="text-sm text-slate-500">Cargando médico asignado...</p>
            : hasDoctor ? <p className="text-sm text-slate-700">Tu pregunta llegará a <b>{doctor.assignedDoctorName}</b>{doctor.assignedDoctorSpecialty ? ` · ${doctor.assignedDoctorSpecialty}` : ""}</p>
            : <p className="text-sm text-amber-800">Aún no tienes un médico asignado. Cuando el administrador te asigne uno podrás enviarle tus dudas.</p>}
        </div>
        <label className="block text-sm font-medium">Relacionar con una receta (opcional)
          <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="mt-1 w-full rounded-lg border p-2">
            <option value="">Sin receta relacionada</option>
            {recipeOptions.map((r) => <option key={r.id} value={r.id}>Receta #{r.id}{r.meds.length ? ` · ${r.meds.slice(0, 3).join(", ")}${r.meds.length > 3 ? "…" : ""}` : ""}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Tu duda
          <textarea required maxLength={1000} rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Escribe tu pregunta para el profesional de salud..." />
        </label>
        <button disabled={saving || !hasDoctor} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Enviando..." : "Enviar consulta"}</button>
      </form>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Mis consultas</h2><button onClick={() => void load()} aria-label="Actualizar" className="rounded-lg border p-2"><RefreshCw size={17} /></button></div>
        {loading ? <p>Cargando...</p> : rows.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">Aún no has enviado consultas.</p>
          : rows.map((r) => {
            const isNew = !!r.respuesta_medico && !r.leida_paciente;
            return (
              <article key={r.id} className={`rounded-2xl border bg-white p-5 ${isNew ? "border-teal-300 ring-2 ring-teal-100" : ""}`}>
                <div className="flex justify-between gap-3">
                  <h3 className="font-semibold">Consulta #{r.id}{r.id_receta ? <span className="font-normal text-slate-500"> · Receta #{r.id_receta}</span> : null}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isNew ? "bg-teal-600 text-white" : r.respuesta_medico ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{isNew ? "Nueva respuesta" : r.respuesta_medico ? "Respondida" : "Pendiente"}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{r.mensaje_duda}</p>
                <p className="mt-2 text-xs text-slate-400">{fmt(r.fecha_consulta)}</p>
                {r.respuesta_medico
                  ? <div className="mt-4 rounded-xl bg-teal-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-teal-800"><MessageCircle size={16} /> Respuesta {r.nombre_medico ? `de ${r.nombre_medico}` : "del médico"}{r.fecha_respuesta ? <span className="font-normal text-teal-700"> · {fmt(r.fecha_respuesta)}</span> : null}</p><p className="mt-2 whitespace-pre-wrap text-sm text-teal-950">{r.respuesta_medico}</p></div>
                  : <p className="mt-4 text-sm text-amber-700">Pendiente de respuesta médica.</p>}
              </article>
            );
          })}
      </section>
    </main>
  );
}
