'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export default function FamilyDashboard() {
  const [links, setLinks] = useState<any[]>([]);
  const [patientEmail, setPatientEmail] = useState('');

  const loadLinks = () => {
    fetchApi('/api/family/links')
      .then((data) => setLinks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/api/family/invitations', {
        method: 'POST',
        body: JSON.stringify({ patientEmail }),
      });
      alert('Invitación enviada con éxito');
      setPatientEmail('');
    } catch (err: any) {
      alert(err.message || 'Error al enviar invitación');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-800">Panel Familiar - Vínculos</h1>
          
          <form onSubmit={handleSendInvitation} className="mt-4 flex gap-4">
            <input
              type="email"
              placeholder="Correo del paciente a vincular"
              required
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none"
            />
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700">
              Invitar Paciente
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pacientes Vinculados</h3>
          {links.length === 0 ? (
            <p className="text-gray-500">No tienes pacientes vinculados actualmente.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {links.map((link, idx) => (
                <li key={idx} className="py-3 text-gray-700">
                  Paciente ID: {link.patientId} - Relación: {link.relationship}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}