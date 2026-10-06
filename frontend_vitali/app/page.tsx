'use client';

import Head from 'next/head';
import Script from 'next/script';

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
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Plus+Jakarta+Sans:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Carga y Configuración de Tailwind CSS vía CDN */}
      <Script
        src="https://cdn.tailwindcss.com"
        strategy="beforeInteractive"
      />
      <Script id="tailwind-config" strategy="afterInteractive">
        {`
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                "colors": {
                  "surface": "#f8f9ff",
                  "surface-bright": "#f8f9ff",
                  "surface-container-lowest": "#ffffff",
                  "surface-tint": "#49607e",
                  "error": "#ba1a1a",
                  "secondary": "#006a61",
                  "primary-fixed": "#d2e4ff",
                  "tertiary": "#000a35",
                  "primary-fixed-dim": "#b0c8eb",
                  "on-secondary-container": "#006f66",
                  "on-primary-container": "#768dad",
                  "on-primary-fixed-variant": "#314865",
                  "on-secondary-fixed-variant": "#005049",
                  "inverse-surface": "#213145",
                  "on-primary": "#ffffff",
                  "outline": "#74777e",
                  "surface-container-high": "#dce9ff",
                  "on-surface-variant": "#43474d",
                  "on-background": "#0b1c30",
                  "surface-container": "#e5eeff",
                  "secondary-fixed-dim": "#6bd8cb",
                  "on-primary-fixed": "#001c37",
                  "primary": "#000f22",
                  "tertiary-fixed-dim": "#b8c4ff",
                  "on-tertiary-fixed-variant": "#173bab",
                  "on-tertiary-fixed": "#001453",
                  "tertiary-container": "#001b67",
                  "on-surface": "#0b1c30",
                  "primary-container": "#0a2540",
                  "surface-dim": "#cbdbf5",
                  "background": "#f8f9ff",
                  "on-error": "#ffffff",
                  "surface-container-highest": "#d3e4fe",
                  "on-error-container": "#93000a",
                  "on-tertiary-container": "#6884f4",
                  "on-secondary": "#ffffff",
                  "on-tertiary": "#ffffff",
                  "inverse-on-surface": "#eaf1ff",
                  "outline-variant": "#c4c6ce",
                  "secondary-container": "#86f2e4",
                  "error-container": "#ffdad6",
                  "inverse-primary": "#b0c8eb",
                  "surface-variant": "#d3e4fe",
                  "on-secondary-fixed": "#00201d",
                  "secondary-fixed": "#89f5e7",
                  "tertiary-fixed": "#dde1ff",
                  "surface-container-low": "#eff4ff"
                },
                "borderRadius": {
                  "DEFAULT": "0.125rem",
                  "lg": "0.25rem",
                  "xl": "0.5rem",
                  "full": "0.75rem"
                },
                "spacing": {
                  "gutter": "1.5rem",
                  "space-xs": "0.25rem",
                  "space-xl": "2.5rem",
                  "margin-mobile": "1rem",
                  "space-md": "1rem",
                  "gutter-mobile": "0.75rem",
                  "space-lg": "1.5rem",
                  "margin": "2rem",
                  "space-sm": "0.5rem"
                },
                "fontFamily": {
                  "body-lg": ["Inter"],
                  "headline-lg": ["Plus Jakarta Sans"],
                  "headline-xl-mobile": ["Plus Jakarta Sans"],
                  "headline-lg-mobile": ["Plus Jakarta Sans"],
                  "body-md": ["Inter"],
                  "headline-md": ["Plus Jakarta Sans"],
                  "label-sm": ["Inter"],
                  "headline-xl": ["Plus Jakarta Sans"],
                  "label-lg": ["Inter"],
                  "numeric-data": ["Inter"],
                  "body-sm": ["Inter"],
                  "label-md": ["Inter"],
                  "headline-sm": ["Plus Jakarta Sans"]
                },
                "fontSize": {
                  "body-lg": ["16px", { "lineHeight": "26px", "fontWeight": "400" }],
                  "headline-lg": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                  "headline-xl-mobile": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
                  "headline-lg-mobile": ["22px", { "lineHeight": "30px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                  "body-md": ["14px", { "lineHeight": "22px", "fontWeight": "400" }],
                  "headline-md": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                  "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }],
                  "headline-xl": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                  "label-lg": ["14px", { "lineHeight": "20px", "fontWeight": "600" }],
                  "numeric-data": ["13px", { "lineHeight": "18px", "letterSpacing": "-0.01em", "fontWeight": "500" }],
                  "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
                  "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "600" }],
                  "headline-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }]
                }
              }
            }
          }
        `}
      </Script>

      <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
        {/* Header / Navbar */}
        <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-20 w-full px-margin flex items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-xl">
              <a
                className="flex items-center gap-space-sm group"
                data-path="que-es-vitali"
                href="#"
              >
                
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-primary leading-tight tracking-tight">
                    Vitali
                  </span>
                  
                </div>
              </a>
              <nav
                className="hidden xl:flex items-center gap-space-lg"
                data-active-classes="text-primary font-semibold"
              >
                <a
                  className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                  data-path="que-es-vitali"
                  href="#"
                >
                  ¿Qué es Vitali?
                </a>
                <a
                  className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                  data-path="solucion-medica"
                  href="#"
                >
                  Solución Médica
                </a>
                <a
                  className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                  data-path="portal-pacientes"
                  href="#"
                >
                  Portal Pacientes
                </a>
                <a
                  className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs"
                  data-path="evidencia-clinica"
                  href="#"
                >
                  Evidencia Clínica
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-space-md">
              <a
                className="font-label-lg text-label-lg text-primary px-space-md py-space-sm rounded-lg hover:bg-surface-container-high transition-colors"
                data-path="iniciar-sesion"
                href="/login/usuario"
              >
                Iniciar Sesión
              </a>
              <a
                className="font-label-lg text-label-lg bg-primary text-on-primary px-space-lg py-space-sm rounded-lg hover:bg-primary-container transition-colors shadow-[0_1px_3px_rgba(10,37,64,0.08)]"
                data-path="solicitar-acceso-demo"
                href="/registro"
              >
                registro
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="w-full pt-20 bg-surface">
          <div className="flex flex-col w-full">
            {/* Top Ambient Glow Gradient */}
            <div className="relative w-full overflow-hidden">
              <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
              <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

              {/* 1. HERO SECTION & LIVE DEMO SIMULATOR GRID */}
              <section className="w-full px-margin pt-space-xl pb-space-xl">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
                  {/* Left Column: Copy & Actions */}
                  <div className="lg:col-span-7 flex flex-col gap-space-md">
                    <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high w-fit shadow-sm">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        verified
                      </span>
                      <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
                        Seguridad Farmacológica Basada en IA &amp; Evidencia
                        Clínica
                      </span>
                    </div>
                    <h1 className="font-headline-xl text-headline-xl text-primary leading-tight tracking-tight">
                      Detén la Sobremedicación <br className="hidden sm:block" />
                      <span className="text-secondary">
                        antes de que llegue al paciente.
                      </span>
                    </h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                      Vitali analiza recetas médicas en tiempo real, detectando
                      duplicidades terapéuticas, interacciones letales y dosis
                      excesivas para blindar la seguridad en geriatría y
                      respaldar decisiones médicas críticas.
                    </p>
                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                      <a
                        className="inline-flex items-center justify-center gap-space-xs bg-primary text-on-primary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-primary-container shadow-md transition-all"
                        href="#simulador"
                      >
                        <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
                          biotech
                        </span>
                        <span>Probar Analizador Demo</span>
                      </a>
                      <a
                        className="inline-flex items-center justify-center gap-space-xs bg-surface-container-high text-primary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-surface-variant shadow-sm transition-all"
                        data-path="iniciar-sesion"
                        href="#"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          stethoscope
                        </span>
                        <span>Ingresar como Médico</span>
                      </a>
                      <a
                        className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary font-label-md text-label-md underline underline-offset-4 ml-space-xs transition-colors"
                        data-path="portal-pacientes"
                        href="#"
                      >
                        <span>¿Eres paciente o familiar?</span>
                        <span className="material-symbols-outlined text-[16px]">
                          chevron_right
                        </span>
                      </a>
                    </div>
                    {/* Trust Badges */}
                    <div className="pt-space-lg grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                          <span className="material-symbols-outlined text-[18px]">
                            receipt_long
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-primary font-bold">
                            +450K
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Recetas analizadas
                          </span>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                          <span className="material-symbols-outlined text-[18px]">
                            health_and_safety
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-primary font-bold">
                            99.4%
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Precisión colisiones
                          </span>
                        </div>
                      </div>
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                          <span className="material-symbols-outlined text-[18px]">
                            sync_saved_locally
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-lg text-label-lg text-primary font-bold">
                            HL7 FHIR R4
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Interoperabilidad EHR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Interactive Live Simulator Card */}
                  <div className="lg:col-span-5 relative" id="simulador">
                    <div className="bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg shadow-xl flex flex-col gap-space-md relative overflow-hidden">
                      {/* Header bar of simulator */}
                      <div className="flex items-center justify-between pb-space-sm bg-surface-container-lowest">
                        <div className="flex items-center gap-space-xs">
                          <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping"></span>
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                            Simulación en Tiempo Real
                          </span>
                        </div>
                        <span className="font-numeric-data text-numeric-data px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                          Expediente #VT-88219
                        </span>
                      </div>
                      {/* Patient context snapshot */}
                      <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-space-sm">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold font-headline-sm">
                            EG
                          </div>
                          <div>
                            <h4 className="font-label-lg text-label-lg text-primary leading-snug">
                              Elena Gómez (74 años)
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              eGFR: 48 mL/min (Estadio 3a) · HTA + Artrosis
                            </p>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm px-2 py-1 rounded bg-error-container text-error font-semibold">
                          Alto Riesgo
                        </span>
                      </div>
                      {/* Medication List in Recipe */}
                      <div className="flex flex-col gap-space-xs">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">
                          Medicamentos Prescritos Concomitantes
                        </span>
                        {/* Drug 1 */}
                        <div className="p-space-sm rounded-lg bg-surface-container flex items-center justify-between">
                          <div className="flex items-center gap-space-sm">
                            <span className="material-symbols-outlined text-primary text-[20px]">
                              pill
                            </span>
                            <div>
                              <span className="font-label-md text-label-md text-primary block">
                                Enalapril 20mg
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Cardiología · IECA c/24h
                              </span>
                            </div>
                          </div>
                          <span className="font-numeric-data text-numeric-data text-on-surface-variant">
                            Activo (4 meses)
                          </span>
                        </div>
                        {/* Drug 2 (Collision) */}
                        <div className="p-space-sm rounded-lg bg-error-container/40 flex items-center justify-between">
                          <div className="flex items-center gap-space-sm">
                            <span className="material-symbols-outlined text-error text-[20px]">
                              warning
                            </span>
                            <div>
                              <span className="font-label-md text-label-md text-primary block">
                                Losartán 50mg
                              </span>
                              <span className="font-body-sm text-body-sm text-error font-medium">
                                Medicina General · ARA-II c/24h (Nueva)
                              </span>
                            </div>
                          </div>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error text-on-error font-bold">
                            Duplicidad
                          </span>
                        </div>
                        {/* Drug 3 (Collision) */}
                        <div className="p-space-sm rounded-lg bg-error-container/40 flex items-center justify-between">
                          <div className="flex items-center gap-space-sm">
                            <span className="material-symbols-outlined text-error text-[20px]">
                              report_problem
                            </span>
                            <div>
                              <span className="font-label-md text-label-md text-primary block">
                                Ibuprofeno 600mg
                              </span>
                              <span className="font-body-sm text-body-sm text-error font-medium">
                                Traumatología · AINE c/8h (Por dolor articular)
                              </span>
                            </div>
                          </div>
                          <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-error text-on-error font-bold">
                            Nefrotóxico
                          </span>
                        </div>
                      </div>
                      {/* Vitali Real-Time Collision Engine Alert Card */}
                      <div className="p-space-md rounded-lg bg-error-container text-on-error-container flex flex-col gap-space-xs shadow-md">
                        <div className="flex items-center gap-space-xs text-error">
                          <span className="material-symbols-outlined text-[20px]">
                            fmd_bad
                          </span>
                          <span className="font-label-lg text-label-lg font-bold">
                            ¡ALERTA CRÍTICA: TRIPLE INTERACCIÓN (BEERS /
                            STOPP)!
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-error-container leading-relaxed">
                          Duplicidad en Bloqueo del Sistema
                          Renina-Angiotensina (IECA + ARA-II) sumado a
                          vasoconstricción renal por AINE.{" "}
                          <strong>
                            Riesgo inminente: Insuficiencia Renal Aguda e
                            Hiperpotasemia grave (K+ &gt; 5.8 mEq/L).
                          </strong>
                        </p>
                        <div className="mt-space-xs p-space-sm rounded bg-surface-container-lowest text-on-surface shadow-sm">
                          <div className="flex items-center gap-space-xs text-secondary mb-1">
                            <span className="material-symbols-outlined text-[16px]">
                              smart_toy
                            </span>
                            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wide">
                              Protocolo Desprescripción Vitali
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            1. Suspender Losartán (mantener solo Enalapril).
                            <br />
                            2. Sustituir Ibuprofeno por Paracetamol 1g c/8h o
                            terapia tópica para preservar filtrado glomerular.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs">
                          <button
                            className="font-label-sm text-label-sm bg-error text-on-error px-space-md py-1.5 rounded hover:bg-on-error-container transition-colors font-semibold"
                            onClick={handleApplyDesprescription}
                            type="button"
                          >
                            Aplicar Desprescripción
                          </button>
                          <span className="font-numeric-data text-numeric-data text-on-surface-variant">
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
                    paciente geriátrico en el receptor acumulativo de
                    prescripciones redundantes.
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
                        De los adultos mayores de 65 años toman más de 5
                        medicamentos al día de manera crónica, duplicando el
                        riesgo de caídas y deterioro cognitivo.
                      </p>
                    </div>
                    {/* Sparkline Mini Chart (SVG) */}
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
                        ></path>
                        <path
                          d="M0 35 C 40 32, 80 28, 120 18 C 160 10, 180 8, 200 4 L 200 40 L 0 40 Z"
                          fill="currentColor"
                          fillOpacity="0.1"
                        ></path>
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
                        desencadenan por reacciones adversas a medicamentos (RAM)
                        o colisiones farmacológicas previsibles.
                      </p>
                    </div>
                    {/* Bar Graph Comparison (SVG) */}
                    <div className="mt-space-md pt-space-xs flex items-end gap-2 h-10">
                      <div className="w-1/4 bg-surface-container-high h-1/3 rounded-t"></div>
                      <div className="w-1/4 bg-surface-container-high h-1/2 rounded-t"></div>
                      <div className="w-1/4 bg-surface-container-high h-2/3 rounded-t"></div>
                      <div className="w-1/4 bg-error h-full rounded-t"></div>
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
                        reingresos a 30 días en centros asistenciales que
                        integraron la auditoría en tiempo real.
                      </p>
                    </div>
                    {/* Donut Progress Ring (SVG) */}
                    <div className="mt-space-md pt-space-xs flex items-center gap-space-sm">
                      <svg className="w-10 h-10" viewBox="0 0 36 36">
                        <path
                          className="text-surface-container"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        ></path>
                        <path
                          className="text-secondary"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="68, 100"
                          strokeLinecap="round"
                          strokeWidth="3.5"
                        ></path>
                      </svg>
                      <span className="font-numeric-data text-numeric-data text-secondary font-bold">
                        Eficacia Clínica Validada
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. HOW IT WORKS / CLINICAL FLOW */}
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
                    Vitali no reemplaza el criterio médico; amplifica la
                    visibilidad de riesgos farmacológicos a menudo dispersos
                    entre distintos especialistas.
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
                        Recepción automática mediante integración HL7 FHIR con
                        el software hospitalario, importación de PDF o captura
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
                        El motor cruza simultáneamente las rutas de
                        metabolización (citocromo CYP450), filtrado renal
                        (Cockcroft-Gault), escala anticolinérgica (ACB) e
                        historial de alergias registradas.
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
                        Emisión de alertas graduadas con soporte en criterios
                        Beers 2023 y STOPP/START v3, sugiriendo alternativas
                        terapéuticas y escalonamiento de desprescripción
                        segura.
                      </p>
                    </div>
                    <div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-auto">
                      <span className="material-symbols-outlined text-secondary text-[20px]">
                        grading
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                        Criterios Beers &amp; STOPP/START integrados
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. ROLE-BASED ACCESS PORTALS */}
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
                    claridad comprensible que necesitan los pacientes y
                    cuidadores en su hogar.
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
                          Uso Hospitalario &amp; Clínico
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-lg text-headline-lg text-primary">
                          Portal para Profesionales y Clínicas
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                          Entorno de alta densidad para médicos de familia,
                          geriatras, internistas y farmacéuticos
                          hospitalarios.
                        </p>
                      </div>
                      {/* Features checklist */}
                      <ul className="flex flex-col gap-space-sm pt-space-xs">
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Auditoría integral de la cascada de prescripción
                            farmacológica
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Scoring de carga anticolinérgica (ACB Score) y
                            riesgo sedativo acumulado
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Ajuste automático por aclaramiento de creatinina y
                            función hepática
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Generación de informes de desprescripción
                            legalmente conformes
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-space-lg flex flex-wrap items-center gap-space-md">
                      <a
                        className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-primary-container transition-colors shadow"
                        data-path="iniciar-sesion"
                        href="#"
                      >
                        <span>Iniciar Sesión Médica</span>
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </a>
                      <a
                        className="font-label-lg text-label-lg text-secondary hover:text-on-secondary-container transition-colors"
                        data-path="solicitar-acceso-demo"
                        href="#"
                      >
                        Solicitar Credenciales Institucionales
                      </a>
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
                          Pacientes &amp; Familias
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline-lg text-headline-lg text-primary">
                          Portal para Pacientes y Cuidadores
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                          Claridad y serenidad diaria: información comprensible
                          sin jerga médica impenetrable.
                        </p>
                      </div>
                      {/* Features checklist */}
                      <ul className="flex flex-col gap-space-sm pt-space-xs">
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Pastillero digital interactivo con fotos reales de
                            cada comprimido
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Explicación en lenguaje sencillo de para qué sirve
                            cada fármaco
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Alertas preventivas ante automedicación o mezclas
                            con infusiones/hierbas
                          </span>
                        </li>
                        <li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                            check_circle
                          </span>
                          <span>
                            Modo cuidador familiar con notificaciones SMS y
                            WhatsApp de tomas
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pt-space-lg flex flex-wrap items-center gap-space-md">
                      <a
                        className="inline-flex items-center gap-space-xs bg-secondary text-on-secondary font-label-lg text-label-lg px-space-lg py-3 rounded-lg hover:bg-on-secondary-container transition-colors shadow"
                        data-path="portal-pacientes"
                        href="#"
                      >
                        <span>Ingresar a Mi Portal</span>
                        <span className="material-symbols-outlined text-[18px]">
                          account_circle
                        </span>
                      </a>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Sin costo para pacientes de centros adscritos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. CLINICAL EVIDENCE, ENDORSEMENTS & TESTIMONIALS */}
            <section className="w-full py-space-xl px-margin">
              <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-space-md">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                      Aval Clínico &amp; Autoridad Médica
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-primary mt-1">
                      Diseñado con
                    </h2>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}