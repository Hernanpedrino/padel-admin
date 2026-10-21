'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { pagosHabilitados } from '@/lib/complejo';
import { avisarCambioPendientes } from '@/lib/pendientes';
import EstadoBadge from '@/components/EstadoBadge';
import RegistrarPago, { PagoRegistrado } from '@/components/RegistrarPago';
import { etiquetaCategoria, formatoFecha, formatoHora, formatoPrecio, tdClase, thClase } from '@/lib/formato';
import { Clase } from '../tipos';

interface Inscripcion {
  id: string;
  estado: string;
  creadoEn: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
    categoria: string | null;
  };
  pagos: PagoRegistrado[];
}

const ORDEN_ESTADO: Record<string, number> = { PENDIENTE: 0, CONFIRMADA: 1, RECHAZADA: 2, CANCELADA: 3 };

export default function ClaseDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [clase, setClase] = useState<Clase>();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [cobros, setCobros] = useState(false);

  const fetchData = async () => {
    // No hay endpoint de detalle para el admin: se toma de la lista del complejo
    const [lista, insc, conCobros] = await Promise.all([
      api.get('/clases/mi-complejo'),
      api.get(`/clases/${id}/inscripciones`),
      pagosHabilitados(),
    ]);
    setClase(lista.data.find((c: Clase) => c.id === id));
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
      await api.patch(`/clases/inscripciones/${inscripcion.id}`, { estado });
      avisarCambioPendientes();
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  if (!clase) return <p className="text-gray-500">Cargando...</p>;

  const confirmadas = inscripciones.filter((i) => i.estado === 'CONFIRMADA').length;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/clases" className="text-sm text-blue-600 hover:underline">← Clases</Link>
        <div className="flex items-center gap-3 mt-2">
          <h2 className="text-2xl font-bold text-gray-800">Clase con {clase.profesor}</h2>
          <EstadoBadge estado={clase.estado} />
        </div>
        <p className="text-gray-500">
          {formatoFecha(clase.fechaHoraInicio)} · {formatoHora(clase.fechaHoraInicio)} – {formatoHora(clase.fechaHoraFin)} ·{' '}
          {clase.cancha.nombre} · {clase.nivel ? etiquetaCategoria(clase.nivel) : 'Todos los niveles'} · {formatoPrecio(clase.precio)}
        </p>
        {clase.descripcion && <p className="text-gray-600 mt-2">{clase.descripcion}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <h3 className="font-semibold text-gray-800 p-6 pb-3">Inscriptos · {confirmadas} de {clase.cupo} confirmados</h3>
        {inscripciones.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-500">Todavía no hay inscriptos.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className={thClase}>Jugador</th>
                <th className={thClase}>Contacto</th>
                <th className={thClase}>Estado</th>
                {cobros && <th className={thClase}>Cobro</th>}
                <th className={thClase}></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inscripciones.map((i) => (
                <tr key={i.id}>
                  <td className={tdClase}>
                    {i.usuario.nombre} {i.usuario.apellido}
                    <span className="text-gray-500 text-sm"> ({etiquetaCategoria(i.usuario.categoria)})</span>
                  </td>
                  <td className={`${tdClase} text-sm`}>{i.usuario.telefono ?? '-'}<br />{i.usuario.email}</td>
                  <td className={tdClase}><EstadoBadge estado={i.estado} /></td>
                  {cobros && (
                    <td className={tdClase}>
                      {['PENDIENTE', 'CONFIRMADA'].includes(i.estado) && (
                        <RegistrarPago
                          destino={{ inscripcionClaseId: i.id }}
                          montoSugerido={clase.precio}
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
