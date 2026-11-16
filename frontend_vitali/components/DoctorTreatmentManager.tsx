"use client";
import { useEffect, useMemo, useState } from "react";
import { FileText, Pill } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { medName, openRecipeDocument, RECIPE_STATUS } from "@/lib/medications";
import type { Treatment } from "@/components/TreatmentList";
import MedicineItemForm, { type DraftItem } from "@/components/MedicineItemForm";
import MedicationAnalysisPanel from "@/components/MedicationAnalysisPanel";

type Doc = { id: number; id_receta: number | null; nombre_archivo: string; tipo_contenido: string; texto_extraido: string | null; fecha_subida: string };

const fmt = (v?: string | null) => { if (!v) return ""; const d = new Date(v); return isNaN(d.getTime()) ? v : d.toLocaleDateString("es-CO", { dateStyle: "medium" }); };

/** Tratamientos del paciente vistos por su médico: asignar, revisar, finalizar y ver documentos. */
export default function DoctorTreatmentManager({ patientId, treatments, onChanged }: { patientId: number; treatments: Treatment[]; onChanged: () => void }) {
  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { fetchApi<Doc[]>(`/api/recetas/documentos/paciente/${patientId}`).then(setDocs).catch(() => {}); }, [patientId, refreshKey]);

  const recipes = useMemo(() => {
    const map = new Map<number, Treatment[]>();
    treatments.forEach((t) => map.set(t.recipeId, [...(map.get(t.recipeId) || []), t]));
    return [...map.entries()].map(([id, items]) => ({ id, items, status: items[0].status || "", date: items[0].uploadedAt, fromDoctor: items[0].doctorId != null }));
  }, [treatments]);

  function changed(text: string) { setMsg({ ok: true, text }); setRefreshKey((k) => k + 1); onChanged(); }

  async function assign() {
    if (!draft.length) return;
    setBusy(true); setMsg(null);
    try {
      await fetchApi(`/api/doctors/patients/${patientId}/recetas`, { method: "POST", body: JSON.stringify({ items: draft }) });
      setDraft([]); changed("Tratamiento asignado. El paciente ya puede verlo en «Mis recetas y medicamentos».");
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "No se pudo asignar el tratamiento." }); }
    finally { setBusy(false); }
  }

  async function setStatus(recipeId: number, estado: string, label: string) {
    if (estado !== "REVISADA_POR_MEDICO" && !window.confirm(`¿${label} la receta #${recipeId}?`)) return;
    try {
      await fetchApi(`/api/doctors/recetas/${recipeId}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
      changed(`Receta #${recipeId}: ${RECIPE_STATUS[estado]?.label.toLowerCase() || estado}.`);
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "No se pudo actualizar la receta." }); }
  }

  return (
    <div className="space-y-5">
      {msg && <p role="status" className={`rounded-xl p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{msg.text}</p>}

      <MedicationAnalysisPanel patientId={patientId} refreshKey={refreshKey} audience="doctor" />

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-slate-900">Asignar nuevo tratamiento</h3>
        <MedicineItemForm onAdd={(i) => setDraft((d) => [...d, i])} submitLabel="Añadir al tratamiento" />
        {draft.length > 0 && (
          <div className="space-y-2">
            {draft.map((i, n) => <div key={n} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"><span><b>{medName(i.medicine)}</b> · {i.presentationLabel} · {i.unitsPerDay} {i.consumptionUnit}/día · {i.treatmentDays} días</span><button onClick={() => setDraft((d) => d.filter((_, x) => x !== n))} className="text-red-600">Quitar</button></div>)}
            <button disabled={busy} onClick={() => void assign()} className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Asignando..." : `Asignar tratamiento (${draft.length})`}</button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-bold text-slate-900">Recetas y tratamientos</h3>
        {recipes.length === 0 ? <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">Sin recetas registradas.</p>
          : recipes.map((r) => {
            const st = RECIPE_STATUS[r.status] || { label: r.status || "Sin estado", cls: "bg-slate-100 text-slate-600" };
            const closed = r.status === "FINALIZADA" || r.status === "SUSPENDIDA";
            return (
              <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><b>{r.fromDoctor ? "Tratamiento asignado" : "Registrada por el paciente"} #{r.id}</b><p className="text-xs text-slate-500">{fmt(r.date)}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                </div>
                <ul className="mt-3 space-y-1.5">{r.items.map((t) => (
                  <li key={t.itemId} className="flex gap-2 text-sm"><Pill size={16} className="mt-0.5 shrink-0 text-teal-700" /><span><b>{medName(t.medicine)}</b> · {[t.dose, t.unitsPerDay != null ? `${t.unitsPerDay} ${t.unit || ""}/día` : null, t.treatmentDays != null ? `${t.treatmentDays} días` : null].filter(Boolean).join(" · ")}</span></li>
                ))}</ul>
                {!closed && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.status === "PENDIENTE_REVISION_MEDICA" && <button onClick={() => void setStatus(r.id, "REVISADA_POR_MEDICO", "Marcar como revisada")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Marcar como revisada</button>}
                    <button onClick={() => void setStatus(r.id, "FINALIZADA", "Finalizar")} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Finalizar</button>
                    <button onClick={() => void setStatus(r.id, "SUSPENDIDA", "Suspender")} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">Suspender</button>
                  </div>
                )}
              </article>
            );
          })}
      </section>

      <section className="space-y-2">
        <h3 className="font-bold text-slate-900">Documentos de receta subidos</h3>
        {docs.length === 0 ? <p className="text-sm text-slate-500">El paciente no ha subido documentos.</p>
          : docs.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-white p-3 text-sm">
              <span className="flex items-center gap-2"><FileText size={16} className="text-teal-700" /> {d.nombre_archivo} <span className="text-xs text-slate-500">· {fmt(d.fecha_subida)}{d.id_receta ? ` · Receta #${d.id_receta}` : " · sin registrar"}</span></span>
              <button onClick={() => void openRecipeDocument(d.id).catch((e) => setMsg({ ok: false, text: e.message }))} className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-teal-700">Ver documento</button>
            </div>
          ))}
      </section>
    </div>
  );
}
