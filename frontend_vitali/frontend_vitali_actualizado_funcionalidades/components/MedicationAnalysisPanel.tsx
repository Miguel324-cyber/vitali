"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Stethoscope } from "lucide-react";
import { fetchApi } from "@/lib/api";

type DoseCheck = { medicine: string; medicineEs: string; items: number; totalMgPerDay: number | null; limitMgPerDay: number | null; limitSource: string | null; status: string; message: string };
type Interaction = { a: string; b: string; aEs: string; bEs: string; severity: "ALTA" | "MODERADA" | "LEVE"; title: string; message: string; source: string; aReportedOnly?: boolean; bReportedOnly?: boolean };
type Analysis = {
  patient: { age: number | null; weight: number | null };
  summary: { status: string; alerts: number; activeMedications: number };
  doseChecks: DoseCheck[]; interactions: Interaction[]; recommendations: string[];
  reportedWithoutDose: { medicine: string; medicineEs: string }[]; disclaimer: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  OK: { label: "Dentro de rango", cls: "bg-emerald-100 text-emerald-800" },
  REVISAR: { label: "Revisar", cls: "bg-amber-100 text-amber-800" },
  ALTA: { label: "Dosis elevada", cls: "bg-red-100 text-red-700" },
  SIN_DATOS: { label: "Sin referencia", cls: "bg-slate-100 text-slate-600" },
};
const SEVERITY: Record<string, string> = { ALTA: "border-red-200 bg-red-50 text-red-800", MODERADA: "border-amber-200 bg-amber-50 text-amber-900", LEVE: "border-slate-200 bg-slate-50 text-slate-700" };
const SEVERITY_LABEL: Record<string, string> = { ALTA: "Riesgo alto", MODERADA: "Precaución", LEVE: "Informativo" };

/** Compara los medicamentos activos del paciente: dosis diaria, interacciones y recomendaciones. */
export default function MedicationAnalysisPanel({ patientId, refreshKey, audience = "patient" }: { patientId: number; refreshKey?: number; audience?: "patient" | "doctor" }) {
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) return;
    fetchApi<Analysis>(`/api/recetas/analisis/${patientId}`).then((d) => { setData(d); setError(""); }).catch((e) => setError(e instanceof Error ? e.message : "No se pudo analizar los medicamentos."));
  }, [patientId, refreshKey]);

  if (error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  if (!data) return <p className="rounded-2xl border bg-white p-5 text-sm text-slate-500">Analizando medicamentos...</p>;

  const s = data.summary;
  const header = s.status === "ALTA" ? { icon: ShieldAlert, cls: "border-red-200 bg-red-50", title: "Hay alertas importantes", text: "text-red-800" }
    : s.status === "REVISAR" ? { icon: AlertTriangle, cls: "border-amber-200 bg-amber-50", title: "Hay puntos para revisar con tu médico", text: "text-amber-900" }
    : { icon: CheckCircle2, cls: "border-emerald-200 bg-emerald-50", title: s.activeMedications ? "No se encontraron alertas" : "No hay medicamentos activos para analizar", text: "text-emerald-900" };
  const Icon = header.icon;
  const you = audience === "patient";

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className={`flex items-start gap-3 rounded-xl border p-4 ${header.cls}`}>
        <Icon className={header.text} size={22} />
        <div>
          <h2 className={`font-bold ${header.text}`}>{header.title}</h2>
          <p className="text-sm text-slate-600">{s.activeMedications} medicamento(s) activo(s) · {s.alerts} alerta(s){data.patient.age != null ? ` · ${data.patient.age} años` : ""}{data.patient.weight != null ? ` · ${data.patient.weight} kg` : ""}</p>
        </div>
      </div>

      {data.recommendations.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800"><Stethoscope size={16} className="text-teal-700" /> {you ? "Recomendaciones para ti" : "Puntos a revisar"}</h3>
          <ul className="space-y-1.5">{data.recommendations.map((r, i) => <li key={i} className="flex gap-2 text-sm text-slate-700"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />{r}</li>)}</ul>
        </div>
      )}

      {data.doseChecks.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-800">Dosis diaria</h3>
          <div className="space-y-2">
            {data.doseChecks.map((c) => (
              <div key={c.medicine} className="rounded-xl border border-slate-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <b className="text-sm">{c.medicineEs}</b>
                  <div className="flex items-center gap-2 text-xs">
                    {c.totalMgPerDay != null && <span className="text-slate-600">{c.totalMgPerDay} mg/día{c.limitMgPerDay != null ? ` de ${c.limitMgPerDay} máx.` : ""}</span>}
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${(STATUS[c.status] || STATUS.SIN_DATOS).cls}`}>{(STATUS[c.status] || STATUS.SIN_DATOS).label}</span>
                  </div>
                </div>
                {c.totalMgPerDay != null && c.limitMgPerDay != null && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${c.status === "ALTA" ? "bg-red-500" : c.status === "REVISAR" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (c.totalMgPerDay / c.limitMgPerDay) * 100)}%` }} /></div>
                )}
                <p className="mt-1.5 text-xs text-slate-600">{c.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-bold text-slate-800">Compatibilidad entre medicamentos</h3>
        {data.interactions.length === 0 ? <p className="text-sm text-slate-500">No se encontraron interacciones conocidas entre los medicamentos registrados.</p>
          : <div className="space-y-2">{data.interactions.map((i) => (
            <div key={`${i.a}-${i.b}`} className={`rounded-xl border p-3 text-sm ${SEVERITY[i.severity]}`}>
              <div className="flex flex-wrap items-center justify-between gap-2"><b>{i.aEs} + {i.bEs}</b><span className="text-xs font-semibold uppercase">{SEVERITY_LABEL[i.severity]}</span></div>
              <p className="mt-1">{i.title !== "Mencionado en la etiqueta" && <span className="font-medium">{i.title}. </span>}{i.message}</p>
              {(i.aReportedOnly || i.bReportedOnly) && <p className="mt-1 text-xs opacity-80">Incluye medicamentos reportados en {you ? "tu" : "el"} perfil sin dosis registrada.</p>}
            </div>
          ))}</div>}
      </div>

      <p className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500"><Info size={14} className="mt-0.5 shrink-0" />{data.disclaimer}</p>
    </section>
  );
}
