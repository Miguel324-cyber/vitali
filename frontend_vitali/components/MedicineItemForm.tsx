"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { getPresentations, medName, presentationLabel, unitFor, type Presentation } from "@/lib/medications";

export type DraftItem = {
  medicine: string; presentationId: number; presentationLabel: string; indicatedDose: string;
  unitsPerDay: number; consumptionUnit: string; indication: string; treatmentDays: number;
};

type CatalogMedicine = { medicamento: string; active_ingredient?: string; purpose?: string };

let catalogPromise: Promise<CatalogMedicine[]> | null = null;
const loadCatalog = () => (catalogPromise ??= fetchApi<CatalogMedicine[]>("/api/medicamentos").catch((e) => { catalogPromise = null; throw e; }));

const input = "mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm";

/** Buscar un medicamento del catálogo, elegir su presentación y la dosis diaria. */
export default function MedicineItemForm({ onAdd, submitLabel = "Añadir" }: { onAdd: (item: DraftItem) => void; submitLabel?: string }) {
  const [catalog, setCatalog] = useState<CatalogMedicine[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [presentationId, setPresentationId] = useState(0);
  const [indicatedDose, setIndicatedDose] = useState("");
  const [unitsPerDay, setUnitsPerDay] = useState("1");
  const [unit, setUnit] = useState("tableta");
  const [days, setDays] = useState("7");
  const [indication, setIndication] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { loadCatalog().then(setCatalog).catch(() => setError("No se pudo cargar el catálogo de medicamentos.")); }, []);
  useEffect(() => {
    if (!selected) return;
    getPresentations(selected).then((p) => { setPresentations(p); if (p.length === 1) { setPresentationId(p[0].id); setUnit(unitFor(p[0])); } }).catch(() => setError("No se pudieron cargar las presentaciones."));
  }, [selected]);

  const matches = useMemo(() => {
    const t = query.toLowerCase();
    return catalog.filter((m) => `${m.medicamento} ${medName(m.medicamento)} ${m.active_ingredient || ""}`.toLowerCase().includes(t)).slice(0, 20);
  }, [catalog, query]);

  function choosePresentation(id: number) {
    setPresentationId(id);
    setUnit(unitFor(presentations.find((p) => p.id === id)));
  }

  function add() {
    const pres = presentations.find((p) => p.id === presentationId);
    if (!selected || !pres || !(Number(unitsPerDay) > 0) || !(Number(days) > 0) || !unit.trim()) {
      setError("Selecciona medicamento, presentación, unidades por día y duración.");
      return;
    }
    onAdd({ medicine: selected, presentationId: pres.id, presentationLabel: presentationLabel(pres), indicatedDose: indicatedDose.trim(),
      unitsPerDay: Number(unitsPerDay), consumptionUnit: unit.trim(), indication: indication.trim(), treatmentDays: Number(days) });
    setSelected(""); setQuery(""); setPresentations([]); setPresentationId(0); setIndicatedDose(""); setUnitsPerDay("1"); setDays("7"); setIndication(""); setError("");
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700">{error}</p>}
      <label className="block text-sm font-medium">Buscar medicamento del catálogo
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 p-2"><Search size={16} className="text-slate-400" /><input className="w-full text-sm outline-none" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(""); setPresentations([]); }} placeholder="Nombre o principio activo (ej. ibuprofeno)" /></div>
      </label>
      {query && !selected && (
        <div className="max-h-44 divide-y overflow-auto rounded-xl border">
          {matches.map((m) => <button type="button" key={m.medicamento} onClick={() => { setSelected(m.medicamento); setQuery(medName(m.medicamento)); setPresentationId(0); }} className="block w-full p-2.5 text-left text-sm hover:bg-teal-50">{medName(m.medicamento)} <span className="text-xs text-slate-400">({m.medicamento})</span><span className="block text-xs text-slate-500">{m.active_ingredient || m.purpose || ""}</span></button>)}
          {!matches.length && <p className="p-3 text-sm text-slate-500">No hay coincidencias en el catálogo.</p>}
        </div>
      )}
      {selected && (
        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="font-semibold">{medName(selected)}</p>
          <label className="block text-sm">Presentación
            <select className={input} value={presentationId || ""} onChange={(e) => choosePresentation(Number(e.target.value))}>
              <option value="">Selecciona presentación</option>
              {presentations.map((p) => <option key={p.id} value={p.id}>{presentationLabel(p)}</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Dosis indicada (texto de la fórmula)<input className={input} value={indicatedDose} onChange={(e) => setIndicatedDose(e.target.value)} placeholder="Ej. 1 tableta cada 8 horas" /></label>
            <label className="text-sm">Unidades por día<input type="number" min="0.1" step="0.1" className={input} value={unitsPerDay} onChange={(e) => setUnitsPerDay(e.target.value)} /></label>
            <label className="text-sm">Unidad de consumo<input className={input} value={unit} onChange={(e) => setUnit(e.target.value)} /></label>
            <label className="text-sm">Duración (días)<input type="number" min="1" className={input} value={days} onChange={(e) => setDays(e.target.value)} /></label>
          </div>
          <label className="block text-sm">Indicación<input className={input} value={indication} onChange={(e) => setIndication(e.target.value)} placeholder="Motivo del tratamiento" /></label>
          <button type="button" onClick={add} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> {submitLabel}</button>
        </div>
      )}
    </div>
  );
}
