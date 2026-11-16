"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import TreatmentList, { matchesPatient, type PatientWithTreatments } from "@/components/TreatmentList";
import AssignDoctorDialog, { type DoctorLoad } from "./AssignDoctorDialog";
import AdminToast, { type ToastMessage } from "./AdminToast";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */
type Status = "ACTIVE" | "PENDING" | "REJECTED" | "SUSPENDED";
type UserLite = { id: number; fullName: string; email: string; role: string; status: string };
type FamilyRef = { linkId: number; familyId: number; familyName: string; relationship: string | null; active: boolean };
type PatientRef = { linkId: number; patientId: number; patientName: string; relationship: string | null; active: boolean };
type Patient = {
  userId: number; fullName: string; email: string; status: Status; birthDate: string | null; phone: string | null;
  documentType: string | null; documentNumber: string | null; bloodType: string | null; weight: number | null;
  height: number | null; conditions: string | null; medications: string | null;
  assignedDoctorId: number | null; assignedDoctorName: string | null; families: FamilyRef[];
};
type Family = { userId: number; fullName: string; email: string; status: Status; phone: string | null; patients: PatientRef[] };
type LinkRow = { id: number; patientId: number; patientName: string; doctorId: number | null; doctorName: string | null; familyId: number; familyName: string; active: boolean; relationship: string | null };
type RecipeItem = { id: number; medicine: string | null; indicatedDose: string | null; presentationId: number | null; unitsPerDay: number | null; consumptionUnit: string | null; indication: string | null; treatmentDays: number | null };
type Recipe = { id: number; patientId: number; patientName: string | null; uploadedAt: string | null; status: string | null; items: RecipeItem[] };
type Medication = { name: string; activeIngredient: string | null; purpose: string | null; dosageAndAdministration: string | null; warnings: string | null; contraindications: string | null; drugInteractions: string | null; dosageForm: string | null; route: string | null };

type Notify = { ok: (m: string) => void; fail: (e: unknown) => void };
type FieldDef = { key: string; label: string; type?: "text" | "email" | "date" | "number" | "textarea" | "select"; options?: { value: string; label: string; disabled?: boolean }[]; readOnly?: boolean; full?: boolean };
type Values = Record<string, string>;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" }, { value: "PENDING", label: "Pendiente" },
  { value: "REJECTED", label: "Rechazado" }, { value: "SUSPENDED", label: "Suspendido" },
];

const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const num = (v: string) => (v.trim() === "" ? null : Number(v));
const txt = (v: string) => (v.trim() === "" ? null : v.trim());

