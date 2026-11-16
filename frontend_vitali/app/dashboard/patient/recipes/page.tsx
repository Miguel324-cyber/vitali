"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Pill, RefreshCw, Stethoscope } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { medName, openRecipeDocument, RECIPE_STATUS } from "@/lib/medications";
import MedicationAnalysisPanel from "@/components/MedicationAnalysisPanel";
import MedicineItemForm, { type DraftItem } from "@/components/MedicineItemForm";
import RecipeDocumentUpload from "@/components/RecipeDocumentUpload";

type RecipeRow = {
  id: number; id_paciente: number; fecha_subida: string; estado_analisis: string; id_medico: number | null; nombre_medico: string | null; documento_id: number | null;
  detalle_id: number | null; nombre_medicamento: string | null; dosis_indicada: string | null; presentacion_id: number | null;
  unidades_por_dia: number | null; unidad_consumo: string | null; indicacion: string | null; dias_tratamiento: number | null;
};
type Recipe = { id: number; date: string; status: string; doctorName: string | null; fromDoctor: boolean; documentId: number | null; items: RecipeRow[]; endDate: Date | null; active: boolean };

const dateLabel = (v: string | Date | null) => { if (!v) return "Fecha no disponible"; const d = new Date(v); return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("es-CO", { dateStyle: "medium" }); };

