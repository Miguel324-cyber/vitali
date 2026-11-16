"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Notification = { id: number; mensaje_duda: string; respuesta_medico: string; fecha_respuesta: string | null; nombre_medico: string | null };

const POLL_MS = 30_000;

/** Campana del paciente: avisa cuando el médico responde una duda. */
export default function PatientNotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);
  const seen = useRef<Set<number> | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (typeof window === "undefined" || localStorage.getItem("userRole") !== "PATIENT") return;
    try {
      const data = await fetchApi<Notification[]>("/api/consultas/notificaciones");
      // Aviso emergente solo para respuestas que llegaron mientras la página estaba abierta.
      if (seen.current) {
        const fresh = data.find((n) => !seen.current!.has(n.id));
        if (fresh) setToast(fresh);
      }
      seen.current = new Set(data.map((n) => n.id));
      setItems(data);
    } catch { /* sin conexión: se reintenta en el siguiente ciclo */ }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    const onChange = () => void load();
    window.addEventListener("patient-notifications-changed", onChange);
    window.addEventListener("focus", onChange);
    return () => { window.clearInterval(timer); window.removeEventListener("patient-notifications-changed", onChange); window.removeEventListener("focus", onChange); };
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const count = items.length;

  return (
    <div ref={box} className="relative">
      <button type="button" aria-label={count ? `Notificaciones: ${count} nuevas` : "Notificaciones"} onClick={() => setOpen((o) => !o)} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50">
        <Bell size={18} />
        {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{count > 9 ? "9+" : count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3"><p className="text-sm font-bold text-slate-900">Notificaciones</p></div>
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? <p className="px-4 py-6 text-center text-sm text-slate-500">No tienes notificaciones nuevas.</p>
              : items.map((n) => (
                <Link key={n.id} href="/dashboard/patient/consultations" onClick={() => setOpen(false)} className="flex gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50">
                  <MessageCircle size={18} className="mt-0.5 shrink-0 text-teal-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{n.nombre_medico || "Tu médico"} respondió tu duda</p>
                    <p className="truncate text-xs text-slate-500">“{n.mensaje_duda}”</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-700">{n.respuesta_medico}</p>
                  </div>
                </Link>
              ))}
          </div>
          <Link href="/dashboard/patient/consultations" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-sm font-semibold text-teal-700 hover:bg-teal-50">Ver todas mis consultas</Link>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-teal-200 bg-white p-4 shadow-xl">
          <p className="flex items-center gap-2 text-sm font-bold text-teal-800"><MessageCircle size={16} /> {toast.nombre_medico || "Tu médico"} respondió tu duda</p>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{toast.respuesta_medico}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setToast(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500">Cerrar</button>
            <Link href="/dashboard/patient/consultations" onClick={() => setToast(null)} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white">Ver respuesta</Link>
          </div>
        </div>
      )}
    </div>
  );
}