/* ------------------------------------------------------------------ */
/* Modal + formulario reutilizable (ver / editar / crear)              */
/* ------------------------------------------------------------------ */
function FormModal({ title, fields, initial, readOnly, onSave, onClose }: {
  title: string; fields: FieldDef[]; initial: Values; readOnly?: boolean;
  onSave?: (v: Values) => Promise<void>; onClose: () => void;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const input = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-600";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSave) return;
    setSaving(true);
    try { await onSave(values); onClose(); } catch { /* el error se muestra en el panel */ } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.key} className={`block text-xs font-medium text-slate-600 ${f.full || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
              {f.label}
              {f.type === "textarea" ? (
                <textarea rows={3} disabled={readOnly || f.readOnly} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={input} />
              ) : f.type === "select" ? (
                <select disabled={readOnly || f.readOnly} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={input}>
                  {f.options?.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type ?? "text"} step={f.type === "number" ? "any" : undefined} disabled={readOnly || f.readOnly} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={input} />
              )}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">{readOnly ? "Cerrar" : "Cancelar"}</button>
          {!readOnly && <button disabled={saving} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>}
        </div>
      </form>
    </div>
  );
}

const Btn = ({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) => (
  <button onClick={onClick} className={`rounded-lg border px-2 py-1 text-xs font-semibold ${danger ? "border-red-200 text-red-700" : ""}`}>{children}</button>
);
const Badge = ({ on, yes = "Activo", no = "Inactivo" }: { on: boolean; yes?: string; no?: string }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${on ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{on ? yes : no}</span>
);
const SearchBar = ({ value, onChange, onSearch, extra }: { value: string; onChange: (v: string) => void; onSearch: () => void; extra?: React.ReactNode }) => (
  <div className="flex flex-wrap gap-2">
    <input value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="Buscar..." className="min-w-0 flex-1 rounded-xl border p-2 text-sm" />
    <button onClick={onSearch} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Buscar</button>
    {extra}
  </div>
);

/* ------------------------------------------------------------------ */
/* Pacientes                                                           */
/* ------------------------------------------------------------------ */
function PatientsTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<DoctorLoad[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ p: Patient; readOnly: boolean } | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([
        fetchApi<Patient[]>(`/api/admin/patients?search=${encodeURIComponent(search)}`),
        fetchApi<DoctorLoad[]>("/api/admin/doctors/load"),
      ]);
      setRows(p); setDoctors(d.filter((x) => x.status === "ACTIVE"));
    } catch (e) { n.fail(e); }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields: FieldDef[] = [
    { key: "fullName", label: "Nombre completo" }, { key: "email", label: "Correo", type: "email" },
    { key: "status", label: "Estado", type: "select", options: STATUS_OPTIONS },
    { key: "assignedDoctorId", label: "Médico asignado", type: "select", options: [{ value: "", label: "Sin asignar" }, ...doctors.map((d) => {
      const blocked = d.full && d.id !== modal?.p.assignedDoctorId;
      return { value: String(d.id), label: `${d.fullName} · ${d.assignedPatients}/${d.maxPatients} pacientes${blocked ? " — cupo lleno" : ""}`, disabled: blocked };
    })] },
    { key: "birthDate", label: "Fecha de nacimiento", type: "date" }, { key: "phone", label: "Teléfono" },
    { key: "documentType", label: "Tipo de documento" }, { key: "documentNumber", label: "Número de documento" },
    { key: "bloodType", label: "Grupo sanguíneo" }, { key: "weight", label: "Peso (kg)", type: "number" },
    { key: "height", label: "Estatura (cm)", type: "number" },
    { key: "conditions", label: "Condiciones médicas", type: "textarea" },
    { key: "medications", label: "Medicamentos actuales", type: "textarea" },
  ];

  async function save(p: Patient, v: Values) {
    try {
      await fetchApi(`/api/admin/patients/${p.userId}`, { method: "PUT", body: JSON.stringify({
        fullName: v.fullName, email: v.email, status: v.status, birthDate: txt(v.birthDate), phone: txt(v.phone),
        documentType: txt(v.documentType), documentNumber: txt(v.documentNumber), bloodType: txt(v.bloodType),
        weight: num(v.weight), height: num(v.height), conditions: txt(v.conditions), medications: txt(v.medications),
        assignedDoctorId: num(v.assignedDoctorId),
      }) });
      n.ok("Paciente actualizado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function remove(p: Patient) {
    if (!window.confirm(`¿Eliminar al paciente ${p.fullName}? Se borrarán también su perfil, recetas, citas y vínculos.`)) return;
    try { await fetchApi(`/api/admin/users/${p.userId}`, { method: "DELETE" }); n.ok("Paciente eliminado."); await load(); } catch (e) { n.fail(e); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={() => void load()} />
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-xs text-slate-500"><th className="p-3">Paciente</th><th>Estado</th><th>Médico</th><th>Familiares</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p.userId} className="border-b last:border-0">
            <td className="p-3"><b>{p.fullName}</b><div className="text-xs text-slate-500">{p.email} · ID {p.userId}</div></td>
            <td>{p.status}</td><td>{p.assignedDoctorName || "Sin asignar"}</td>
            <td className="text-xs">{p.families.filter((f) => f.active).map((f) => f.familyName).join(", ") || "—"}</td>
            <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setModal({ p, readOnly: true })}>Ver</Btn><Btn onClick={() => setModal({ p, readOnly: false })}>Editar</Btn><Btn danger onClick={() => void remove(p)}>Eliminar</Btn></td>
          </tr>))}
          {!rows.length && <tr><td colSpan={5} className="p-4 text-slate-500">No hay pacientes.</td></tr>}
        </tbody></table></div>
      {modal && <FormModal title={modal.readOnly ? `Paciente: ${modal.p.fullName}` : `Editar paciente: ${modal.p.fullName}`} fields={fields} readOnly={modal.readOnly}
        initial={{ fullName: s(modal.p.fullName), email: s(modal.p.email), status: s(modal.p.status), assignedDoctorId: s(modal.p.assignedDoctorId), birthDate: s(modal.p.birthDate), phone: s(modal.p.phone), documentType: s(modal.p.documentType), documentNumber: s(modal.p.documentNumber), bloodType: s(modal.p.bloodType), weight: s(modal.p.weight), height: s(modal.p.height), conditions: s(modal.p.conditions), medications: s(modal.p.medications) }}
        onSave={(v) => save(modal.p, v)} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Médicos                                                             */
/* ------------------------------------------------------------------ */
function DoctorPatientsModal({ doctor, maxPatients, n, onClose }: { doctor: UserLite; maxPatients: number; n: Notify; onClose: () => void }) {
  const [assigned, setAssigned] = useState<PatientWithTreatments[]>([]);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState("");
  const [toAssign, setToAssign] = useState("");
  const [busy, setBusy] = useState(false);
  const active = doctor.status === "ACTIVE";

  const load = useCallback(async () => {
    try {
      const [a, p] = await Promise.all([
        fetchApi<PatientWithTreatments[]>(`/api/admin/doctors/${doctor.id}/patients`),
        fetchApi<Patient[]>("/api/admin/patients"),
      ]);
      setAssigned(a); setAllPatients(p);
    } catch (e) { n.fail(e); }
  }, [doctor.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);

  async function setDoctor(patientId: number, doctorId: number | null, okMsg: string) {
    setBusy(true);
    try {
      await fetchApi(`/api/admin/patients/${patientId}/doctor`, { method: "PATCH", body: JSON.stringify({ doctorId }) });
      n.ok(okMsg); setToAssign(""); await load();
    } catch (e) { n.fail(e); } finally { setBusy(false); }
  }

  const candidates = allPatients.filter((p) => p.assignedDoctorId !== doctor.id);
  const visible = assigned.filter((p) => matchesPatient(p, filter));
  const full = assigned.length >= maxPatients;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-lg font-bold">Pacientes de {doctor.fullName}</h3><p className="text-xs text-slate-500">{doctor.email}</p><p className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${full ? "bg-red-100 text-red-700" : "bg-teal-50 text-teal-800"}`}>{assigned.length}/{maxPatients} pacientes{full ? " · cupo lleno" : ""}</p></div>
          <button onClick={onClose} className="rounded-lg border px-3 py-1 text-sm font-semibold">Cerrar</button>
        </div>

        <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
          <p className="text-sm font-semibold text-slate-800">Asignar paciente a este médico</p>
          {!active ? <p className="mt-1 text-xs text-amber-700">Solo se pueden asignar pacientes a médicos con estado Activo.</p>
          : full ? <p className="mt-1 text-xs text-red-700">Este médico completó su cupo de {maxPatients} pacientes. Quita un paciente de su lista para poder asignarle otro.</p>
          : (
            <div className="mt-2 flex flex-wrap gap-2">
              <select value={toAssign} onChange={(e) => setToAssign(e.target.value)} className="min-w-0 flex-1 rounded-xl border p-2 text-sm">
                <option value="">Selecciona un paciente...</option>
                {candidates.map((p) => <option key={p.userId} value={p.userId}>{p.fullName} ({p.email}){p.assignedDoctorName ? ` · actual: ${p.assignedDoctorName}` : ""}</option>)}
              </select>
              <button disabled={!toAssign || busy} onClick={() => void setDoctor(Number(toAssign), doctor.id, "Paciente asignado al médico.")} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Asignar</button>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500">Si el paciente ya tenía otro médico, se reemplaza por este.</p>
        </div>

        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar paciente por nombre, correo o medicamento..." className="mt-4 w-full rounded-xl border p-2 text-sm" />
        <div className="mt-3 space-y-3">
          {visible.map((p) => (
            <div key={p.patientId} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><b>{p.fullName}</b><p className="text-xs text-slate-500">{p.email} · ID {p.patientId}</p>{p.conditions && <p className="mt-1 text-xs text-slate-600">Condiciones: {p.conditions}</p>}</div>
                <button disabled={busy} onClick={() => { if (window.confirm(`¿Quitar a ${p.fullName} de ${doctor.fullName}?`)) void setDoctor(p.patientId, null, "Asignación eliminada."); }} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700">Quitar</button>
              </div>
              <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tratamiento</p>
              <TreatmentList treatments={p.treatments} medications={p.medications} />
            </div>
          ))}
          {!visible.length && <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">{assigned.length ? "Ningún paciente coincide con la búsqueda." : "Este médico aún no tiene pacientes asignados."}</p>}
        </div>
      </div>
    </div>
  );
}

function DoctorsTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<UserLite[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState<{ d: UserLite; readOnly: boolean } | null>(null);
  const [patientsOf, setPatientsOf] = useState<UserLite | null>(null);
  const [loadById, setLoadById] = useState<Record<number, DoctorLoad>>({});

  const load = useCallback(async () => {
    try {
      const q = new URLSearchParams({ role: "DOCTOR" });
      if (search) q.set("search", search);
      if (status) q.set("status", status);
      const [users, capacity] = await Promise.all([
        fetchApi<UserLite[]>(`/api/admin/users?${q}`),
        fetchApi<DoctorLoad[]>("/api/admin/doctors/load"),
      ]);
      setRows(users);
      setLoadById(Object.fromEntries(capacity.map((c) => [c.id, c])));
    } catch (e) { n.fail(e); }
  }, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps
  const maxPatients = Object.values(loadById)[0]?.maxPatients ?? 5;
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields: FieldDef[] = [
    { key: "fullName", label: "Nombre completo" }, { key: "email", label: "Correo", type: "email" },
    { key: "status", label: "Estado", type: "select", options: STATUS_OPTIONS },
  ];

  async function save(d: UserLite, v: Values) {
    try {
      await fetchApi(`/api/admin/users/${d.id}`, { method: "PUT", body: JSON.stringify({ fullName: v.fullName, email: v.email, role: d.role, status: v.status }) });
      n.ok("Médico actualizado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function remove(d: UserLite) {
    if (!window.confirm(`¿Eliminar al médico ${d.fullName}?`)) return;
    try { await fetchApi(`/api/admin/users/${d.id}`, { method: "DELETE" }); n.ok("Médico eliminado."); await load(); } catch (e) { n.fail(e); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={() => void load()} extra={
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border p-2 text-sm">
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>} />
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-xs text-slate-500"><th className="p-3">Médico</th><th>Estado</th><th>Pacientes</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map((d) => {
          const cap = loadById[d.id];
          return (
          <tr key={d.id} className="border-b last:border-0">
            <td className="p-3"><b>{d.fullName}</b><div className="text-xs text-slate-500">{d.email} · ID {d.id}</div></td>
            <td>{d.status}</td>
            <td>{cap ? <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cap.full ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}>{cap.assignedPatients}/{cap.maxPatients}{cap.full ? " · lleno" : ""}</span> : "—"}</td>
            <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setPatientsOf(d)}>Pacientes</Btn><Btn onClick={() => setModal({ d, readOnly: true })}>Ver</Btn><Btn onClick={() => setModal({ d, readOnly: false })}>Editar</Btn><Btn danger onClick={() => void remove(d)}>Eliminar</Btn></td>
          </tr>);
        })}
          {!rows.length && <tr><td colSpan={4} className="p-4 text-slate-500">No hay médicos.</td></tr>}
        </tbody></table></div>
      {patientsOf && <DoctorPatientsModal doctor={patientsOf} maxPatients={loadById[patientsOf.id]?.maxPatients ?? maxPatients} n={n} onClose={() => { setPatientsOf(null); void load(); }} />}
      {modal && <FormModal title={modal.readOnly ? `Médico: ${modal.d.fullName}` : `Editar médico: ${modal.d.fullName}`} fields={fields} readOnly={modal.readOnly}
        initial={{ fullName: s(modal.d.fullName), email: s(modal.d.email), status: s(modal.d.status) }}
        onSave={(v) => save(modal.d, v)} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Familiares                                                          */
/* ------------------------------------------------------------------ */
function FamiliesTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ f: Family; readOnly: boolean } | null>(null);

  const load = useCallback(async () => {
    try { setRows(await fetchApi<Family[]>(`/api/admin/families?search=${encodeURIComponent(search)}`)); } catch (e) { n.fail(e); }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields: FieldDef[] = [
    { key: "fullName", label: "Nombre completo" }, { key: "email", label: "Correo", type: "email" },
    { key: "status", label: "Estado", type: "select", options: STATUS_OPTIONS }, { key: "phone", label: "Teléfono" },
  ];

  async function save(f: Family, v: Values) {
    try {
      await fetchApi(`/api/admin/families/${f.userId}`, { method: "PUT", body: JSON.stringify({ fullName: v.fullName, email: v.email, status: v.status, phone: txt(v.phone) }) });
      n.ok("Familiar actualizado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function remove(f: Family) {
    if (!window.confirm(`¿Eliminar al familiar ${f.fullName}? Se borrarán también sus vínculos.`)) return;
    try { await fetchApi(`/api/admin/users/${f.userId}`, { method: "DELETE" }); n.ok("Familiar eliminado."); await load(); } catch (e) { n.fail(e); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={() => void load()} />
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-xs text-slate-500"><th className="p-3">Familiar</th><th>Estado</th><th>Teléfono</th><th>Paciente vinculado</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map((f) => (
          <tr key={f.userId} className="border-b last:border-0">
            <td className="p-3"><b>{f.fullName}</b><div className="text-xs text-slate-500">{f.email} · ID {f.userId}</div></td>
            <td>{f.status}</td><td>{f.phone || "—"}</td>
            <td className="text-xs">{f.patients.filter((p) => p.active).map((p) => `${p.patientName}${p.relationship ? ` (${p.relationship})` : ""}`).join(", ") || "—"}</td>
            <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setModal({ f, readOnly: true })}>Ver</Btn><Btn onClick={() => setModal({ f, readOnly: false })}>Editar</Btn><Btn danger onClick={() => void remove(f)}>Eliminar</Btn></td>
          </tr>))}
          {!rows.length && <tr><td colSpan={5} className="p-4 text-slate-500">No hay familiares.</td></tr>}
        </tbody></table></div>
      {modal && <FormModal title={modal.readOnly ? `Familiar: ${modal.f.fullName}` : `Editar familiar: ${modal.f.fullName}`} fields={fields} readOnly={modal.readOnly}
        initial={{ fullName: s(modal.f.fullName), email: s(modal.f.email), status: s(modal.f.status), phone: s(modal.f.phone) }}
        onSave={(v) => save(modal.f, v)} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vínculos familiar ↔ paciente                                        */
/* ------------------------------------------------------------------ */
function LinksTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<LinkRow[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit" | "view"; l: LinkRow } | null>(null);

  const load = useCallback(async () => {
    try {
      const [l, p, f] = await Promise.all([fetchApi<LinkRow[]>("/api/admin/links"), fetchApi<Patient[]>("/api/admin/patients"), fetchApi<Family[]>("/api/admin/families")]);
      setRows(l); setPatients(p); setFamilies(f);
    } catch (e) { n.fail(e); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);

  const createFields: FieldDef[] = [
    { key: "patientId", label: "Paciente", type: "select", options: [{ value: "", label: "Selecciona..." }, ...patients.map((p) => ({ value: String(p.userId), label: `${p.fullName} (ID ${p.userId})` }))] },
    { key: "familyId", label: "Familiar", type: "select", options: [{ value: "", label: "Selecciona..." }, ...families.map((f) => ({ value: String(f.userId), label: `${f.fullName} (ID ${f.userId})` }))] },
    { key: "relationship", label: "Parentesco" }, { key: "relationshipDetails", label: "Detalles", type: "textarea" },
  ];
  const editFields: FieldDef[] = [
    { key: "patientName", label: "Paciente", readOnly: true }, { key: "familyName", label: "Familiar", readOnly: true },
    { key: "relationship", label: "Parentesco" },
    { key: "active", label: "Estado del vínculo", type: "select", options: [{ value: "true", label: "Activo" }, { value: "false", label: "Revocado" }] },
  ];

  async function create(v: Values) {
    try {
      if (!v.patientId || !v.familyId) throw new Error("Selecciona un paciente y un familiar.");
      await fetchApi("/api/admin/links", { method: "POST", body: JSON.stringify({ patientId: Number(v.patientId), familyId: Number(v.familyId), relationship: txt(v.relationship), relationshipDetails: txt(v.relationshipDetails) }) });
      n.ok("Vínculo creado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function update(l: LinkRow, v: Values) {
    try {
      await fetchApi(`/api/admin/links/${l.id}`, { method: "PUT", body: JSON.stringify({ relationship: v.relationship, active: v.active === "true" }) });
      n.ok("Vínculo actualizado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function remove(l: LinkRow) {
    if (!window.confirm(`¿Eliminar el vínculo entre ${l.patientName} y ${l.familyName}?`)) return;
    try { await fetchApi(`/api/admin/links/${l.id}`, { method: "DELETE" }); n.ok("Vínculo eliminado."); await load(); } catch (e) { n.fail(e); }
  }
  const [assigning, setAssigning] = useState<LinkRow | null>(null);

  const initialOf = (l: LinkRow): Values => ({ patientName: l.patientName, familyName: l.familyName, relationship: s(l.relationship), active: String(l.active) });

  return (
    <div className="space-y-4">
      <div><button onClick={() => setModal({ mode: "create" })} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white">+ Nuevo vínculo</button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-xs text-slate-500"><th className="p-3">Paciente</th><th>Familiar</th><th>Parentesco</th><th>Médico</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map((l) => (
          <tr key={l.id} className="border-b last:border-0">
            <td className="p-3"><b>{l.patientName}</b><div className="text-xs text-slate-500">ID {l.patientId}</div></td>
            <td><b>{l.familyName}</b><div className="text-xs text-slate-500">ID {l.familyId}</div></td>
            <td>{l.relationship || "—"}</td><td>{l.doctorName || "Sin asignar"}</td><td><Badge on={l.active} no="Revocado" /></td>
            <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setModal({ mode: "view", l })}>Ver</Btn><Btn onClick={() => setModal({ mode: "edit", l })}>Editar</Btn><Btn onClick={() => setAssigning(l)}>Médico</Btn><Btn danger onClick={() => void remove(l)}>Eliminar</Btn></td>
          </tr>))}
          {!rows.length && <tr><td colSpan={6} className="p-4 text-slate-500">No hay vínculos.</td></tr>}
        </tbody></table></div>
      {modal?.mode === "create" && <FormModal title="Nuevo vínculo familiar" fields={createFields} initial={{ patientId: "", familyId: "", relationship: "", relationshipDetails: "" }} onSave={create} onClose={() => setModal(null)} />}
      {modal && modal.mode !== "create" && <FormModal title={modal.mode === "view" ? "Detalle del vínculo" : "Editar vínculo"} fields={editFields} readOnly={modal.mode === "view"} initial={initialOf(modal.l)} onSave={(v) => update(modal.l, v)} onClose={() => setModal(null)} />}
      {assigning && <AssignDoctorDialog patientId={assigning.patientId} patientName={assigning.patientName} currentDoctorId={assigning.doctorId} onClose={() => setAssigning(null)} onDone={(m) => { n.ok(m); void load(); }} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Recetas                                                             */
/* ------------------------------------------------------------------ */
function RecipesTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<Recipe[]>([]);
  const [modal, setModal] = useState<{ kind: "recipe"; r: Recipe } | { kind: "item"; item: RecipeItem; readOnly: boolean } | null>(null);

  const load = useCallback(async () => {
    try { setRows(await fetchApi<Recipe[]>("/api/admin/recipes")); } catch (e) { n.fail(e); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);

  const recipeFields: FieldDef[] = [{ key: "status", label: "Estado de la receta" }];
  const itemFields: FieldDef[] = [
    { key: "medicine", label: "Medicamento" }, { key: "indicatedDose", label: "Dosis indicada" },
    { key: "unitsPerDay", label: "Unidades por día", type: "number" }, { key: "consumptionUnit", label: "Unidad de consumo" },
    { key: "treatmentDays", label: "Días de tratamiento", type: "number" }, { key: "indication", label: "Indicación", type: "textarea" },
  ];

  async function saveRecipe(r: Recipe, v: Values) {
    try { await fetchApi(`/api/admin/recipes/${r.id}`, { method: "PUT", body: JSON.stringify({ status: v.status }) }); n.ok("Receta actualizada."); await load(); } catch (e) { n.fail(e); throw e; }
  }
  async function saveItem(item: RecipeItem, v: Values) {
    try {
      await fetchApi(`/api/admin/recipe-items/${item.id}`, { method: "PUT", body: JSON.stringify({ medicine: txt(v.medicine), indicatedDose: txt(v.indicatedDose), unitsPerDay: num(v.unitsPerDay), consumptionUnit: txt(v.consumptionUnit), indication: txt(v.indication), treatmentDays: num(v.treatmentDays) }) });
      n.ok("Medicamento de la receta actualizado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function removeRecipe(r: Recipe) {
    if (!window.confirm(`¿Eliminar la receta #${r.id} completa?`)) return;
    try { await fetchApi(`/api/admin/recipes/${r.id}`, { method: "DELETE" }); n.ok("Receta eliminada."); await load(); } catch (e) { n.fail(e); }
  }
  async function removeItem(i: RecipeItem) {
    if (!window.confirm(`¿Quitar ${i.medicine || "este medicamento"} de la receta?`)) return;
    try { await fetchApi(`/api/admin/recipe-items/${i.id}`, { method: "DELETE" }); n.ok("Medicamento eliminado de la receta."); await load(); } catch (e) { n.fail(e); }
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><b>Receta #{r.id}</b> · {r.patientName || `Paciente ${r.patientId}`}<div className="text-xs text-slate-500">{r.uploadedAt || "Sin fecha"} · {r.status || "Sin estado"}</div></div>
            <div className="space-x-1"><Btn onClick={() => setModal({ kind: "recipe", r })}>Editar estado</Btn><Btn danger onClick={() => void removeRecipe(r)}>Eliminar receta</Btn></div>
          </div>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm">
            <thead><tr className="border-b text-xs text-slate-500"><th className="py-2">Medicamento</th><th>Dosis</th><th>Unid./día</th><th>Días</th><th>Acciones</th></tr></thead>
            <tbody>{r.items.map((i) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="py-2"><b>{i.medicine}</b><div className="text-xs text-slate-500">{i.indication}</div></td>
                <td>{i.indicatedDose || "—"}</td><td>{i.unitsPerDay ?? "—"} {i.consumptionUnit}</td><td>{i.treatmentDays ?? "—"}</td>
                <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setModal({ kind: "item", item: i, readOnly: true })}>Ver</Btn><Btn onClick={() => setModal({ kind: "item", item: i, readOnly: false })}>Editar</Btn><Btn danger onClick={() => void removeItem(i)}>Eliminar</Btn></td>
              </tr>))}
              {!r.items.length && <tr><td colSpan={5} className="py-2 text-slate-500">Sin medicamentos.</td></tr>}
            </tbody></table></div>
        </div>))}
      {!rows.length && <p className="text-sm text-slate-500">No hay recetas registradas.</p>}
      {modal?.kind === "recipe" && <FormModal title={`Receta #${modal.r.id}`} fields={recipeFields} initial={{ status: s(modal.r.status) }} onSave={(v) => saveRecipe(modal.r, v)} onClose={() => setModal(null)} />}
      {modal?.kind === "item" && <FormModal title={modal.readOnly ? "Detalle del medicamento" : "Editar medicamento de la receta"} fields={itemFields} readOnly={modal.readOnly}
        initial={{ medicine: s(modal.item.medicine), indicatedDose: s(modal.item.indicatedDose), unitsPerDay: s(modal.item.unitsPerDay), consumptionUnit: s(modal.item.consumptionUnit), treatmentDays: s(modal.item.treatmentDays), indication: s(modal.item.indication) }}
        onSave={(v) => saveItem(modal.item, v)} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Catálogo de medicamentos                                            */
/* ------------------------------------------------------------------ */
function MedicationsTab({ n }: { n: Notify }) {
  const [rows, setRows] = useState<Medication[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ m: Medication | null; readOnly: boolean } | null>(null);

  const load = useCallback(async () => {
    try { setRows(await fetchApi<Medication[]>(`/api/admin/medications?search=${encodeURIComponent(search)}`)); } catch (e) { n.fail(e); }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields = (editing: boolean): FieldDef[] => [
    { key: "name", label: "Nombre del medicamento", readOnly: editing, full: true },
    { key: "activeIngredient", label: "Principio activo" }, { key: "purpose", label: "Para qué sirve" },
    { key: "dosageForm", label: "Forma farmacéutica" }, { key: "route", label: "Vía" },
    { key: "dosageAndAdministration", label: "Dosis y administración", type: "textarea" },
    { key: "warnings", label: "Advertencias", type: "textarea" },
    { key: "contraindications", label: "Contraindicaciones", type: "textarea" },
    { key: "drugInteractions", label: "Interacciones", type: "textarea" },
  ];
  const toValues = (m: Medication | null): Values => ({ name: s(m?.name), activeIngredient: s(m?.activeIngredient), purpose: s(m?.purpose), dosageForm: s(m?.dosageForm), route: s(m?.route), dosageAndAdministration: s(m?.dosageAndAdministration), warnings: s(m?.warnings), contraindications: s(m?.contraindications), drugInteractions: s(m?.drugInteractions) });

  async function save(current: Medication | null, v: Values) {
    const body = JSON.stringify({ name: v.name, activeIngredient: v.activeIngredient, purpose: v.purpose, dosageForm: v.dosageForm, route: v.route, dosageAndAdministration: v.dosageAndAdministration, warnings: v.warnings, contraindications: v.contraindications, drugInteractions: v.drugInteractions });
    try {
      if (current) await fetchApi(`/api/admin/medications?name=${encodeURIComponent(current.name)}`, { method: "PUT", body });
      else await fetchApi("/api/admin/medications", { method: "POST", body });
      n.ok(current ? "Medicamento actualizado." : "Medicamento creado."); await load();
    } catch (e) { n.fail(e); throw e; }
  }
  async function remove(m: Medication) {
    if (!window.confirm(`¿Eliminar "${m.name}" del catálogo (con sus presentaciones y reglas de dosis)?`)) return;
    try { await fetchApi(`/api/admin/medications?name=${encodeURIComponent(m.name)}`, { method: "DELETE" }); n.ok("Medicamento eliminado."); await load(); } catch (e) { n.fail(e); }
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} onSearch={() => void load()} extra={<button onClick={() => setModal({ m: null, readOnly: false })} className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-700">+ Nuevo</button>} />
      <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead><tr className="border-b text-xs text-slate-500"><th className="p-3">Medicamento</th><th>Principio activo</th><th>Forma / vía</th><th>Acciones</th></tr></thead>
        <tbody>{rows.map((m) => (
          <tr key={m.name} className="border-b last:border-0">
            <td className="p-3"><b>{m.name}</b><div className="max-w-md truncate text-xs text-slate-500">{m.purpose}</div></td>
            <td>{m.activeIngredient || "—"}</td><td>{[m.dosageForm, m.route].filter(Boolean).join(" · ") || "—"}</td>
            <td className="space-x-1 whitespace-nowrap"><Btn onClick={() => setModal({ m, readOnly: true })}>Ver</Btn><Btn onClick={() => setModal({ m, readOnly: false })}>Editar</Btn><Btn danger onClick={() => void remove(m)}>Eliminar</Btn></td>
          </tr>))}
          {!rows.length && <tr><td colSpan={4} className="p-4 text-slate-500">No hay medicamentos.</td></tr>}
        </tbody></table></div>
      {modal && <FormModal title={modal.m ? (modal.readOnly ? modal.m.name : `Editar ${modal.m.name}`) : "Nuevo medicamento"} fields={fields(!!modal.m)} readOnly={modal.readOnly} initial={toValues(modal.m)} onSave={(v) => save(modal.m, v)} onClose={() => setModal(null)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contenedor con pestañas                                             */
/* ------------------------------------------------------------------ */
const TABS = [
  { id: "patients", label: "Pacientes" }, { id: "doctors", label: "Médicos" }, { id: "families", label: "Familiares" }, { id: "links", label: "Vínculos" },
  { id: "recipes", label: "Recetas" }, { id: "medications", label: "Medicamentos" },
] as const;

export default function AdminCrud({ refreshKey = 0, onChanged }: { refreshKey?: number; onChanged?: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("patients");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const notify: Notify = {
    ok: (m) => { setToast({ ok: true, text: m, id: Date.now() }); onChanged?.(); },
    fail: (e) => setToast({ ok: false, text: e instanceof Error ? e.message : "Ocurrió un error.", id: Date.now() }),
  };

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="font-bold">Gestión de datos (consultar, editar y eliminar)</h2>
      <p className="mt-1 text-sm text-slate-500">Pacientes, médicos, familiares, vínculos, recetas y catálogo de medicamentos.</p>
      <div className="mt-4 flex flex-wrap gap-2 border-b pb-3">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.id ? "bg-teal-700 text-white" : "border text-slate-600"}`}>{t.label}</button>
        ))}
      </div>
      <AdminToast toast={toast} onClose={closeToast} />
      <div className="mt-4" key={refreshKey}>
        {tab === "patients" && <PatientsTab n={notify} />}
        {tab === "doctors" && <DoctorsTab n={notify} />}
        {tab === "families" && <FamiliesTab n={notify} />}
        {tab === "links" && <LinksTab n={notify} />}
        {tab === "recipes" && <RecipesTab n={notify} />}
        {tab === "medications" && <MedicationsTab n={notify} />}
      </div>
    </section>
  );
}
