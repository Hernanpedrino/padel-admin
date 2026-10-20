'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNombre } from '@/lib/sesion';

const ACCESOS = [
  { href: '/dashboard/canchas', titulo: '🎾 Canchas', texto: 'Alta y estado de las canchas del complejo' },
  { href: '/dashboard/turnos', titulo: '📅 Turnos', texto: 'Publicá turnos libres para que se reserven desde la app' },
  { href: '/dashboard/reservas', titulo: '📋 Reservas', texto: 'Reservas confirmadas por los jugadores' },
  { href: '/dashboard/turnos-fijos', titulo: '📌 Turnos fijos', texto: 'Jugadores con horario semanal reservado' },
];

export default function DashboardPage() {
  const [nombre, setNombre] = useState<string>();

  useEffect(() => {
    setNombre(getNombre());
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Hola{nombre ? `, ${nombre}` : ''}</h2>
      <div className="grid grid-cols-2 gap-4">
        {ACCESOS.map((a) => (
          <Link key={a.href} href={a.href} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <p className="text-lg font-semibold text-gray-800">{a.titulo}</p>
            <p className="text-sm text-gray-500 mt-1">{a.texto}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
