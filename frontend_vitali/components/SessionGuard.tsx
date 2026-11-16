"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { clearSession } from "@/lib/session";

/** Minutos sin actividad antes de cerrar la sesión (todos los roles). */
const IDLE_LIMIT_MS = 15 * 60_000;
/** Se avisa este tiempo antes del cierre. */
const WARNING_MS = 60_000;
/** Se renueva el token cuando le quedan menos de 5 minutos y hubo actividad reciente. */
const REFRESH_WHEN_LEFT_MS = 5 * 60_000;
const CHECK_EVERY_MS = 5_000;
const ACTIVITY_KEY = "lastActivity";
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;

export const SESSION_EXPIRED_FLAG = "sessionExpired";

function tokenExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch { return null; }
}

const lastActivity = () => Number(localStorage.getItem(ACTIVITY_KEY)) || Date.now();
export const markActivity = () => localStorage.setItem(ACTIVITY_KEY, String(Date.now()));

/**
 * Cierra la sesión tras 15 minutos de inactividad y renueva el token
 * (20 minutos de vida) mientras el usuario sigue usando la aplicación.
 * La actividad se comparte entre pestañas mediante localStorage.
 */
export default function SessionGuard() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const refreshing = useRef(false);
  const lastMark = useRef(0);

  const logout = useCallback((reason: "idle" | "expired") => {
    clearSession();
    localStorage.removeItem(ACTIVITY_KEY);
    sessionStorage.setItem(SESSION_EXPIRED_FLAG, reason);
    router.replace("/login");
  }, [router]);

  const refreshToken = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const data = await fetchApi<{ accessToken: string }>("/api/auth/refresh", { method: "POST" });
      if (data?.accessToken) localStorage.setItem("token", data.accessToken);
    } catch {
      logout("expired");
    } finally { refreshing.current = false; }
  }, [logout]);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    if (!localStorage.getItem(ACTIVITY_KEY)) markActivity();

    const onActivity = () => {
      // Escribir como máximo cada 10 s para no saturar localStorage con mousemove.
      const now = Date.now();
      if (now - lastMark.current > 10_000) { lastMark.current = now; markActivity(); }
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const check = () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const now = Date.now();
      const idle = now - lastActivity();
      const exp = tokenExpiry(token);

      if (idle >= IDLE_LIMIT_MS) { logout("idle"); return; }
      if (exp && exp <= now) { logout("expired"); return; }

      const left = IDLE_LIMIT_MS - idle;
      setSecondsLeft(left <= WARNING_MS ? Math.ceil(left / 1000) : null);

      if (exp && exp - now < REFRESH_WHEN_LEFT_MS && idle < REFRESH_WHEN_LEFT_MS) void refreshToken();
    };
    check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => {
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, [logout, refreshToken]);

  if (secondsLeft == null) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" role="alertdialog" aria-labelledby="session-warning-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700"><Clock size={24} /></div>
        <h2 id="session-warning-title" className="mt-4 text-lg font-bold text-slate-900">¿Sigues ahí?</h2>
        <p className="mt-2 text-sm text-slate-600">Por seguridad, tu sesión se cerrará en <b>{secondsLeft} s</b> por inactividad.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => logout("idle")} className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold">Cerrar sesión</button>
          <button autoFocus onClick={() => { markActivity(); setSecondsLeft(null); void refreshToken(); }} className="flex-1 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Seguir conectado</button>
        </div>
      </div>
    </div>
  );
}
