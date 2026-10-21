'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'FAMILY'>('PATIENT');

  // Campos básicos de usuario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos específicos de Médico
  const [professionalRegistration, setProfessionalRegistration] = useState('');
  const [specialty, setSpecialty] = useState('');

  // Campos específicos de Paciente
  const [documentType, setDocumentType] = useState('CC');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let endpoint = '';
      let bodyData: any = {
        fullName,
        email,
        password,
      };

      if (role === 'PATIENT') {
        endpoint = '/api/auth/register/patient';
        bodyData = {
          ...bodyData,
          documentType,
          documentNumber,
          birthDate: birthDate || null,
          phone,
          weight: weight ? Number(weight) : null,
          height: height ? Number(height) : null,
          conditions,
          medications,
        };
      } else if (role === 'DOCTOR') {
        endpoint = '/api/auth/register/doctor';
        bodyData = {
          ...bodyData,
          professionalRegistration,
          specialty,
        };
      } else if (role === 'FAMILY') {
        endpoint = '/api/auth/register/family';
      }

      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(bodyData),
      });

      setSuccessMsg('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al registrarse');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Registro en Vitali</h2>

        {errorMsg && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-md">{successMsg}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Selección de Rol (Paciente, Médico, Familiar) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Usuario</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'PATIENT' | 'DOCTOR' | 'FAMILY')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="PATIENT">Paciente</option>
              <option value="DOCTOR">Médico</option>
              <option value="FAMILY">Familiar</option>
            </select>
          </div>

          {/* Datos Generales (Nombre, Correo, Contraseña) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* CAMPOS ESPECÍFICOS PARA PACIENTE */}
          {role === 'PATIENT' && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-md font-semibold text-gray-700">Información Médica del Paciente</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo Documento</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="CC">CC - Cédula Ciudadanía</option>
                    <option value="TI">TI - Tarjeta Identidad</option>
                    <option value="CE">CE - Cédula Extranjería</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Número Documento</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="Ej. 1012345678"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estatura (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condiciones Médicas / Enfermedades</label>
                  <textarea
                    rows={2}
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    placeholder="Ej. Hipertensión..."
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Medicamentos Actuales</label>
                  <textarea
                    rows={2}
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder="Ej. Losartán 50mg..."
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS PARA MÉDICO */}
          {role === 'DOCTOR' && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-md font-semibold text-gray-700">Información Profesional del Médico</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registro Profesional</label>
                  <input
                    type="text"
                    required
                    value={professionalRegistration}
                    onChange={(e) => setProfessionalRegistration(e.target.value)}
                    placeholder="Ej. MP-123456"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Especialidad</label>
                  <input
                    type="text"
                    required
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Ej. Cardiología"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}