function RecipeCard({ r }: { r: Recipe }) {
  const st = RECIPE_STATUS[r.status] || { label: r.status, cls: "bg-slate-100 text-slate-600" };
  return (
    <article className={`rounded-2xl border bg-white p-5 ${r.active ? "" : "opacity-75"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold">{r.fromDoctor ? "Tratamiento" : "Receta"} #{r.id}</h3>
          <p className="text-xs text-slate-500">{dateLabel(r.date)}{r.endDate ? ` → ${dateLabel(r.endDate)}` : ""}{r.doctorName ? ` · ${r.doctorName}` : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {!r.active && r.status !== "FINALIZADA" && r.status !== "SUSPENDIDA" && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Terminado</span>}
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {r.items.filter((i) => i.detalle_id).map((i) => (
          <div key={i.detalle_id} className="flex gap-3 border-t pt-3">
            <Pill className="mt-0.5 shrink-0 text-teal-700" size={18} />
            <div>
              <p className="font-semibold">{medName(i.nombre_medicamento)}</p>
              <p className="text-sm text-slate-600">{i.dosis_indicada || "Dosis no especificada"} · {i.unidades_por_dia} {i.unidad_consumo}/día · {i.dias_tratamiento} días</p>
              {i.indicacion && <p className="text-xs text-slate-500">{i.indicacion}</p>}
            </div>
          </div>
        ))}
      </div>
      {r.documentId && <button onClick={() => void openRecipeDocument(r.documentId!)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"><FileText size={14} /> Ver documento de la receta</button>}
    </article>
  );
}

export default function PatientRecipesPage() {
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [items, setItems] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const userId = typeof window !== "undefined" ? Number(localStorage.getItem("userId")) : 0;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); setError("No se encontró el ID de tu sesión. Cierra sesión e ingresa nuevamente."); return; }
    setLoading(true);
    try { const r = await fetchApi<RecipeRow[]>(`/api/recetas/paciente/${userId}`); setRows(Array.isArray(r) ? r : []); }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron cargar tus recetas."); }
    finally { setLoading(false); setRefreshKey((k) => k + 1); }
  }, [userId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (window.location.hash !== "#subir") return;
    // Espera a que carguen las secciones de arriba para no quedar desplazado.
    const t = window.setTimeout(() => document.getElementById("subir")?.scrollIntoView({ behavior: "smooth" }), 600);
    return () => window.clearTimeout(t);
  }, []);

  const recipes = useMemo<Recipe[]>(() => {
    const map = new Map<number, RecipeRow[]>();
    rows.forEach((r) => map.set(r.id, [...(map.get(r.id) || []), r]));
    return [...map.entries()].map(([id, list]) => {
      const first = list[0];
      const days = Math.max(0, ...list.map((i) => i.dias_tratamiento || 0));
      const start = new Date(first.fecha_subida);
      const endDate = days && !isNaN(start.getTime()) ? new Date(start.getTime() + days * 86_400_000) : null;
      const active = first.estado_analisis !== "FINALIZADA" && first.estado_analisis !== "SUSPENDIDA" && (!endDate || endDate >= new Date(new Date().toDateString()));
      return { id, date: first.fecha_subida, status: first.estado_analisis, doctorName: first.nombre_medico, fromDoctor: first.id_medico != null, documentId: first.documento_id, items: list, endDate, active };
    });
  }, [rows]);
  const fromDoctor = recipes.filter((r) => r.fromDoctor);
  const mine = recipes.filter((r) => !r.fromDoctor);

  function done(msg: string) { setMessage(msg); setError(""); window.scrollTo({ top: 0, behavior: "smooth" }); void load(); }

  async function save() {
    if (!items.length) { setError("Agrega al menos un medicamento."); return; }
    setSaving(true); setError(""); setMessage("");
    try {
      const result = await fetchApi<{ mensaje: string }>("/api/recetas", { method: "POST", body: JSON.stringify({ patientId: userId, items }) });
      setItems([]); done(result.mensaje || "Receta registrada para revisión médica.");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo registrar la receta."); }
    finally { setSaving(false); }
  }

  return (
    <main className="space-y-6">
      <Link href="/dashboard/patient" className="inline-flex items-center gap-2 text-sm text-teal-700"><ArrowLeft size={16} /> Volver al panel</Link>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-slate-900">Mis recetas y medicamentos</h1><p className="mt-1 text-sm text-slate-500">Tus tratamientos, la revisión de dosis y compatibilidad, y el registro de nuevas recetas.</p></div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm" aria-label="Actualizar"><RefreshCw size={16} /> Actualizar</button>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}

      <MedicationAnalysisPanel patientId={userId} refreshKey={refreshKey} />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold"><Stethoscope size={20} className="text-teal-700" /> Tratamientos asignados por tu médico</h2>
        {loading ? <p className="text-slate-500">Cargando...</p>
          : fromDoctor.length === 0 ? <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">Tu médico aún no te ha asignado tratamientos en la plataforma.</p>
          : <div className="grid gap-3 lg:grid-cols-2">{fromDoctor.map((r) => <RecipeCard key={r.id} r={r} />)}</div>}
      </section>

      <section id="subir" className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 font-bold text-slate-900">Subir mi receta</h2>
        <p className="mb-4 text-sm text-slate-500">Toma una foto de tu fórmula médica: leemos el texto y te proponemos los medicamentos para que solo confirmes.</p>
        <RecipeDocumentUpload patientId={userId} onRegistered={done} />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Registrar medicamentos manualmente</h2>
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Este registro no prescribe ni valida dosis. Queda pendiente de revisión médica; no cambies un tratamiento por lo que muestre esta plataforma.</p>
        <MedicineItemForm onAdd={(i) => setItems((v) => [...v, i])} submitLabel="Añadir a la receta" />
        {items.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Medicamentos por registrar</h3>
            {items.map((i, n) => <div key={n} className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"><span>{medName(i.medicine)} · {i.unitsPerDay} {i.consumptionUnit}/día · {i.treatmentDays} días</span><button onClick={() => setItems((v) => v.filter((_, x) => x !== n))} className="text-red-600">Quitar</button></div>)}
            <button disabled={saving} onClick={() => void save()} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Registrar y enviar a revisión"}</button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Medicamentos que registré</h2>
        {loading ? <p className="text-slate-500">Cargando historial...</p>
          : mine.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">Todavía no has registrado recetas.</div>
          : <div className="grid gap-3 lg:grid-cols-2">{mine.map((r) => <RecipeCard key={r.id} r={r} />)}</div>}
      </section>
    </main>
  );
}
