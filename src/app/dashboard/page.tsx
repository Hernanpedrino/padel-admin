'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNombre } from '@/lib/sesion';
import { Pendientes, obtenerPendientes } from '@/lib/pendientes';

const ACCESOS = [
  { href: '/dashboard/canchas', titulo: '🎾 Canchas', texto: 'Alta y estado de las canchas del complejo' },
  { href: '/dashboard/turnos', titulo: '📅 Turnos', texto: 'Publicá turnos libres para que se reserven desde la app' },
  { href: '/dashboard/reservas', titulo: '📋 Reservas', texto: 'Reservas confirmadas por los jugadores' },
  { href: '/dashboard/turnos-fijos', titulo: '📌 Turnos fijos', texto: 'Jugadores con horario semanal reservado' },
  { href: '/dashboard/torneos', titulo: '🏆 Torneos', texto: 'Publicá torneos y confirmá las parejas inscriptas' },
  { href: '/dashboard/clases', titulo: '🎓 Clases', texto: 'Publicá clases y gestioná los inscriptos' },
];

export default function DashboardPage() {
  const [nombre, setNombre] = useState<string>();
  const [pendientes, setPendientes] = useState<Pendientes>();

  useEffect(() => {
    setNombre(getNombre());
    obtenerPendientes().then(setPendientes).catch(() => {});
  }, []);

  const avisos = pendientes
    ? [
        { cantidad: pendientes.torneos, href: '/dashboard/torneos', texto: (n: number) => `${n} ${n === 1 ? 'pareja espera' : 'parejas esperan'} confirmación en torneos` },
        { cantidad: pendientes.clases, href: '/dashboard/clases', texto: (n: number) => `${n} ${n === 1 ? 'jugador espera' : 'jugadores esperan'} confirmación en clases` },
        { cantidad: pendientes.pagos, href: '/dashboard/pagos', texto: (n: number) => `${n} ${n === 1 ? 'cobro pendiente' : 'cobros pendientes'} de aprobar` },
      ].filter((a) => a.cantidad > 0)
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Hola{nombre ? `, ${nombre}` : ''}</h2>

      {avisos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <p className="font-semibold text-amber-900 mb-2">⏳ Tenés cosas esperando tu confirmación</p>
          <ul className="space-y-1">
            {avisos.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="text-amber-800 hover:underline">
                  {a.texto(a.cantidad)} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
