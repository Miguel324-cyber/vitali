"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Home } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { ROLE_HOME, ROLE_LABEL, type Role } from "@/lib/session";

/** Barra superior común: logo, botón Inicio del rol y menú de cuenta. */
export default function RoleTopBar({ role, extra }: { role: Role; extra?: React.ReactNode }) {
  const pathname = usePathname();
  const home = ROLE_HOME[role];
  const atHome = pathname === home;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href={home} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white"><HeartPulse size={20} /></span>
          <span className="hidden leading-tight sm:block"><span className="block font-bold text-slate-900">viatli</span><span className="block text-[11px] text-slate-500">Panel {ROLE_LABEL[role].toLowerCase()}</span></span>
        </Link>
        <Link href={home} aria-current={atHome ? "page" : undefined}
          className={`ml-1 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${atHome ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50"}`}>
          <Home size={17} /> Inicio
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {extra}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
