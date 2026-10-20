'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { pagosHabilitados } from '@/lib/complejo';
import EstadoBadge from '@/components/EstadoBadge';
import RegistrarPago, { PagoRegistrado } from '@/components/RegistrarPago';
import {
  etiquetaCategoria,
  etiquetaRama,
  formatoFecha,
  formatoPrecio,
  tdClase,
  thClase,
} from '@/lib/formato';
import { Torneo } from '../tipos';

interface Jugador {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  categoria: string | null;
}

interface Inscripcion {
  id: string;
  estado: string;
  creadoEn: string;
  jugador1: Jugador;
  jugador2: Jugador;
  pagos: PagoRegistrado[];
}

const ORDEN_ESTADO: Record<string, number> = { PENDIENTE: 0, CONFIRMADA: 1, RECHAZADA: 2, CANCELADA: 3 };

export default function TorneoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [torneo, setTorneo] = useState<Torneo>();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cobros, setCobros] = useState(false);

  const fetchData = async () => {
    // No hay endpoint de detalle para el admin: se toma de la lista del complejo
    const [lista, insc, conCobros] = await Promise.all([
      api.get('/torneos/mi-complejo'),
      api.get(`/torneos/${id}/inscripciones`),
      pagosHabilitados(),
    ]);
    setTorneo(lista.data.find((t: Torneo) => t.id === id));
    setInscripciones(
      [...insc.data].sort((a: Inscripcion, b: Inscripcion) => ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado]),
    );
    setCobros(conCobros);
  };

  useEffect(() => {
    fetchData().catch((err) => alert(mensajeError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const responder = async (inscripcion: Inscripcion, estado: 'CONFIRMADA' | 'RECHAZADA') => {
    try {
      await api.patch(`/torneos/inscripciones/${inscripcion.id}`, { estado });
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  if (!torneo) return <p className="text-gray-500">Cargando...</p>;

  const confirmadas = inscripciones.filter((i) => i.estado === 'CONFIRMADA').length;
  const pendientes = inscripciones.filter((i) => i.estado === 'PENDIENTE').length;
  const jugador = (j: Jugador) => (
    <div>
      <p className="text-gray-800">{j.nombre} {j.apellido} <span className="text-gray-500 text-sm">({etiquetaCategoria(j.categoria)})</span></p>
      <p className="text-sm text-gray-500">{j.telefono ?? j.email}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/torneos" className="text-sm text-blue-600 hover:underline">← Torneos</Link>
        <div className="flex items-center gap-3 mt-2">
          <h2 className="text-2xl font-bold text-gray-800">{torneo.nombre}</h2>
          <EstadoBadge estado={torneo.estado} />
        </div>
        <p className="text-gray-500">
          {etiquetaCategoria(torneo.categoria)} · {etiquetaRama(torneo.rama)} · {formatoFecha(torneo.fechaInicio)} – {formatoFecha(torneo.fechaFin)}
        </p>
        {torneo.descripcion && <p className="text-gray-600 mt-2">{torneo.descripcion}</p>}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Confirmadas</p>
          <p className="text-lg font-semibold text-gray-800">{confirmadas} de {torneo.cupoParejas}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className={`text-lg font-semibold ${pendientes ? 'text-yellow-700' : 'text-gray-800'}`}>{pendientes}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Inscripción</p>
          <p className="text-lg font-semibold text-gray-800">{formatoPrecio(torneo.precioInscripcion)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Cierre de inscripción</p>
          <p className="text-lg font-semibold text-gray-800">{formatoFecha(torneo.cierreInscripcion)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h3 className="font-semibold text-gray-800 p-6 pb-3">Parejas inscriptas</h3>
        {inscripciones.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-500">Todavía no hay inscripciones.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className={thClase}>Jugador 1</th>
                <th className={thClase}>Jugador 2</th>
                <th className={thClase}>Inscripta</th>
                <th className={thClase}>Estado</th>
                {cobros && <th className={thClase}>Cobro</th>}
                <th className={thClase}></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inscripciones.map((i) => (
                <tr key={i.id}>
                  <td className={tdClase}>{jugador(i.jugador1)}</td>
                  <td className={tdClase}>{jugador(i.jugador2)}</td>
                  <td className={`${tdClase} text-sm`}>{formatoFecha(i.creadoEn)}</td>
                  <td className={tdClase}><EstadoBadge estado={i.estado} /></td>
                  {cobros && (
                    <td className={tdClase}>
                      {['PENDIENTE', 'CONFIRMADA'].includes(i.estado) && (
                        <RegistrarPago
                          destino={{ inscripcionTorneoId: i.id }}
                          montoSugerido={torneo.precioInscripcion}
                          pagos={i.pagos}
                          onRegistrado={fetchData}
                        />
                      )}
                    </td>
                  )}
                  <td className={`${tdClase} text-right space-x-2 whitespace-nowrap`}>
                    {i.estado === 'PENDIENTE' && (
                      <>
                        <button onClick={() => responder(i, 'CONFIRMADA')}
                          className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg hover:bg-green-100">
                          Confirmar
                        </button>
                        <button onClick={() => responder(i, 'RECHAZADA')}
                          className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100">
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
