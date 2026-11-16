"use client";
import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

/** Médico con su cupo de pacientes (GET /api/admin/doctors/load). */
export type DoctorLoad = { id: number; fullName: string; email: string; status: string; assignedPatients: number; maxPatients: number; full: boolean };
type Doctor = DoctorLoad;
type PatientCheck = { userId: number; fullName: string; assignedDoctorId: number | null; assignedDoctorName: string | null };

/**
 * Asigna o cambia el médico de un paciente eligiéndolo de la lista de médicos
 * activos (sin escribir IDs) y confirma leyendo de nuevo el paciente del servidor.
 */
export default function AssignDoctorDialog({ patientId, patientName, currentDoctorId, onClose, onDone }: {
  patientId: number; patientName: string; currentDoctorId: number | null;
  onClose: () => void; onDone: (message: string) => void;
}) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState(currentDoctorId ? String(currentDoctorId) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApi<Doctor[]>("/api/admin/doctors/load").then((d) => setDoctors(d.filter((x) => x.status === "ACTIVE"))).catch((e) => setError(e instanceof Error ? e.message : "No se pudieron cargar los médicos."));
  }, []);

  async function save() {
    setSaving(true); setError("");
    const target = doctorId ? Number(doctorId) : null;
    try {
      await fetchApi(`/api/admin/patients/${patientId}/doctor`, { method: "PATCH", body: JSON.stringify({ doctorId: target }) });
      // Confirmación real: se vuelve a leer el paciente desde el servidor.
      const check = await fetchApi<PatientCheck>(`/api/admin/patients/${patientId}`);
      if ((check.assignedDoctorId ?? null) !== target) throw new Error("El servidor no reflejó el cambio. Intenta de nuevo.");
      onDone(target ? `Listo: ${check.fullName} ahora tiene como médico a ${check.assignedDoctorName}.` : `Listo: ${check.fullName} quedó sin médico asignado.`);
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo asignar el médico."); }
    finally { setSaving(false); }
  }

  const current = doctors.find((d) => d.id === currentDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">Asignar médico</h3>
        <p className="mt-1 text-sm text-slate-500">Paciente: <b className="text-slate-800">{patientName}</b> (ID {patientId})</p>
        <p className="mt-1 text-sm text-slate-500">Médico actual: <b className="text-slate-800">{current ? current.fullName : currentDoctorId ? `ID ${currentDoctorId}` : "Sin asignar"}</b></p>
        <label className="mt-4 block text-sm font-medium">Nuevo médico
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-sm">
            <option value="">Sin médico asignado</option>
            {doctors.map((d) => {
              const blocked = d.full && d.id !== currentDoctorId;
              return <option key={d.id} value={d.id} disabled={blocked}>{d.fullName} · {d.assignedPatients}/{d.maxPatients} pacientes{blocked ? " — cupo lleno" : ""}</option>;
            })}
          </select>
        </label>
        {doctors.length > 0 && <p className="mt-2 text-xs text-slate-500">Cada médico puede tener máximo {doctors[0].maxPatients} pacientes. Los que completaron su cupo no se pueden elegir.</p>}
        {!doctors.length && !error && <p className="mt-2 text-xs text-amber-700">No hay médicos activos. Aprueba un médico antes de asignarlo.</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancelar</button>
          <button disabled={saving || doctorId === (currentDoctorId ? String(currentDoctorId) : "")} onClick={() => void save()} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Confirmar"}</button>
        </div>
      </div>
    </div>
  );
}
