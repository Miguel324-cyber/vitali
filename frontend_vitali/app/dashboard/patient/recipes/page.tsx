
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  FileText,
  Pill,
  CalendarDays,
  Clock,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  Info,
  SlidersHorizontal,
  Activity,
} from "lucide-react";

type RecipeStatus = "TODAS" | "SEGURO" | "PENDIENTE" | "SOBREMEDICADO";

type Recipe = {
  id: number;
  fechaSubida: string;
  estadoAnalisis: string;
  medicamentos: {
    id: number;
    nombre: string;
    dosis: string;
  }[];
};

const STATUS_LABELS: Record<string, string> = {
  SEGURO: "Sin alertas detectadas",
  PENDIENTE: "Pendiente de análisis",
  SOBREMEDICADO: "Requiere revisión",
};

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SEGURO: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    PENDIENTE: "bg-amber-50 text-amber-700 ring-amber-200",
    SOBREMEDICADO: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        styles[status] ?? "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RecipeStatus>("TODAS");
  const [selectedRecipe, setSelectedRecipe] = useState<number | null>(null);

  /*
   * La lista comenzará vacía hasta conectar la API real.
   * No agregues datos médicos ficticios aquí.
   */
  const recipes: Recipe[] = [];

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");

    return recipes.filter((recipe) => {
      const matchesStatus =
        status === "TODAS" || recipe.estadoAnalisis === status;

      const matchesSearch =
        !query ||
        recipe.medicamentos.some((medication) =>
          medication.nombre.toLocaleLowerCase("es").includes(query)
        ) ||
        String(recipe.id).includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [recipes, search, status]);

  const totalMedications = recipes.reduce(
    (total, recipe) => total + recipe.medicamentos.length,
    0
  );

  const selected = recipes.find((recipe) => recipe.id === selectedRecipe);

  return (
    <main className="min-h-screen bg-[#f5f8fa] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Navegación */}
        <Link
          href="/dashboard/patient"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Volver al dashboard
        </Link>

        {/* Encabezado */}
        <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-teal-700">
              <Activity size={17} />
              MI SALUD
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Mis recetas
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Consulta tus fórmulas médicas, revisa los medicamentos
              prescritos y mantén organizada tu información de salud.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
            <ClipboardList size={29} />
          </div>
        </header>

        {/* Resumen */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            icon={<FileText size={22} />}
            label="Recetas registradas"
            value={String(recipes.length)}
            description="Total de fórmulas disponibles"
            color="teal"
          />

          <SummaryCard
            icon={<Pill size={22} />}
            label="Medicamentos"
            value={String(totalMedications)}
            description="Medicamentos en tus recetas"
            color="blue"
          />

          <SummaryCard
            icon={<ShieldCheck size={22} />}
            label="Requieren revisión"
            value={String(
              recipes.filter(
                (recipe) => recipe.estadoAnalisis === "SOBREMEDICADO"
              ).length
            )}
            description="Recetas con advertencias registradas"
            color="amber"
          />
        </section>

        {/* Historial */}
        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Historial de recetas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulta y busca las recetas registradas en el sistema.
              </p>
            </div>
          </div>

          {/* Búsqueda y filtros */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por medicamento o número de receta..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  aria-label="Buscar recetas"
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="shrink-0 text-slate-400"
                />
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as RecipeStatus)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-teal-500 sm:w-auto"
                  aria-label="Filtrar por estado"
                >
                  <option value="TODAS">Todos los estados</option>
                  <option value="SEGURO">Sin alertas detectadas</option>
                  <option value="PENDIENTE">Pendientes de análisis</option>
                  <option value="SOBREMEDICADO">Requieren revisión</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="mt-5">
            {filteredRecipes.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  {search || status !== "TODAS" ? (
                    <Search size={30} />
                  ) : (
                    <FileText size={30} />
                  )}
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {search || status !== "TODAS"
                    ? "No encontramos resultados"
                    : "Aún no tienes recetas registradas"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {search || status !== "TODAS"
                    ? "Prueba con otra búsqueda o cambia el filtro seleccionado."
                    : "Cuando una receta médica se registre en Viatli, aparecerá aquí con sus medicamentos, dosis, fecha y estado."}
                </p>

                {(search || status !== "TODAS") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatus("TODAS");
                    }}
                    className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredRecipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                          <FileText size={23} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            Receta #{recipe.id}
                          </h3>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                            <CalendarDays size={15} />
                            {formatDate(recipe.fechaSubida)}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={recipe.estadoAnalisis} />
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Medicamentos registrados
                      </p>

                      <div className="mt-3 space-y-3">
                        {recipe.medicamentos.slice(0, 3).map((medication) => (
                          <div
                            key={medication.id}
                            className="flex items-start gap-3"
                          >
                            <Pill
                              size={18}
                              className="mt-0.5 shrink-0 text-teal-700"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {medication.nombre}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Dosis indicada: {medication.dosis}
                              </p>
                            </div>
                          </div>
                        ))}

                        {recipe.medicamentos.length > 3 && (
                          <p className="text-sm text-slate-500">
                            Y {recipe.medicamentos.length - 3} medicamento(s)
                            más.
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRecipe(recipe.id)}
                      className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                    >
                      Ver detalle de la receta
                      <ChevronRight size={18} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Información */}
        <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <Info size={20} className="mt-0.5 shrink-0 text-blue-700" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Información importante
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Las recetas son de consulta. Sigue las indicaciones de tu
              profesional de salud y consulta con él si tienes dudas
              sobre tus medicamentos.
            </p>
          </div>
        </aside>

        {/* Detalle de receta */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedRecipe(null);
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="recipe-detail-title"
              className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-teal-700">
                    Detalle de receta
                  </p>
                  <h2
                    id="recipe-detail-title"
                    className="mt-1 text-2xl font-bold text-slate-900"
                  >
                    Receta #{selected.id}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecipe(null)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-5">
                <StatusBadge status={selected.estadoAnalisis} />
                <p className="mt-3 text-sm text-slate-500">
                  Fecha de registro: {formatDate(selected.fechaSubida)}
                </p>
              </div>

              <h3 className="mt-6 font-bold text-slate-900">
                Medicamentos
              </h3>

              <div className="mt-3 space-y-3">
                {selected.medicamentos.map((medication) => (
                  <div
                    key={medication.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Pill className="mt-0.5 text-teal-700" size={20} />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {medication.nombre}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Dosis indicada: {medication.dosis}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                La frecuencia, duración y demás instrucciones solo se
                mostrarán cuando esos campos existan en el registro médico.
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  color: "teal" | "blue" | "amber";
}) {
  const colors = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
        <span className="text-xs font-medium text-slate-400">
          Actualizado con el sistema
        </span>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <h3 className="mt-1 font-semibold text-slate-700">{label}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </article>
  );
}
