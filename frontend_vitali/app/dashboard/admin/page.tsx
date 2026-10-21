'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function AdminDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      // 1. Cargar estadísticas generales
      const overviewData = await fetchApi('/api/admin/overview');
      setOverview(overviewData);

      // 2. Cargar doctores pendientes de aprobación (Ajusta el endpoint si es diferente en tu AdminController)
      const doctorsData = await fetchApi('/api/admin/doctors/pending').catch(() => []);
      setPendingDoctors(doctorsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

 const handleApproveDoctor = async (doc: any) => {
  // Inspecciona la estructura en la consola del navegador
  console.log('Objeto Doctor seleccionado:', doc);

  // Obtener el userId correcto (prueba con doc.userId, doc.user?.id o doc.id)
  const targetUserId = doc.userId || doc.user?.id || doc.id;

  if (!targetUserId) {
    alert('No se pudo encontrar el ID de usuario del doctor.');
    return;
  }

  try {
    await fetchApi(`/api/admin/doctors/${targetUserId}/approve`, {
      method: 'PATCH',
    });
    alert('¡Doctor aprobado con éxito!');
    loadAdminData(); // Recargar la lista
  } catch (err: any) {
    alert(err.message || 'Error al aprobar el doctor');
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-6">
      
      {/* Resumen General */}
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100">
            <h4 className="text-sm font-medium text-indigo-600">Total de Usuarios</h4>
            <p className="text-2xl font-bold text-indigo-900 mt-1">{overview?.totalUsers ?? 0}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 border border-green-100">
            <h4 className="text-sm font-medium text-green-600">Doctores Pendientes</h4>
            <p className="text-2xl font-bold text-green-900 mt-1">{overview?.pendingDoctors ?? pendingDoctors.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de Doctores por Aprobar */}
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Doctores Pendientes de Aprobación</h3>
        {pendingDoctors.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay doctores pendientes en este momento.</p>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="text-gray-800 font-medium">{doc.fullName || doc.email}</p>
                  <p className="text-xs text-gray-500">Especialidad: {doc.specialty} | Licencia: {doc.professionalRegistration}</p>
                </div>
                <button
  onClick={() => handleApproveDoctor(doc)}
  className="rounded-md bg-indigo-600 px-4 py-2 text-white text-sm font-medium hover:bg-indigo-700 transition"
>
  Aprobar Doctor
</button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}