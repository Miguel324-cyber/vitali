import { fetchApi } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  || (process.env.NODE_ENV === "production"
    ? "https://api-vitali.serverpalmas.cloud"
    : "http://localhost:8080");

/** El catálogo usa nombres en inglés (DailyMed); se muestran en español. */
const SPANISH: Record<string, string> = {
  Omeprazole: "Omeprazol", Prednisone: "Prednisona", Ibuprofen: "Ibuprofeno", Hydrochlorothiazide: "Hidroclorotiazida",
  Azithromycin: "Azitromicina", Acetaminophen: "Acetaminofén", Ciprofloxacin: "Ciprofloxacino", Cephalexin: "Cefalexina",
  Loratadine: "Loratadina", Naproxen: "Naproxeno", Fluoxetine: "Fluoxetina", Amoxicillin: "Amoxicilina",
  Lovastatin: "Lovastatina", Diclofenac: "Diclofenaco", Dexamethasone: "Dexametasona", Captopril: "Captopril",
  Clonazepam: "Clonazepam", Sertraline: "Sertralina", Metformin: "Metformina",
};

export const medName = (catalogName?: string | null) => (catalogName ? SPANISH[catalogName] || catalogName : "Medicamento");

export type Presentation = { id: number; medicamento: string; forma: string; via: string; concentration_value: number; concentration_unit: string; denominator: string };

export const presentationLabel = (p: Presentation) => `${p.forma} · ${p.concentration_value} ${p.concentration_unit} / ${p.denominator} · ${p.via}`;

/** Unidad de consumo que corresponde a la presentación (permite calcular mg/día). */
export const unitFor = (p?: Presentation) => (!p ? "tableta" : p.denominator === "5 mL" ? "mL" : p.denominator);

const presentationCache = new Map<string, Promise<Presentation[]>>();
export function getPresentations(medicine: string) {
  if (!presentationCache.has(medicine)) {
    presentationCache.set(medicine, fetchApi<Presentation[]>(`/api/medicamentos/presentaciones?medicamento=${encodeURIComponent(medicine)}`)
      .catch((e) => { presentationCache.delete(medicine); throw e; }));
  }
  return presentationCache.get(medicine)!;
}

export const RECIPE_STATUS: Record<string, { label: string; cls: string }> = {
  ASIGNADA_POR_MEDICO: { label: "Asignado por tu médico", cls: "bg-teal-100 text-teal-800" },
  PENDIENTE_REVISION_MEDICA: { label: "Pendiente de revisión", cls: "bg-amber-100 text-amber-800" },
  REVISADA_POR_MEDICO: { label: "Revisada por el médico", cls: "bg-emerald-100 text-emerald-800" },
  FINALIZADA: { label: "Finalizado", cls: "bg-slate-100 text-slate-600" },
  SUSPENDIDA: { label: "Suspendido", cls: "bg-red-100 text-red-700" },
};

/** Abre un documento de receta protegido (la descarga necesita el token). */
export async function openRecipeDocument(documentId: number) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/recetas/documentos/${documentId}/archivo`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error("No se pudo abrir el documento.");
  const url = URL.createObjectURL(await res.blob());
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
