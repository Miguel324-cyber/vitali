'use client';

import { useState } from 'react';

export default function InicioMedico() {
  // Estado para controlar qué sección está activa
  const [vistaActiva, setVistaActiva] = useState('ver-citas-asignadas');

  // Lista de opciones del menú para el Médico
  const menuOpciones = [
    { id: 'ver-citas-asignadas', label: 'Ver citas médicas asignadas' },
    { id: 'buscar-historial', label: 'Buscar historial paciente' },
    { id: 'ver-medicamentos', label: 'Ver medicamentos' },
  ];

  const renderizarContenido = () => {
    switch (vistaActiva) {
      case 'ver-citas-asignadas':
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Agenda de Citas</h2>
            
            {/* Tarjeta de la cita (Relacionada con la que ve el paciente) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-8 border-l-[#0D9488] max-w-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#0D9488]">Cita Médica General</h3>
                  <div className="mt-4 space-y-2">
                    <p className="text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">👤 Paciente:</span> Juan Pérez
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">📅 Fecha:</span> El próximo Lunes
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">⏰ Hora:</span> 10:00 AM
                    </p>
                  </div>
                </div>
                <span className="bg-teal-50 text-[#0D9488] py-1 px-4 rounded-full text-sm font-bold tracking-wide">
                  Confirmada
                </span>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <button className="px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium rounded-lg transition shadow-sm">
                  Iniciar Consulta
                </button>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
                  Ver Historial
                </button>
              </div>
            </div>
          </div>
        );

      case 'buscar-historial':
        return (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Búsqueda de Historial Clínico</h2>
            <div className="flex gap-4 max-w-2xl">
              <input 
                type="text" 
                placeholder="Ingresa el número de documento del paciente..." 
                className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
              <button className="px-6 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-lg transition">
                Buscar
              </button>
            </div>
          </div>
        );

      case 'ver-medicamentos':
        return <h2 className="text-3xl font-bold text-slate-800">Vademécum y Medicamentos</h2>;
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* Columna Izquierda (Menú Lateral) */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm hidden md:flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold text-[#0D9488]">Vitali</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Portal Médico</p>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {menuOpciones.map((opcion) => (
            <button
              key={opcion.id}
              onClick={() => setVistaActiva(opcion.id)}
              className={`text-left px-5 py-4 rounded-xl transition-all duration-200 font-semibold text-sm ${
                vistaActiva === opcion.id
                  ? 'bg-[#0D9488] text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0D9488]'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <a 
            href="/login/usuario" 
            className="block w-full text-center px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 font-semibold rounded-xl transition"
          >
            Cerrar Sesión
          </a>
        </div>
      </aside>

      {/* Contenedor Derecho (Header + Contenido Central) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Barra Superior (Header) - Ahora muestra el nombre del Doctor */}
        <header className="bg-white border-b border-slate-200 p-6 flex justify-end items-center shadow-sm shrink-0">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
            <span className="font-bold text-slate-700">Dr. Carlos Ramírez</span>
            <div className="w-12 h-12 bg-[#06B6D4] rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
              {/* Icono de estetoscopio o médico */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </header>

        {/* Área Central (Contenido Principal) */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {renderizarContenido()}
        </main>
        
        {/* Tarjeta de Contacto en la esquina inferior derecha */}
        <div className="fixed bottom-10 right-10 bg-sky-50 border border-sky-100 p-5 rounded-2xl shadow-lg text-right max-w-sm z-50">
          <p className="text-sm font-bold text-slate-700 mb-2">
            ¿Tienes problemas con la plataforma? Soporte Técnico:
          </p>
          <div className="text-xs text-slate-600 space-y-1">
            <p className="flex items-center justify-end gap-2">
              <span className="font-semibold">Correos:</span> 
              vitali@gmail.com | vitali.SC@gmail.com
            </p>
            <p className="flex items-center justify-end gap-2 text-[#0D9488] font-semibold mt-1">
              <span>WhatsApp:</span> 313097778
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}