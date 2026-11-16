"use client";
import { useCallback, useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import AdminCrud from "./AdminCrud";
import AssignDoctorDialog from "./AssignDoctorDialog";
import AdminToast, { type ToastMessage } from "./AdminToast";

type LinkRow = { id: number; patientId: number; patientName: string; doctorId: number | null; doctorName: string | null; familyId: number; familyName: string; active: boolean; relationship: string | null };
type PendingDoctor = { userId: number; fullName: string; email: string; professionalRegistration: string; specialty: string; documentType: string; documentNumber: string; phone: string; university: string; graduationYear: number | null; yearsExperience: number | null; consultationMode: string; professionalBio: string | null; status: string };

export default function AdminPage() {
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [assigning, setAssigning] = useState<LinkRow | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [crudKey, setCrudKey] = useState(0);

  const notify = useCallback((ok: boolean, text: string) => setToast({ ok, text, id: Date.now() }), []);
  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    try {
      const [l, d] = await Promise.all([fetchApi<LinkRow[]>("/api/admin/links"), fetchApi<PendingDoctor[]>("/api/admin/doctors/pending")]);
      setLinks(l); setPendingDoctors(d);
    } catch (e) { notify(false, e instanceof Error ? e.message : "No se pudo cargar el panel."); }
  }, [notify]);

  useEffect(() => {
    if (localStorage.getItem("userRole") !== "ADMIN") { window.location.href = "/login"; return; }
    void load();
  }, [load]);

  async function reviewDoctor(userId: number, action: "approve" | "reject") {
    try {
      await fetchApi(`/api/admin/doctors/${userId}/${action}`, { method: "PATCH" });
      notify(true, action === "approve" ? "Médico aprobado correctamente." : "Solicitud médica rechazada.");
      await load(); setCrudKey((k) => k + 1);
    } catch (e) { notify(false, e instanceof Error ? e.message : "No se pudo procesar la solicitud médica."); }
  }

  /** Tras un cambio en la sección de abajo, recarga los vínculos de arriba. */
  const onCrudChanged = useCallback(() => { void load(); }, [load]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600" /><div className="p-6"><h1 className="text-2xl font-bold">Panel administrativo</h1><p className="mt-1 text-sm text-slate-500">Usuarios, vínculos y gestión completa de las cuentas.</p></div></header>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-bold">Solicitudes de médicos pendientes</h2>
        <div className="mt-4 space-y-3">
          {pendingDoctors.length ? pendingDoctors.map((d) => (
            <div key={d.userId} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
              <div className="grid gap-2 md:grid-cols-3">
                <div><p className="text-xs text-slate-500">Médico</p><b>{d.fullName}</b><p className="text-xs text-slate-500">{d.email}</p></div>
                <div><p className="text-xs text-slate-500">Especialidad</p><b>{d.specialty}</b><p className="text-xs text-slate-500">Registro: {d.professionalRegistration}</p></div>
                <div><p className="text-xs text-slate-500">Universidad / experiencia</p><b>{d.university}</b><p className="text-xs text-slate-500">{d.yearsExperience ?? 0} años de experiencia</p></div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => void reviewDoctor(d.userId, "approve")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Aprobar</button>
                <button onClick={() => void reviewDoctor(d.userId, "reject")} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700">Rechazar</button>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No hay médicos pendientes de aprobación.</p>}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="font-bold">Vínculos médico · paciente · familiar</h2>
        <p className="mt-1 text-xs text-slate-500">Para asignar médico a pacientes sin familiar vinculado, usa Gestión de datos → Médicos → Pacientes, o Pacientes → Editar.</p>
        <div className="mt-4 space-y-3">
          {links.length ? links.map((l) => (
            <div key={l.id} className={`rounded-xl border p-4 transition-colors ${highlight === l.patientId ? "border-emerald-300 bg-emerald-50" : "border-slate-100"}`}>
              <div className="grid gap-2 md:grid-cols-3">
                <p><span className="text-xs text-slate-500">Paciente</span><br /><b>{l.patientName}</b> (ID {l.patientId})</p>
                <p><span className="text-xs text-slate-500">Médico</span><br /><b className={l.doctorName ? "" : "text-slate-400"}>{l.doctorName || "Sin asignar"}</b>{l.doctorId && <span className="text-xs text-slate-500"> (ID {l.doctorId})</span>}</p>
                <p><span className="text-xs text-slate-500">Familiar</span><br /><b>{l.familyName}</b>{l.relationship && <span className="text-xs"> · {l.relationship}</span>}</p>
              </div>
              <button onClick={() => setAssigning(l)} className="mt-3 rounded-lg border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700">Asignar / cambiar médico</button>
            </div>
          )) : <p className="text-sm text-slate-500">No hay vínculos registrados.</p>}
        </div>
      </section>

      <AdminCrud refreshKey={crudKey} onChanged={onCrudChanged} />

      {assigning && (
        <AssignDoctorDialog patientId={assigning.patientId} patientName={assigning.patientName} currentDoctorId={assigning.doctorId}
          onClose={() => setAssigning(null)}
          onDone={(m) => {
            notify(true, m);
            setHighlight(assigning.patientId);
            window.setTimeout(() => setHighlight(null), 4000);
            void load(); setCrudKey((k) => k + 1);
          }} />
      )}
      <AdminToast toast={toast} onClose={closeToast} />
    </main>
  );
}
