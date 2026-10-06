'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserLoginPage() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(''); 
  
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un rol antes de redirigir
    if (!rol) {
      alert("Por favor, selecciona un rol para continuar.");
      return;
    }

    // Redirección exacta a las carpetas que creaste
    if (rol === 'paciente') {
      router.push('/inicio-paciente');
    } else if (rol === 'medico') {
      router.push('/inicio-medico');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <p>
      <Link href="/" className="absolute top-4 left-4 text-[#0284C7] font-semibold hover:underline transition">
        ← Volver a la página principal
      </Link>
      </p>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Encabezado con color primario azul */}
        <div className="bg-[#0284C7] p-8 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Bienvenido a Vitali</h2>
          <p className="mt-2 text-sky-100 text-sm">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
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

          {/* Campo Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent transition duration-200"
            />
          </div>

          {/* Campo Rol */}
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
              <option value="" disabled>Selecciona un rol...</option>
              <option value="paciente">Paciente</option>
              <option value="medico">Médico</option>
            </select>
          </div>

          {/* Enlace de recuperación */}
          <div className="flex justify-end text-sm">
            <a href="#" className="font-medium text-[#0D9488] hover:text-[#0F766E] transition">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón Principal */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 transition duration-200"
          >
            Iniciar Sesión
          </button>

          {/* Sección de Registro */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              ¿No tienes una cuenta?{' '}
              <Link href="/registro" className="font-semibold text-[#0D9488] hover:underline transition">
                Regístrate aquí
              </Link>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}