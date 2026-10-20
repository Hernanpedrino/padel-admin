'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import EstadoBadge from '@/components/EstadoBadge';
import { formatoFechaHora, formatoPrecio, tdClase, thClase } from '@/lib/formato';

interface Persona {
  nombre: string;
  apellido: string;
}

interface Pago {
  id: string;
  monto: string;
  metodo: string;
  estado: string;
  referencia: string | null;
  creadoEn: string;
  reserva: { usuario: Persona; turno: { fechaHoraInicio: string; cancha: { nombre: string } } } | null;
  inscripcionTorneo: { torneo: { nombre: string }; jugador1: Persona; jugador2: Persona } | null;
  inscripcionClase: { clase: { profesor: string; fechaHoraInicio: string }; usuario: Persona } | null;
}

const persona = (p: Persona) => `${p.nombre} ${p.apellido}`;

function concepto(pago: Pago) {
  if (pago.inscripcionTorneo) {
    const i = pago.inscripcionTorneo;
    return { titulo: `Torneo: ${i.torneo.nombre}`, quien: `${persona(i.jugador1)} / ${persona(i.jugador2)}` };
  }
  if (pago.inscripcionClase) {
    const i = pago.inscripcionClase;
    return { titulo: `Clase con ${i.clase.profesor}`, quien: persona(i.usuario) };
  }
  if (pago.reserva) {
    const r = pago.reserva;
    return { titulo: `Reserva ${r.turno.cancha.nombre} · ${formatoFechaHora(r.turno.fechaHoraInicio)}`, quien: persona(r.usuario) };
  }
  return { titulo: '-', quien: '' };
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [deshabilitado, setDeshabilitado] = useState<string>();

  const fetchPagos = async (estado: string) => {
    try {
      const { data } = await api.get('/pagos', { params: { estado: estado || undefined } });
      setPagos(data);
    } catch (err) {
      // El backend responde 403 si el complejo no tiene el módulo de cobros
      setDeshabilitado(mensajeError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos(filtro);
  }, [filtro]);

  const cambiarEstado = async (pago: Pago, estado: string) => {
    try {
      await api.patch(`/pagos/${pago.id}`, { estado });
      fetchPagos(filtro);
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  if (deshabilitado) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cobros</h2>
        <div className="bg-white rounded-xl p-6 shadow-sm text-gray-600">
          <p>{deshabilitado}.</p>
          <p className="text-sm text-gray-500 mt-2">El superadmin lo puede habilitar desde &quot;Mi organización&quot;.</p>
        </div>
      </div>
    );
  }

  const total = pagos.filter((p) => p.estado === 'APROBADO').reduce((t, p) => t + Number(p.monto), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cobros</h2>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="APROBADO">Aprobados</option>
          <option value="RECHAZADO">Rechazados</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : pagos.length === 0 ? (
        <p className="text-gray-500">No hay pagos registrados. Se cargan desde el detalle de cada torneo o clase.</p>
      ) : (
        <>
          <p className="text-gray-600 mb-3">Total aprobado en la lista: <strong>{formatoPrecio(total)}</strong></p>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className={thClase}>Fecha</th>
                  <th className={thClase}>Concepto</th>
                  <th className={thClase}>Monto</th>
                  <th className={thClase}>Método</th>
                  <th className={thClase}>Estado</th>
                  <th className={thClase}></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagos.map((p) => {
                  const c = concepto(p);
                  return (
                    <tr key={p.id}>
                      <td className={`${tdClase} text-sm`}>{formatoFechaHora(p.creadoEn)}</td>
                      <td className={tdClase}>
                        <p className="text-gray-800">{c.titulo}</p>
                        <p className="text-sm text-gray-500">{c.quien}</p>
                      </td>
                      <td className={tdClase}>{formatoPrecio(p.monto)}</td>
                      <td className={`${tdClase} text-sm capitalize`}>
                        {p.metodo.toLowerCase()}
                        {p.referencia && <p className="text-gray-500">{p.referencia}</p>}
                      </td>
                      <td className={tdClase}><EstadoBadge estado={p.estado} /></td>
                      <td className={`${tdClase} text-right space-x-2 whitespace-nowrap`}>
                        {p.estado !== 'APROBADO' && (
                          <button onClick={() => cambiarEstado(p, 'APROBADO')} className="text-sm text-green-700 hover:underline">Aprobar</button>
                        )}
                        {p.estado !== 'RECHAZADO' && (
                          <button onClick={() => cambiarEstado(p, 'RECHAZADO')} className="text-sm text-red-600 hover:underline">Rechazar</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
