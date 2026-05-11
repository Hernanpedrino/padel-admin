'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Reserva {
  id: string;
  estado: string;
  creadoEn: string;
  turno: {
    fechaHoraInicio: string;
    fechaHoraFin: string;
    precio: number;
    cancha: {
      nombre: string;
      tipo: string;
    };
  };
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservas = async () => {
    const { data } = await api.get('/reservas');
    setReservas(data);
    setLoading(false);
  };

  useEffect(() => { fetchReservas(); }, []);

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reservas</h2>
        <span className="text-sm text-gray-500">{reservas.length} reserva{reservas.length !== 1 ? 's' : ''} confirmada{reservas.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-400 text-lg">No hay reservas confirmadas</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Usuario</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cancha</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Inicio</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fin</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Precio</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Reservado el</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{reserva.usuario.nombre} {reserva.usuario.apellido}</p>
                    <p className="text-gray-500 text-sm">{reserva.usuario.email}</p>
                    {reserva.usuario.telefono && (
                      <p className="text-gray-500 text-sm">{reserva.usuario.telefono}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800">{reserva.turno.cancha.nombre}</p>
                    <p className="text-gray-500 text-sm capitalize">{reserva.turno.cancha.tipo.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatFecha(reserva.turno.fechaHoraInicio)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatFecha(reserva.turno.fechaHoraFin)}</td>
                  <td className="px-6 py-4 text-gray-600">${reserva.turno.precio}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatFecha(reserva.creadoEn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}