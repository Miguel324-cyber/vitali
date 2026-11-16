import { medName, RECIPE_STATUS } from "@/lib/medications";

export type Treatment = {
  recipeId: number; uploadedAt: string | null; status: string | null; doctorId?: number | null; itemId: number;
  medicine: string | null; dose: string | null; unitsPerDay: number | null; unit: string | null;
  indication: string | null; treatmentDays: number | null;
};

export type PatientWithTreatments = {
  patientId: number; fullName: string; email: string; status?: string; avatarUrl?: string | null;
  birthDate: string | null; phone: string | null; weight: number | null; height: number | null;
  conditions: string | null; medications: string | null; treatments: Treatment[]; pendingQuestions: number;
};

const statusLabel = (s: string) => RECIPE_STATUS[s]?.label || s;

/** Busca por nombre/correo del paciente o por el nombre de un medicamento de su tratamiento. */
export function matchesPatient(p: PatientWithTreatments, term: string) {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return p.fullName.toLowerCase().includes(t) || p.email.toLowerCase().includes(t)
    || (p.medications || "").toLowerCase().includes(t)
    || p.treatments.some((x) => (x.medicine || "").toLowerCase().includes(t));
}

export default function TreatmentList({ treatments, medications, compact }: { treatments: Treatment[]; medications?: string | null; compact?: boolean }) {
  const shown = compact ? treatments.slice(0, 4) : treatments;
  return (
    <div className="space-y-2">
      {treatments.length === 0 ? (
        <p className="text-xs text-slate-500">Sin recetas registradas.</p>
      ) : (
        <ul className="space-y-1.5">
          {shown.map((t) => (
            <li key={t.itemId} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <b className="text-slate-800">{medName(t.medicine)}</b>
                <span className="text-slate-400">{t.doctorId != null ? "Tratamiento" : "Receta"} #{t.recipeId}{t.status ? ` · ${statusLabel(t.status)}` : ""}</span>
              </div>
              <p className="mt-0.5 text-slate-600">
                {[t.dose, t.unitsPerDay != null ? `${t.unitsPerDay} ${t.unit || ""}/día`.trim() : null, t.treatmentDays != null ? `${t.treatmentDays} días` : null].filter(Boolean).join(" · ") || "Sin indicaciones de dosis"}
              </p>
              {!compact && t.indication && <p className="mt-0.5 text-slate-500">{t.indication}</p>}
            </li>
          ))}
          {compact && treatments.length > shown.length && <li className="text-xs text-slate-500">+{treatments.length - shown.length} medicamentos más</li>}
        </ul>
      )}
      {medications && (
        <p className="text-xs text-slate-500"><span className="font-semibold text-slate-600">Medicamentos que reporta:</span> {medications.split("\n").filter(Boolean).join(", ")}</p>
      )}
    </div>
  );
}
