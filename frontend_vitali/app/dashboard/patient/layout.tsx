
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
  { label: "Mi perfil", href: "/dashboard/patient/profile", icon: UserRound },
  { label: "Tratamientos", href: "/dashboard/patient/treatments", icon: ClipboardList },
  { label: "Recordatorios", href: "/dashboard/patient/reminders", icon: CalendarDays },
  { label: "Alertas", href: "/dashboard/patient/alerts", icon: Bell },
];

export default function PatientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link
          href="/patient/dashboard"
          className="flex h-20 items-center gap-3 border-b border-slate-100 px-6"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white">
            <HeartPulse size={23} />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-slate-900">
              viatli
            </p>
            <p className="text-xs text-slate-500">Tu salud, organizada</p>
          </div>
        </Link>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Menú principal
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  <span>{label}</span>
                  {active && (
                    <ChevronRight className="ml-auto" size={16} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-teal-700">
              <ShieldCheck size={19} />
              <span className="text-sm font-semibold">Tu privacidad importa</span>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Tus datos de salud deben estar protegidos y accesibles solo para
              las personas autorizadas.
            </p>
          </div>

          <Link
            href="/Dashboard/patient"
            className="mt-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50"
          >
            <LogOut size={18} />
            Volver al inicio
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <HeartPulse className="text-teal-600" size={24} />
            <span className="font-bold text-slate-900">viatli</span>
          </div>

          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <Activity size={17} className="text-teal-600" />
            Espacio del paciente
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              aria-label="Notificaciones"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
              onClick={() => window.location.assign("/patient/alerts")}
            >
              <Bell size={18} />
            </button>
            
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
