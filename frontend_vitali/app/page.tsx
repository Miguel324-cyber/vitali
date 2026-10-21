'use client';
import Link from "next/link";
import Image from "next/image";
import Head from 'next/head';

export default function VitaliLandingPage() {
  const handleApplyDesprescription = () => {
    alert(
      'Protocolo de desprescripción aplicado. Ajuste notificado a Cardiología y Traumatología.'
    );
  };

  return (
    <>
      {/* Encabezado HTML con Fuentes y Estilos Globales */}
      <Head>
        <title>Vitali - Inteligencia Clínica</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
      
        />
      </Head>

     
      

      <div className="bg-surface font-sans text-on-surface antialiased min-h-screen selection:bg-secondary/20 selection:text-secondary">
        {/* Header / Navbar */}
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
          <div className="max-w-7xl mx-auto h-20 px-margin flex items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-xl">
              <a
                className="flex items-center gap-2 group"
                data-path="que-es-vitali"
                href="#"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-secondary to-tertiary flex items-center justify-center text-white shadow-md shadow-secondary/20 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">
                    health_and_safety
                  </span>
                </div>
                <span className="font-headline text-2xl font-bold tracking-tight text-primary">
                  Vitali<span className="text-secondary">.</span>
                </span>
              </a>
              <nav
                className="hidden xl:flex items-center gap-space-lg ml-6"
                data-active-classes="text-primary font-semibold"
              >
                <a
                  className="text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors py-space-xs"
                  data-path="que-es-vitali"
                  href="#"
                >
                  ¿Qué es Vitali?
                </a>
                <a
                  className="text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors py-space-xs"
                  data-path="solucion-medica"
                  href="#"
                >
                  Solución Médica
                </a>
                <a
                  className="text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors py-space-xs"
                  data-path="portal-pacientes"
                  href="#"
                >
                  Portal Pacientes
                </a>
                <a
                  className="text-sm font-medium text-on-surface-variant hover:text-secondary transition-colors py-space-xs"
                  data-path="evidencia-clinica"
                  href="#"
                >
                  Evidencia Clínica
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-space-md">
              <a
                className="text-sm font-semibold text-primary px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                data-path="iniciar-sesion"
                href="/login/usuario"
              >
                Iniciar Sesión
              </a>
              <a
                className="text-sm font-semibold bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm hover:shadow"
                data-path="solicitar-acceso-demo"
                href="/registro"
              >
                Registro
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="w-full pt-20 bg-surface">
          <div className="flex flex-col w-full">
            {/* Top Ambient Glow Gradient */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
              <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-tertiary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

              {/* 1. HERO SECTION & LIVE DEMO SIMULATOR GRID */}
              <section className="w-full px-margin pt-12 pb-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Column: Copy & Actions */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 w-fit shadow-xs">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">
                        verified
                      </span>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Seguridad Farmacológica Basada en IA &amp; Evidencia Clínica
                      </span>
                    </div>

                    <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary leading-[1.15] tracking-tight">
                      Detén la Sobremedicación <br className="hidden sm:block" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
                        antes de que llegue al paciente.
                      </span>
                    </h1>

                    <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl font-normal">
                      Vitali analiza recetas médicas en tiempo real, detectando
                      duplicidades terapéuticas, interacciones letales y dosis
                      excesivas para blindar la seguridad en geriatría y
                      respaldar decisiones médicas críticas.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <a
                        className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-sky-600 text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-secondary/25 transition-all hover:-translate-y-0.5"
                        href="#simulador"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          biotech
                        </span>
                        <span>Probar Analizador Demo</span>
                      </a>
                      <a
                        className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-primary font-semibold text-sm px-6 py-3.5 rounded-xl shadow-xs transition-all"
                        data-path="iniciar-sesion"
                        href="#"
                      >
                        <span className="material-symbols-outlined text-[20px] text-slate-500">
                          stethoscope
                        </span>
                        <span>Ingresar como Médico</span>
                      </a>
                      <a
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-secondary font-semibold text-sm transition-colors py-2 px-1"
                        data-path="portal-pacientes"
                        href="#"
                      >
                        <span>¿Eres paciente o familiar?</span>
                        <span className="material-symbols-outlined text-[18px]">
                          chevron_right
                        </span>
                      </a>
                    </div>

                    {/* Trust Badges */}
                    <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200/60 mt-4">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sky-50 text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            receipt_long
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline text-lg font-bold text-primary leading-none">
                            +450K
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-1">
                            Recetas analizadas
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-tertiary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            health_and_safety
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline text-lg font-bold text-primary leading-none">
                            99.4%
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-1">
                            Precisión colisiones
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[20px]">
                            sync_saved_locally
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline text-lg font-bold text-primary leading-none">
                            HL7 FHIR R4
                          </span>
                          <span className="text-xs text-slate-500 font-medium mt-1">
                            Interoperabilidad EHR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Live Simulator Card */}
                  <div className="lg:col-span-5 relative" id="simulador">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-slate-200/80 border border-slate-200/80 flex flex-col gap-4 relative overflow-hidden">
                      {/* Header bar of simulator */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Simulación en Tiempo Real
                          </span>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                          Expediente #VT-88219
                        </span>
                      </div>

                      {/* Patient context snapshot */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                            EG
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-primary leading-snug">
                              Elena Gómez (74 años)
                            </h4>
                            <p className="text-xs text-slate-500">
                              eGFR: 48 mL/min (Estadio 3a) · HTA + Artrosis
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-error font-bold">
                          Alto Riesgo
                        </span>
                      </div>

                      {/* Medication List in Recipe */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Medicamentos Prescritos Concomitantes
                        </span>

                        {/* Drug 1 */}
                        <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-600 text-[20px]">
                              pill
                            </span>
                            <div>
                              <span className="text-xs font-bold text-primary block">
                                Enalapril 20mg
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Cardiología · IECA c/24h
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Activo (4 meses)
                          </span>
                        </div>

                        {/* Drug 2 (Collision) */}
                        <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-error text-[20px]">
                              warning
                            </span>
                            <div>
                              <span className="text-xs font-bold text-primary block">
                                Losartán 50mg
                              </span>
                              <span className="text-[11px] text-error font-medium">
                                Medicina General · ARA-II c/24h (Nueva)
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-error text-white font-bold">
                            Duplicidad
                          </span>
                        </div>

                        {/* Drug 3 (Collision) */}
                        <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-error text-[20px]">
                              report_problem
                            </span>
                            <div>
                              <span className="text-xs font-bold text-primary block">
                                Ibuprofeno 600mg
                              </span>
                              <span className="text-[11px] text-error font-medium">
                                Traumatología · AINE c/8h (Por dolor)
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-error text-white font-bold">
                            Nefrotóxico
                          </span>
                        </div>
                      </div>

                      {/* Vitali Real-Time Collision Engine Alert Card */}
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200/80 text-on-error-container flex flex-col gap-2 shadow-xs">
                        <div className="flex items-center gap-2 text-error">
                          <span className="material-symbols-outlined text-[20px]">
                            fmd_bad
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wide">
                            ¡ALERTA CRÍTICA: TRIPLE INTERACCIÓN (BEERS / STOPP)!
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Duplicidad en Bloqueo del Sistema Renina-Angiotensina (IECA + ARA-II) sumado a vasoconstricción renal por AINE.{" "}
                          <strong className="text-red-900">
                            Riesgo inminente: Insuficiencia Renal Aguda e Hiperpotasemia grave (K+ &gt; 5.8 mEq/L).
                          </strong>
                        </p>

                        <div className="mt-1 p-3 rounded-lg bg-white border border-red-100 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-tertiary mb-1">
                            <span className="material-symbols-outlined text-[16px]">
                              smart_toy
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Protocolo Desprescripción Vitali
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">
                            1. Suspender Losartán (mantener solo Enalapril).
                            <br />
                            2. Sustituir Ibuprofeno por Paracetamol 1g c/8h o terapia tópica para preservar filtrado glomerular.
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            className="text-xs bg-error hover:bg-red-700 text-white px-3.5 py-2 rounded-lg transition-colors font-semibold shadow-xs"
                            onClick={handleApplyDesprescription}
                            type="button"
                          >
                            Aplicar Desprescripción
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Respuesta en 12ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* 2. MEDICAL IMPACT & STATS */}
           {/* 2. MEDICAL IMPACT & STATS */}
      <section className="w-full bg-surface-container-low py-space-xl px-margin">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="max-w-xl">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Epidemiología Hospitalaria
              </span>

              <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
                El alto costo de la polifarmacia silente
              </h2>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
              La falta de interoperabilidad entre especialistas convierte al
              paciente geriátrico en el receptor acumulativo de prescripciones
              redundantes.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Metric 1 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">
                  40%
                </span>

                <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[22px]">
                    elderly
                  </span>
                </span>
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
                  Polifarmacia Severa
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  De los adultos mayores de 65 años toman más de 5 medicamentos
                  al día de manera crónica, duplicando el riesgo de caídas y
                  deterioro cognitivo.
                </p>
              </div>

              {/* Sparkline */}
              <div className="mt-space-md pt-space-xs">
                <svg
                  className="w-full h-10 text-secondary"
                  fill="none"
                  viewBox="0 0 200 40"
                >
                  <path
                    d="M0 35 C 40 32, 80 28, 120 18 C 160 10, 180 8, 200 4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3"
                  />

                  <path
                    d="M0 35 C 40 32, 80 28, 120 18 C 160 10, 180 8, 200 4 L 200 40 L 0 40 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                </svg>

                <span className="font-numeric-data text-numeric-data text-on-surface-variant">
                  Tendencia creciente 2018-2025
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-xl text-headline-xl text-error font-bold">
                  1 de 4
                </span>

                <span className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[22px]">
                    emergency
                  </span>
                </span>
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
                  Ingresos de Urgencia Evitables
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  De las hospitalizaciones de emergencia geriátricas se
                  desencadenan por reacciones adversas a medicamentos (RAM) o
                  colisiones farmacológicas previsibles.
                </p>
              </div>

              {/* Bar Graph */}
              <div className="mt-space-md pt-space-xs flex items-end gap-2 h-10">
                <div className="w-1/4 bg-surface-container-high h-1/3 rounded-t" />
                <div className="w-1/4 bg-surface-container-high h-1/2 rounded-t" />
                <div className="w-1/4 bg-surface-container-high h-2/3 rounded-t" />
                <div className="w-1/4 bg-error h-full rounded-t" />
              </div>

              <span className="font-numeric-data text-numeric-data text-error font-semibold mt-1">
                25% atribuible a RAM
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-space-md">
                <span className="font-headline-xl text-headline-xl text-secondary font-bold">
                  -68%
                </span>

                <span className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[22px]">
                    trending_down
                  </span>
                </span>
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">
                  Reducción con Vitali
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  Disminución comprobada en eventos adversos farmacológicos y
                  reingresos a 30 días en centros asistenciales que integraron
                  la auditoría en tiempo real.
                </p>
              </div>

              {/* Donut */}
              <div className="mt-space-md pt-space-xs flex items-center gap-space-sm">
                <svg className="w-10 h-10" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />

                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="68, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>

                <span className="font-numeric-data text-numeric-data text-secondary font-bold">
                  Eficacia Clínica Validada
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="w-full py-space-xl px-margin">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Flujo de Inteligencia Asistida
            </span>

            <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
              De la prescripción a la seguridad clínica en segundos
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Vitali no reemplaza el criterio médico; amplifica la visibilidad
              de riesgos farmacológicos a menudo dispersos entre distintos
              especialistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
            {/* Step 1 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm font-bold shadow-sm">
                01
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs">
                  Carga o Escaneo de Recetas
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  Recepción automática mediante integración HL7 FHIR con el
                  software hospitalario, importación de PDF o captura
                  fotográfica con nuestro motor OCR clínico entrenado para
                  caligrafía médica.
                </p>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-auto">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  document_scanner
                </span>

                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  OCR Farmacológico + Normalización ATC/RxNorm
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md relative">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold shadow-sm">
                02
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs">
                  Cruce Multidimensional
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  El motor cruza simultáneamente las rutas de metabolización
                  (citocromo CYP450), filtrado renal (Cockcroft-Gault), escala
                  anticolinérgica (ACB) e historial de alergias registradas.
                </p>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-auto">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  hub
                </span>

                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  Análisis cruzado en &lt; 15 milisegundos
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-md relative">
              <div className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center font-headline-sm font-bold shadow-sm">
                03
              </div>

              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-space-xs">
                  Recomendación Basada en Guías
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant">
                  Emisión de alertas graduadas con soporte en criterios Beers
                  2023 y STOPP/START v3, sugiriendo alternativas terapéuticas y
                  escalonamiento de desprescripción segura.
                </p>
              </div>

              <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-auto">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  grading
                </span>

                <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                  Criterios Beers & STOPP/START integrados
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ROLE BASED PORTALS */}
      <section className="w-full bg-surface-container-low py-space-xl px-margin">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Ecosistema Colaborativo
            </span>

            <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
              Una misma plataforma, dos experiencias dedicadas
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Conectamos el rigor analítico del equipo prescriptor con la
              claridad comprensible que necesitan los pacientes y cuidadores en
              su hogar.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {/* Portal Médicos */}
            <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px] text-secondary-fixed">
                      clinical_notes
                    </span>
                  </span>

                  <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-bold uppercase">
                    Uso Hospitalario & Clínico
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-headline-lg text-primary">
                    Portal para Profesionales y Clínicas
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                    Entorno de alta densidad para médicos de familia, geriatras,
                    internistas y farmacéuticos hospitalarios.
                  </p>
                </div>

                <ul className="flex flex-col gap-space-sm pt-space-xs">
                  {[
                    "Auditoría integral de la cascada de prescripción farmacológica",
                    "Scoring de carga anticolinérgica (ACB Score) y riesgo sedativo acumulado",
                    "Ajuste automático por aclaramiento de creatinina y función hepática",
                    "Generación de informes de desprescripción legalmente conformes",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                        check_circle
                      </span>

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-space-lg flex flex-wrap items-center gap-space-md">
                <Link
                  href="/iniciar-sesion"
                  className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-primary-container transition-colors shadow"
                >
                  <span>Iniciar Sesión Médica</span>

                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>

                <Link
                  href="/solicitar-acceso-demo"
                  className="font-label-lg text-label-lg text-secondary hover:text-on-secondary-container transition-colors"
                >
                  Solicitar Credenciales Institucionales
                </Link>
              </div>
            </div>

            {/* Portal Pacientes */}
            <div className="p-space-xl rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px]">
                      family_restroom
                    </span>
                  </span>

                  <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold uppercase">
                    Pacientes & Familias
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-headline-lg text-primary">
                    Portal para Pacientes y Cuidadores
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                    Claridad y serenidad diaria: información comprensible sin
                    jerga médica impenetrable.
                  </p>
                </div>

                <ul className="flex flex-col gap-space-sm pt-space-xs">
                  {[
                    "Pastillero digital interactivo con fotos reales de cada comprimido",
                    "Explicación en lenguaje sencillo de para qué sirve cada fármaco",
                    "Alertas preventivas ante automedicación o mezclas con infusiones/hierbas",
                    "Modo cuidador familiar con notificaciones SMS y WhatsApp de tomas",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                        check_circle
                      </span>

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-space-lg flex flex-wrap items-center gap-space-md">
                <Link
                  href="/portal-pacientes"
                  className="inline-flex items-center gap-space-xs bg-secondary text-on-secondary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-on-secondary-container transition-colors shadow"
                >
                  <span>Ingresar a Mi Portal</span>

                  <span className="material-symbols-outlined text-[18px]">
                    account_circle
                  </span>
                </Link>

                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Sin costo para pacientes de centros adscritos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLINICAL EVIDENCE */}
      <section className="w-full py-space-xl px-margin">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                Aval Clínico & Autoridad Médica
              </span>

              <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
                Diseñado con especialistas que viven el día a día hospitalario
              </h2>
            </div>

            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px] text-secondary">
                verified_user
              </span>

              <span className="font-label-md text-label-md">
                Ensayos clínicos publicados en revistas indexadas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Testimonial 1 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <p className="font-body-md text-body-md text-on-surface-variant italic mb-space-lg">
                “En nuestro servicio de Geriatría, Vitali ha sido decisivo. Un
                paciente de 82 años recibía prescripciones independientes de
                tres especialistas distintos que colisionaban provocando caídas
                recurrentes. El sistema nos alertó y logramos desprescribir
                con total seguridad.”
              </p>

              <div className="flex items-center gap-space-md pt-space-md">
                

                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary leading-tight">
                    Dr. Marcos Valdivia
                  </h4>

                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Jefe del Servicio de Geriatría · Hospital Universitario
                    Central
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <p className="font-body-md text-body-md text-on-surface-variant italic mb-space-lg">
                “El mayor reto de la farmacia hospitalaria es la fatiga de
                alertas: la mayoría de los sistemas EHR generan alertas
                insignificantes. Vitali calibra la relevancia clínica de forma
                asombrosa; cuando emite una alerta roja, sabemos que hay riesgo
                letal inminente.”
              </p>

              <div className="flex items-center gap-space-md pt-space-md">
               

                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary leading-tight">
                    Dra. Lucía Santander
                  </h4>

                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Directora de Farmacología Clínica · Red Asistencial Norte
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between">
              <p className="font-body-md text-body-md text-on-surface-variant italic mb-space-lg">
                “Integrar Vitali en nuestro sistema EHR mediante HL7 FHIR tomó
                menos de dos semanas. Ha reducido en un 42% el tiempo que los
                médicos de atención primaria dedican a conciliar medicamentos
                tras el alta médica.”
              </p>

              <div className="flex items-center gap-space-md pt-space-md">
              

                <div>
                  <h4 className="font-headline-sm text-headline-sm text-primary leading-tight">
                    Dr. Fernando Prieto
                  </h4>

                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Director Médico de Sistemas de Información · Grupo
                    Hospitalario San Javier
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-wrap items-center justify-around gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px] text-primary">
                bookmark_manager
              </span>

              <span className="font-label-md text-label-md font-semibold">
                American Geriatrics Society (Beers Criteria®)
              </span>
            </div>

            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px] text-primary">
                verified
              </span>

              <span className="font-label-md text-label-md font-semibold">
                Criterios STOPP/START v3
              </span>
            </div>

            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px] text-primary">
                storage
              </span>

              <span className="font-label-md text-label-md font-semibold">
                Base de Datos RxNorm & ATC WHO
              </span>
            </div>

            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[24px] text-primary">
                encrypted
              </span>

              <span className="font-label-md text-label-md font-semibold">
                Norma UNE-EN ISO 13485 (Dispositivo Médico)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="w-full px-margin pb-space-xl">
        <div className="max-w-7xl mx-auto rounded-3xl bg-primary text-on-primary p-space-xl md:p-14 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-space-xl">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-surface-container-high/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl flex flex-col gap-space-sm">
            <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-container w-fit">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
                shield_with_heart
              </span>

              <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-semibold">
                Protección Activa de Pacientes
              </span>
            </div>

            <h2 className="font-headline-xl text-headline-xl text-on-primary">
              Empieza hoy a prescribir con la máxima seguridad farmacológica.
            </h2>

            <p className="font-body-lg text-body-lg text-on-primary-container max-w-xl">
              Conéctate al motor preventivo de Vitali. Solicita una sesión de
              demostración con nuestros especialistas clínicos y evalúa el
              impacto en tu centro o consulta privada.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-space-sm w-full md:w-auto shrink-0">
            <Link
              href="/solicitar-acceso-demo"
              className="inline-flex items-center justify-center gap-space-xs bg-secondary-fixed text-on-secondary-fixed font-label-lg text-label-lg px-space-xl py-3.5 rounded-lg hover:bg-secondary-fixed-dim transition-all shadow-md font-bold text-center"
            >
              <span className="material-symbols-outlined text-[20px]">
                calendar_month
              </span>

              <span>Agendar Demostración Clínica</span>
            </Link>

            <Link
              href="/login/usuario"
              className="inline-flex items-center justify-center gap-space-xs bg-primary-container text-on-primary font-label-lg text-label-lg px-space-xl py-3.5 rounded-lg hover:bg-primary transition-all text-center"
            >
              <span className="material-symbols-outlined text-[20px]">
                login
              </span>

              <span>Acceder a Mi Cuenta</span>
            </Link>
          </div>
        </div>
        </section>
          </div>
        </main>
      </div>
    </>
  );
}