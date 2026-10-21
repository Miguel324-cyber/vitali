
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Appointment = {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  requestedDateTime: string | null;
  scheduledDateTime: string | null;
  reason: string;
  doctorNotes: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
};

function formatDate(value: string | null) {
  if (!value) return "No definida";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dates, setDates] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/api/appointments/doctor");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar las solicitudes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  async function decide(id: number, accepted: boolean) {
    setError("");
    setMessage("");

    if (
      accepted &&
      (!dates[id] || new Date(dates[id]).getTime() <= Date.now())
    ) {
      setError("Para confirmar, selecciona una fecha y hora futuras.");
      return;
    }

    const confirmation = accepted
      ? "¿Confirmas la cita para la fecha y hora indicadas?"
      : "¿Deseas rechazar esta solicitud?";

    if (!window.confirm(confirmation)) return;

    setBusyId(id);

    try {
      await fetchApi(`/api/appointments/${id}/decision`, {
        method: "PATCH",
        body: JSON.stringify({
          accepted,
          scheduledDateTime: accepted ? dates[id] : null,
          doctorNotes: notes[id]?.trim() || null,
        }),
      });

      setMessage(
        accepted
          ? "Cita confirmada correctamente."
          : "Solicitud rechazada."
      );

      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible procesar la solicitud."
      );
    } finally {
      setBusyId(null);
    }
  }

  const pending = appointments.filter((item) => item.status === "PENDING");
  const others = appointments.filter((item) => item.status !== "PENDING");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        href="/dashboard/doctor"
        className="text-sm font-medium text-teal-700 hover:underline"
      >
        ← Volver al panel
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Solicitudes de citas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisa las solicitudes de tus pacientes y gestiona su estado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAppointments()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {loading ? (
        <p className="rounded-xl bg-slate-50 p-6 text-slate-600">
          Cargando solicitudes...
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Pendientes ({pending.length})
            </h2>

            {pending.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <CalendarCheck className="mx-auto mb-3 text-slate-400" size={32} />
                <p className="font-semibold text-slate-800">
                  No tienes solicitudes pendientes
                </p>
              </div>
            ) : (
              pending.map((item) => (
                <article
                  key={item.id}
                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {item.patientName}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Solicitud #{item.id}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      Pendiente
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Horario propuesto</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(item.requestedDateTime)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500">Motivo</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                      {item.reason}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor={`date-${item.id}`}
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Fecha y hora definitivas
                    </label>
                    <input
                      id={`date-${item.id}`}
                      type="datetime-local"
                      min={new Date(
                        Date.now() - new Date().getTimezoneOffset() * 60000
                      ).toISOString().slice(0, 16)}
                      value={dates[item.id] || ""}
                      onChange={(e) =>
                        setDates((previous) => ({
                          ...previous,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`notes-${item.id}`}
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Observaciones para el paciente (opcional)
                    </label>
                    <textarea
                      id={`notes-${item.id}`}
                      rows={2}
                      maxLength={2000}
                      value={notes[item.id] || ""}
                      onChange={(e) =>
                        setNotes((previous) => ({
                          ...previous,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
                      placeholder="Escribe las indicaciones relacionadas con la cita."
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void decide(item.id, true)}
                      className="rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      {busyId === item.id ? "Procesando..." : "Confirmar cita"}
                    </button>

                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void decide(item.id, false)}
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Rechazar solicitud
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              Historial ({others.length})
            </h2>

            {others.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-slate-800">
                    {item.patientName}
                  </p>
                  <span className="text-sm text-slate-500">
                    {item.status === "CONFIRMED"
                      ? "Confirmada"
                      : item.status === "REJECTED"
                        ? "Rechazada"
                        : item.status === "CANCELLED"
                          ? "Cancelada"
                          : "Completada"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {item.reason}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Fecha: {formatDate(item.scheduledDateTime)}
                </p>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
