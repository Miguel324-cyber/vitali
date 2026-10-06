'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegistroPage() {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [cedula, setCedula] = useState('');
  const [eps, setEps] = useState('');
  const [rol, setRol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rol) {
      alert("Por favor, selecciona un rol.");
      return;
    }

    // Aquí conectarás con tu Backend en Java Spring Boot para guardar el registro
    console.log('Registrando usuario:', { nombre, fechaNacimiento, cedula, eps, rol });
    alert("¡Registro exitoso!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <p>
      <Link href="/" className="absolute top-4 left-4 text-[#0284C7] font-semibold hover:underline transition">
        ← Volver a la página principal
      </Link>
      </p>
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Encabezado con el título Registro */}
        <div className="bg-[#0D9488] p-8 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Registro</h2>
          <p className="mt-2 text-teal-100 text-sm">
            Crea tu cuenta en Vitali completando los datos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {/* Campo Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Campo Fecha de Nacimiento */}
          <div>
            <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-slate-700 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              id="fechaNacimiento"
              type="date"
              required
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Campo Cédula */}
          <div>
            <label htmlFor="cedula" className="block text-sm font-semibold text-slate-700 mb-1">
              Número de Cédula
            </label>
            <input
              id="cedula"
              type="text"
              required
              placeholder="Ej. 1098765432"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Campo EPS */}
          <div>
            <label htmlFor="eps" className="block text-sm font-semibold text-slate-700 mb-1">
              EPS
            </label>
            <input
              id="eps"
              type="text"
              required
              placeholder="Ej. Sura, Sanitas, Famisanar..."
              value={eps}
              onChange={(e) => setEps(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Campo Rol (Paciente o Médico) */}
          <div>
            <label htmlFor="rol" className="block text-sm font-semibold text-slate-700 mb-1">
              Rol
            </label>
            <select
              id="rol"
              required
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            >
              <option value="" disabled>Selecciona tu rol...</option>
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
            </select>
          </div>

          {/* Botón de Registro */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 transition duration-200 mt-2"
          >
            Registrarse
          </button>

          {/* Enlace para volver al Login */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login/usuario" className="font-semibold text-[#0284C7] hover:underline transition">
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}