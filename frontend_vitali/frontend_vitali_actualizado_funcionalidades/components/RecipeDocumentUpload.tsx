"use client";
import { useEffect, useState } from "react";
import { FileText, ImageIcon, LoaderCircle, ScanText, Upload, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { getPresentations, medName, presentationLabel, unitFor, type Presentation } from "@/lib/medications";

type Suggestion = {
  medicine: string; medicineEs: string; presentationId: number | null; presentationLabel: string | null; strengthFound: number | null;
  unitsPerDay: number | null; consumptionUnit: string; treatmentDays: number | null; matchedText: string;
};
type Row = Suggestion & { selected: boolean; units: string; days: string; presentations: Presentation[] };

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result));
  r.onerror = () => reject(new Error("No se pudo leer el archivo."));
  r.readAsDataURL(file);
});

/** Subir foto o PDF de la receta, leer el texto (OCR) y proponer los medicamentos para registrarlos. */
export default function RecipeDocumentUpload({ patientId, onRegistered }: { patientId: number; onRegistered: (msg: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [text, setText] = useState("");
  const [ocr, setOcr] = useState<{ running: boolean; progress: number }>({ running: false, progress: 0 });
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function reset() {
    setFile(null); setPreview(""); setText(""); setDocumentId(null); setRows(null); setError(""); setOcr({ running: false, progress: 0 });
  }

  async function choose(f: File | undefined) {
    if (!f) return;
    reset();
    if (!TYPES.includes(f.type)) { setError("Formato no admitido. Usa una foto (JPG, PNG, WEBP) o un PDF."); return; }
    if (f.size > MAX_BYTES) { setError("El archivo supera 5 MB. Toma la foto con menor resolución."); return; }
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
      await runOcr(f);
    }
  }

  async function runOcr(f: File) {
    setOcr({ running: true, progress: 0 });
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("spa", 1, {
        logger: (m: { status: string; progress: number }) => { if (m.status === "recognizing text") setOcr({ running: true, progress: m.progress }); },
      });
      const { data } = await worker.recognize(f);
      await worker.terminate();
      setText(data.text.trim());
      if (!data.text.trim()) setError("No se pudo leer texto en la imagen. Escribe los medicamentos en el cuadro.");
    } catch {
      setError("No se pudo leer la imagen automáticamente (revisa tu conexión). Escribe los medicamentos en el cuadro.");
    } finally {
      setOcr({ running: false, progress: 0 });
    }
  }

  async function toRows(suggestions: Suggestion[]) {
    const out: Row[] = [];
    for (const s of suggestions) {
      const presentations = await getPresentations(s.medicine).catch(() => [] as Presentation[]);
      out.push({ ...s, selected: true, units: s.unitsPerDay != null ? String(s.unitsPerDay) : "", days: s.treatmentDays != null ? String(s.treatmentDays) : "", presentations });
    }
    setRows(out);
  }

  async function analyze() {
    if (!file) return;
    setBusy(true); setError("");
    try {
      if (documentId == null) {
        const res = await fetchApi<{ documentId: number; suggestions: Suggestion[] }>("/api/recetas/documentos", {
          method: "POST", body: JSON.stringify({ fileName: file.name, contentType: file.type, dataBase64: await toDataUrl(file), text }),
        });
        setDocumentId(res.documentId);
        await toRows(res.suggestions);
      } else if (text.trim()) {
        const res = await fetchApi<{ suggestions: Suggestion[] }>("/api/recetas/detectar", { method: "POST", body: JSON.stringify({ text }) });
        await toRows(res.suggestions);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo procesar la receta."); }
    finally { setBusy(false); }
  }

  const update = (i: number, patch: Partial<Row>) => setRows((r) => r && r.map((x, n) => (n === i ? { ...x, ...patch } : x)));

  async function register() {
    if (!rows) return;
    const chosen = rows.filter((r) => r.selected);
    if (!chosen.length) { setError("Selecciona al menos un medicamento."); return; }
    const invalid = chosen.find((r) => !r.presentationId || !(Number(r.units) > 0) || !(Number(r.days) > 0));
    if (invalid) { setError(`Completa presentación, unidades por día y días para ${invalid.medicineEs}.`); return; }
    setBusy(true); setError("");
    try {
      await fetchApi("/api/recetas", { method: "POST", body: JSON.stringify({
        patientId, documentId,
        items: chosen.map((r) => ({ presentationId: r.presentationId, indicatedDose: r.matchedText.slice(0, 200), unitsPerDay: Number(r.units), consumptionUnit: r.consumptionUnit, indication: "Registrado desde documento de receta", treatmentDays: Number(r.days) })),
      }) });
      onRegistered(`Se registraron ${chosen.length} medicamento(s) desde tu receta. Quedan pendientes de revisión médica.`);
      reset();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudieron registrar los medicamentos."); }
    finally { setBusy(false); }
  }

  const isPdf = file?.type === "application/pdf";

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-8 text-center hover:bg-teal-50">
          <Upload className="text-teal-700" size={28} />
          <span className="font-semibold text-slate-800">Sube una foto o PDF de tu receta</span>
          <span className="text-xs text-slate-500">JPG, PNG, WEBP o PDF · máximo 5 MB. Leeremos el texto para proponerte los medicamentos.</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" className="sr-only" onChange={(e) => void choose(e.target.files?.[0])} />
        </label>
      ) : (
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="relative rounded-xl border bg-slate-50 p-2">
            <button type="button" onClick={reset} aria-label="Quitar archivo" className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"><X size={14} /></button>
            {preview ? <img src={preview} alt="Vista previa de la receta" className="max-h-60 w-full rounded-lg object-contain" />
              : <div className="flex h-40 flex-col items-center justify-center gap-2 text-slate-500"><FileText size={32} /><span className="text-xs">PDF</span></div>}
            <p className="mt-1 truncate text-xs text-slate-500">{isPdf ? <FileText size={12} className="inline" /> : <ImageIcon size={12} className="inline" />} {file.name}</p>
          </div>
          <div className="space-y-2">
            {ocr.running ? (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={16} /> Leyendo la receta... {Math.round(ocr.progress * 100)}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-teal-600 transition-all" style={{ width: `${Math.round(ocr.progress * 100)}%` }} /></div>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium">Texto de la receta {isPdf ? "(escríbelo; los PDF no se leen automáticamente)" : "(revisa y corrige si algo quedó mal)"}
                  <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Ej. Ibuprofeno 200 mg, 1 tableta cada 8 horas por 5 días" />
                </label>
                <button type="button" disabled={busy} onClick={() => void analyze()} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {busy ? <LoaderCircle className="animate-spin" size={16} /> : <ScanText size={16} />} {documentId == null ? "Guardar receta y detectar medicamentos" : "Volver a detectar"}
                </button>
                {documentId != null && <p className="text-xs text-emerald-700">Documento guardado. Tu médico podrá verlo en tu ficha.</p>}
              </>
            )}
          </div>
        </div>
      )}

      {rows && (
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Medicamentos detectados ({rows.length})</h3>
          {rows.length === 0 && <p className="rounded-xl border border-dashed p-4 text-sm text-slate-500">No encontramos medicamentos del catálogo en el texto. Corrige el texto o regístralos manualmente más abajo.</p>}
          {rows.map((r, i) => {
            const pres = r.presentations.find((p) => p.id === r.presentationId);
            const mismatch = r.strengthFound != null && pres && pres.concentration_value !== r.strengthFound;
            return (
              <div key={r.medicine} className={`rounded-xl border p-4 ${r.selected ? "border-teal-200 bg-white" : "border-slate-100 bg-slate-50 opacity-70"}`}>
                <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="accent-teal-700" checked={r.selected} onChange={(e) => update(i, { selected: e.target.checked })} /> {medName(r.medicine)}</label>
                <p className="mt-1 text-xs italic text-slate-500">“{r.matchedText}”</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <label className="text-xs sm:col-span-2">Presentación
                    <select className="mt-1 w-full rounded-lg border p-2 text-sm" value={r.presentationId || ""} onChange={(e) => { const p = r.presentations.find((x) => x.id === Number(e.target.value)); update(i, { presentationId: p?.id ?? null, consumptionUnit: unitFor(p) }); }}>
                      <option value="">Selecciona...</option>
                      {r.presentations.map((p) => <option key={p.id} value={p.id}>{presentationLabel(p)}</option>)}
                    </select>
                  </label>
                  <label className="text-xs">{r.consumptionUnit}s por día<input type="number" min="0.1" step="0.1" className="mt-1 w-full rounded-lg border p-2 text-sm" value={r.units} onChange={(e) => update(i, { units: e.target.value })} /></label>
                  <label className="text-xs">Días<input type="number" min="1" className="mt-1 w-full rounded-lg border p-2 text-sm" value={r.days} onChange={(e) => update(i, { days: e.target.value })} /></label>
                </div>
                {mismatch && <p className="mt-2 text-xs text-amber-700">La receta dice {r.strengthFound} mg, pero el catálogo solo tiene {pres!.concentration_value} mg. Ajusta las unidades por día para que la dosis total coincida.</p>}
              </div>
            );
          })}
          {rows.length > 0 && <button type="button" disabled={busy} onClick={() => void register()} className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Registrando..." : "Registrar medicamentos seleccionados"}</button>}
        </div>
      )}
    </div>
  );
}
