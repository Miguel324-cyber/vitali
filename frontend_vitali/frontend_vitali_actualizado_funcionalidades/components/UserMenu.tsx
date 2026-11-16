"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Home, LogOut, UserRound } from "lucide-react";
import { clearSession, initials, readSession, ROLE_HOME, ROLE_LABEL, ROLE_PROFILE, type Session } from "@/lib/session";

// La sesión vive en localStorage: se lee como store externo para no romper la hidratación.
let cached: { raw: string; value: Session } | null = null;
function getSnapshot(): Session | null {
  const s = readSession();
  const raw = JSON.stringify(s);
  if (!cached || cached.raw !== raw) cached = { raw, value: s };
  return cached.value;
}
const subscribe = (cb: () => void) => { window.addEventListener("storage", cb); return () => window.removeEventListener("storage", cb); };

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** Menú de cuenta: nombre, rol, inicio, perfil y cerrar sesión. */
export default function UserMenu() {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  if (!session) return <div className="h-10 w-10" />;

  const name = session.name || session.email || "Usuario";
  const role = session.role;
  const home = role ? ROLE_HOME[role] : "/dashboard";
  const profile = role ? ROLE_PROFILE[role] : undefined;

  function logout() {
    clearSession();
    setOpen(false);
    router.replace("/login");
  }

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-slate-200 py-1 pl-1 pr-2 hover:bg-slate-50">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">{initials(name)}</span>
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:block">{name}</span>
        <ChevronDown size={15} className="text-slate-400" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">{initials(name)}</span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{name}</p>
              {session.email && <p className="truncate text-xs text-slate-500">{session.email}</p>}
              {role && <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">{ROLE_LABEL[role]}</span>}
            </div>
          </div>
          <div className="p-1.5">
            <Link role="menuitem" href={home} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Home size={16} /> Inicio</Link>
            {profile && <Link role="menuitem" href={profile} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><UserRound size={16} /> Mi perfil</Link>}
            <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"><LogOut size={16} /> Cerrar sesión</button>
          </div>
        </div>
      )}
    </div>
  );
}
