'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Obtenemos el rol guardado en localStorage al iniciar sesión
    const role = localStorage.getItem('userRole');

    if (role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else if (role === 'DOCTOR') {
      router.push('/dashboard/doctor');
    } else if (role === 'PATIENT') {
      router.push('/dashboard/patient');
    } else if (role === 'FAMILY') {
      router.push('/dashboard/family');
    } else {
      // Si no hay rol o sesión, redirige al login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600 font-medium">Redirigiendo a tu panel...</p>
    </div>
  );
}