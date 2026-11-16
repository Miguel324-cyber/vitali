
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, Plus, RefreshCw, X } from "lucide-react";
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
  createdAt: string;
};

function formatDate(value: string | null) {
  if (!value) return "Sin fecha definida";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

const statusLabels: Record<Appointment["status"], string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const statusColors: Record<Appointment["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-slate-100 text-slate-600",
  COMPLETED: "bg-blue-100 text-blue-800",
};

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requestedDateTime, setRequestedDateTime] = useState("");
  const [reason, setReason] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchApi("/api/appointments/mine");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar tus citas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!reason.trim()) {
      setError("Escribe el motivo de la cita.");
      return;
    }

    if (
      requestedDateTime &&
      new Date(requestedDateTime).getTime() <= Date.now()
    ) {
      setError("Selecciona una fecha y hora futuras.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        requestedDateTime: requestedDateTime
          ? requestedDateTime
          : null,
        reason: reason.trim(),
      };

      await fetchApi("/api/appointments/request", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setReason("");
      setRequestedDateTime("");
      setShowForm(false);
      setMessage("Tu solicitud fue enviada al médico designado.");
      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible enviar la solicitud."
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelAppointment(id: number) {
    if (!window.confirm("¿Deseas cancelar esta solicitud?")) return;

    setError("");
    setMessage("");

    try {
      await fetchApi(`/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      setMessage("La solicitud fue cancelada.");
      await loadAppointments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cancelar la solicitud."
      );
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        href="/dashboard/patient"
        className="text-sm font-medium text-teal-700 hover:underline"
      >
        ← Volver al panel
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Mis citas médicas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Solicita una cita y consulta las respuestas de tu médico.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((value) => !value);
            setError("");
            setMessage("");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Cerrar formulario" : "Solicitar cita"}
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

      {showForm && (
        <form
          onSubmit={handleRequest}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="font-bold text-slate-900">
            Nueva solicitud de cita
          </h2>

          <div>
            <label
              htmlFor="requestedDateTime"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Fecha y hora que propones (opcional)
            </label>
            <input
              id="requestedDateTime"
              type="datetime-local"
              value={requestedDateTime}
              onChange={(e) => setRequestedDateTime(e.target.value)}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)}
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              El médico designado definirá la fecha definitiva al confirmar.
            </p>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Motivo de la consulta
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              required
              rows={4}
              placeholder="Describe brevemente el motivo de tu solicitud."
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Historial de solicitudes
          </h2>
          <button
            type="button"
            onClick={() => void loadAppointments()}
            disabled={loading}
            aria-label="Actualizar citas"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {loading ? (
          <p className="rounded-xl bg-slate-50 p-6 text-slate-600">
            Cargando tus citas...
          </p>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-semibold text-slate-800">
              Todavía no tienes solicitudes
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Cuando solicites una cita, aparecerá aquí.
            </p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">
                    Consulta médica
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Médico: {appointment.doctorName}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[appointment.status]}`}
                >
                  {statusLabels[appointment.status]}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Horario propuesto</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(appointment.requestedDateTime)}
                  </p>
                </div>
                <div className="rounded-xl bg-teal-50 p-3">
                  <p className="text-xs text-teal-700">Fecha definitiva</p>
                  <p className="mt-1 text-sm font-semibold text-teal-900">
                    {formatDate(appointment.scheduledDateTime)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">Motivo</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                  {appointment.reason}
                </p>
              </div>

              {appointment.doctorNotes && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xs font-semibold text-blue-800">
                    Observaciones del médico
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-blue-900">
                    {appointment.doctorNotes}
                  </p>
                </div>
              )}

              {appointment.status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => void cancelAppointment(appointment.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Cancelar solicitud
                </button>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
