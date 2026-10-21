'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function DoctorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/api/doctors/me')
      .then((data) => setProfile(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando panel médico...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Doctor</h1>
        <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
          <p className="text-gray-600"><strong>Especialidad:</strong> {profile?.specialty}</p>
          <p className="text-gray-600"><strong>Licencia:</strong> {profile?.licenseNumber}</p>
          <p className="text-gray-600">
            <strong>Estado de Aprobación:</strong>{' '}
            <span className={profile?.approved ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {profile?.approved ? 'Aprobado' : 'Pendiente de aprobación'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}