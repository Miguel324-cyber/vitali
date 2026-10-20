'use client';

import { FormEvent, useEffect, useState } from 'react';

type Presentation = {
  id: number; medicamento: string; forma: string; via: string;
  concentrationValue: number; concentrationUnit: string; denominator: string;
  saltOrRelease?: string; sourceLabel?: string; indicaciones: string[];
};
type MedicineInput = { presentationId: string; unitsPerAdministration: string; intervalHours: string; unit: string; indication: string; days: string };
type Analysis = { recetaId: number; estado: string; medicamentos: { medicamento: string; estado: string; mgPorDia: number | null; maximoMgPorDia: number | null; regla: string | null; advertencias: string[] }[]; advertencias: string[] };
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const emptyMedicine = (): MedicineInput => ({ presentationId: '', unitsPerAdministration: '', intervalHours: '', unit: '', indication: '', days: '' });
const statusLabel = (status: string) => status === 'SEGURO' ? 'Consumo dentro del límite' : status === 'SOBREMEDICADO' ? 'Supera el límite diario' : 'Revisión';

export default function InicioPaciente() {
  const [view, setView] = useState('medicacion');
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [patientId, setPatientId] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [medicines, setMedicines] = useState<MedicineInput[]>([emptyMedicine()]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/recetas/medicamentos`)
      .then(async r => { if (!r.ok) throw new Error('No se pudo cargar el catálogo de presentaciones.'); return r.json(); })
      .then(setPresentations).catch(e => setError(e.message));
  }, []);

  const updateMedicine = (index: number, field: keyof MedicineInput, value: string) => {
    setMedicines(current => current.map((m, i) => i === index ? { ...m, [field]: value } : m));
    setAnalysis(null);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setAnalysis(null); setLoading(true);
    try {
      const response = await fetch(`${API}/api/recetas/subir`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId: Number(patientId), edadAnios: Number(age), pesoKg: weight ? Number(weight) : null,
          medicamentos: medicines.map(m => ({ presentacionId: Number(m.presentationId), cantidadPorToma: Number(m.unitsPerAdministration), intervaloHoras: Number(m.intervalHours), unidadConsumo: m.unit,
            indicacion: m.indication, diasTratamiento: Number(m.days) })) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'No se pudo analizar la medicación.');
      setAnalysis(body);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error de conexión con el backend.'); }
    finally { setLoading(false); }
  };

  const options = [
    { id: 'ver-citas', label: 'Ver citas médicas' }, { id: 'agendar-cita', label: 'Agendar cita' },
    { id: 'medicacion', label: 'Consulta medicación' }, { id: 'consultar-citas', label: 'Consultar citas' }, { id: 'ayuda', label: '¿Necesitas ayuda?' },
  ];
  return <div className="flex min-h-screen bg-slate-50">
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
      <div className="p-8"><h1 className="text-3xl font-extrabold text-[#0284C7]">Vitali</h1><p className="mt-1 text-sm font-medium text-slate-500">Portal del Paciente</p></div>
      <nav className="flex flex-1 flex-col gap-2 px-4">{options.map(o => <button key={o.id} onClick={() => setView(o.id)} className={`rounded-xl px-5 py-4 text-left text-sm font-semibold ${view === o.id ? 'bg-[#0284C7] text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{o.label}</button>)}</nav>
      <div className="border-t border-slate-100 p-4"><a href="/login/usuario" className="block rounded-xl px-4 py-3 text-center font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600">Cerrar Sesión</a></div>
    </aside>
    <div className="flex h-screen flex-1 flex-col overflow-y-auto">
      <header className="flex justify-end border-b border-slate-200 bg-white p-6 shadow-sm"><span className="font-bold text-slate-700">Mi Perfil</span></header>
      <main className="flex-1 p-6 lg:p-10">
        {view !== 'medicacion' ? <h2 className="text-3xl font-bold text-slate-800">{options.find(o => o.id === view)?.label}</h2> : <>
          <h2 className="mb-2 text-3xl font-bold text-slate-800">Revisar dosis de medicamentos</h2>
          <p className="mb-6 max-w-3xl text-slate-600">El resultado compara la cantidad diaria calculada con el límite diario disponible para el medicamento. Si supera el límite, genera una alerta; si no hay límite o no se puede convertir la dosis, indica “Revisión”.</p>
          <form onSubmit={submit} className="max-w-4xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">ID del paciente<input required type="number" min="1" value={patientId} onChange={e => setPatientId(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
              <label className="text-sm font-semibold text-slate-700">Edad (años)<input required type="number" min="0" step="0.1" value={age} onChange={e => setAge(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
              <label className="text-sm font-semibold text-slate-700">Peso (kg), si aplica<input type="number" min="0.1" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
            </div>
            {medicines.map((m, i) => <fieldset key={i} className="space-y-4 rounded-xl border border-slate-200 p-4">
              <legend className="px-2 font-bold text-slate-800">Medicamento {i + 1}</legend>
              <label className="block text-sm font-semibold text-slate-700">Presentación<select required value={m.presentationId} onChange={e => { updateMedicine(i, 'presentationId', e.target.value); updateMedicine(i, 'unit', ''); }} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">Selecciona del catálogo</option>{presentations.map(p => <option key={p.id} value={p.id}>{p.medicamento} — {p.forma}, {p.concentrationValue} {p.concentrationUnit}/{p.denominator} ({p.via})</option>)}</select></label>
              {m.presentationId && (() => { const p = presentations.find(x => x.id === Number(m.presentationId)); return <p className="text-xs text-slate-500">Etiqueta de referencia: {p?.sourceLabel ?? 'sin detalle'}. Confirma que coincide con el envase del paciente.</p>; })()}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Cantidad por toma<input required type="number" min="0.01" step="0.01" value={m.unitsPerAdministration} onChange={e => updateMedicine(i, 'unitsPerAdministration', e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
                <label className="text-sm font-semibold text-slate-700">Frecuencia: cada cuántas horas<input required type="number" min="1" max="24" step="0.5" value={m.intervalHours} onChange={e => updateMedicine(i, 'intervalHours', e.target.value)} placeholder="Ej. 3" className="mt-1 w-full rounded-lg border p-3" /></label>
                <label className="text-sm font-semibold text-slate-700">Unidad<select required value={m.unit} onChange={e => updateMedicine(i, 'unit', e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">Selecciona unidad</option>{(() => { const p = presentations.find(x => x.id === Number(m.presentationId)); const d = (p?.denominator ?? '').toLowerCase(); const u = d.includes('5 ml') ? ['mL'] : d.includes('tableta') ? ['tableta'] : d.includes('cápsula') || d.includes('capsula') ? ['cápsula'] : d.includes('supositorio') ? ['supositorio'] : ['mL']; return u.map(x => <option key={x} value={x}>{x}</option>); })()}</select></label>
                <label className="text-sm font-semibold text-slate-700">Indicación de referencia<select required value={m.indication} onChange={e => updateMedicine(i, 'indication', e.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">Selecciona la indicación más cercana</option>{presentations.find(x => x.id === Number(m.presentationId))?.indicaciones.map(x => <option key={x} value={x}>{x}</option>)}</select></label>
                <label className="text-sm font-semibold text-slate-700">Días de tratamiento<input required type="number" min="1" step="1" value={m.days} onChange={e => updateMedicine(i, 'days', e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
              </div>
              {medicines.length > 1 && <button type="button" onClick={() => setMedicines(current => current.filter((_, j) => j !== i))} className="text-sm font-semibold text-red-600">Quitar medicamento</button>}
            </fieldset>)}
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setMedicines(current => [...current, emptyMedicine()])} className="rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700">Agregar otro medicamento</button><button disabled={loading || presentations.length === 0} className="rounded-lg bg-[#0284C7] px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'Analizando…' : 'Analizar dosis'}</button></div>
          </form>
          {error && <p role="alert" className="mt-4 max-w-4xl rounded-lg bg-red-50 p-4 text-red-700">{error}</p>}
          {analysis && <section className="mt-6 max-w-4xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6"><h3 className="text-xl font-bold">Resultado: {statusLabel(analysis.estado)}</h3><p className="text-sm text-slate-600">Receta #{analysis.recetaId}. El resultado refleja la comparación de dosis diaria con los límites disponibles; muestra advertencias de etiqueta por separado.</p>{analysis.medicamentos.map((m, i) => <article key={`${m.medicamento}-${i}`} className="rounded-xl bg-slate-50 p-4"><h4 className="font-bold">{m.medicamento}: {statusLabel(m.estado)}</h4><p className="text-sm">{m.mgPorDia == null ? 'No se pudo determinar mg/día' : `${m.mgPorDia} mg/día`}{m.maximoMgPorDia == null ? '' : ` (límite de referencia: ${m.maximoMgPorDia} mg/día)`}</p>{m.advertencias.map((w, j) => <p key={j} className="mt-1 text-sm text-amber-800">• {w}</p>)}</article>)}</section>}
        </>}
      </main>
    </div>
  </div>;
}
