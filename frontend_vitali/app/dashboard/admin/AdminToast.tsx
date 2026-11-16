"use client";
import { useEffect } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

export type ToastMessage = { ok: boolean; text: string; id: number };

/** Aviso flotante: siempre visible aunque la acción ocurra abajo en la página. */
export default function AdminToast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, toast.ok ? 6000 : 10000);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div role={toast.ok ? "status" : "alert"} className={`fixed bottom-4 right-4 z-[60] flex w-96 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border p-4 text-sm shadow-xl ${toast.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-800"}`}>
      {toast.ok ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
      <p className="flex-1">{toast.text}</p>
      <button onClick={onClose} aria-label="Cerrar aviso"><X size={16} /></button>
    </div>
  );
}
