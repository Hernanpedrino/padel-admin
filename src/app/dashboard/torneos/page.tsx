'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import EstadoBadge from '@/components/EstadoBadge';
import {
  CATEGORIAS,
  RAMAS,
  botonGuardar,
  botonPrimario,
  etiquetaCategoria,
  etiquetaRama,
  finDelDia,
  formatoFecha,
  formatoPrecio,
  inicioDelDia,
  inputClase,
  labelClase,
  tdClase,
  thClase,
} from '@/lib/formato';
import { SIGUIENTES_ESTADOS, Torneo } from './tipos';

const formVacio = {
  nombre: '',
  descripcion: '',
  categoria: 'SEXTA',
  rama: 'MASCULINO',
  fechaInicio: '',
  fechaFin: '',
  cierreInscripcion: '',
  cupoParejas: '16',
  precioInscripcion: '',
  publicar: true,
};

// La inscripción cierra al final del día elegido, así que tiene que ser antes del día de inicio
function diaAnterior(fecha: string) {
  if (!fecha) return undefined;
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv-SE');
}

export default function TorneosPage() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  const fetchTorneos = async () => {
    const { data } = await api.get('/torneos/mi-complejo');
    setTorneos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTorneos().catch((err) => {
      alert(mensajeError(err));
      setLoading(false);
    });
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/torneos', {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        categoria: form.categoria,
        rama: form.rama,
        fechaInicio: inicioDelDia(form.fechaInicio),
        fechaFin: finDelDia(form.fechaFin),
        // La inscripción cierra al terminar el día elegido
        cierreInscripcion: finDelDia(form.cierreInscripcion),
        cupoParejas: parseInt(form.cupoParejas, 10),
        precioInscripcion: parseFloat(form.precioInscripcion),
        estado: form.publicar ? 'PUBLICADO' : 'BORRADOR',
      });
      setForm(formVacio);
      setShowForm(false);
      fetchTorneos();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const cambiarEstado = async (torneo: Torneo, estado: string) => {
    if (estado === 'CANCELADO' && !confirm(`¿Cancelar el torneo "${torneo.nombre}"?`)) return;
    try {
      await api.patch(`/torneos/${torneo.id}`, { estado });
      fetchTorneos();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Torneos</h2>
        <button onClick={() => setShowForm(!showForm)} className={botonPrimario}>
          {showForm ? 'Cancelar' : '+ Nuevo torneo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 grid grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label className={labelClase}>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={inputClase} placeholder="Torneo de Primavera" required />
          </div>
          <div>
            <label className={labelClase}>Categoría</label>
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={inputClase}>
              {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClase}>Rama</label>
            <select value={form.rama} onChange={(e) => setForm({ ...form, rama: e.target.value })} className={inputClase}>
              {RAMAS.map((r) => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
            </select>
          </div>
          <div className="col-span-4">
            <label className={labelClase}>Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={inputClase} placeholder="Formato, premios, horarios..." />
          </div>
          <div>
            <label className={labelClase}>Inicio</label>
            <input type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
              className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Fin</label>
            <input type="date" value={form.fechaFin} min={form.fechaInicio}
              onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Cierre de inscripción</label>
            <input type="date" value={form.cierreInscripcion} max={diaAnterior(form.fechaInicio)}
              onChange={(e) => setForm({ ...form, cierreInscripcion: e.target.value })} className={inputClase} required />
          </div>
          <div />
          <div>
            <label className={labelClase}>Cupo (parejas)</label>
            <input type="number" min="2" value={form.cupoParejas}
              onChange={(e) => setForm({ ...form, cupoParejas: e.target.value })} className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Inscripción por pareja</label>
            <input type="number" min="0" step="0.01" value={form.precioInscripcion}
              onChange={(e) => setForm({ ...form, precioInscripcion: e.target.value })} className={inputClase} required />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
            <input type="checkbox" checked={form.publicar} onChange={(e) => setForm({ ...form, publicar: e.target.checked })} />
            Publicar ya en la app
          </label>
          <div className="flex justify-end">
            <button type="submit" className={botonGuardar}>Crear torneo</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : torneos.length === 0 ? (
        <p className="text-gray-500">Todavía no hay torneos.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className={thClase}>Torneo</th>
                <th className={thClase}>Fechas</th>
                <th className={thClase}>Inscriptos</th>
                <th className={thClase}>Inscripción</th>
                <th className={thClase}>Estado</th>
                <th className={thClase}></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {torneos.map((t) => (
                <tr key={t.id}>
                  <td className={tdClase}>
                    <Link href={`/dashboard/torneos/${t.id}`} className="font-medium text-blue-600 hover:underline">{t.nombre}</Link>
                    <p className="text-sm text-gray-500">{etiquetaCategoria(t.categoria)} · {etiquetaRama(t.rama)}</p>
                  </td>
                  <td className={`${tdClase} text-sm`}>
                    {formatoFecha(t.fechaInicio)} – {formatoFecha(t.fechaFin)}
                    <p className="text-gray-500">Cierra {formatoFecha(t.cierreInscripcion)}</p>
                  </td>
                  <td className={tdClase}>{t._count.inscripciones} / {t.cupoParejas}</td>
                  <td className={tdClase}>{formatoPrecio(t.precioInscripcion)}</td>
                  <td className={tdClase}><EstadoBadge estado={t.estado} /></td>
                  <td className={`${tdClase} text-right space-x-2 whitespace-nowrap`}>
                    {SIGUIENTES_ESTADOS[t.estado]?.map((s) => (
                      <button key={s.estado} onClick={() => cambiarEstado(t, s.estado)}
                        className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100">
                        {s.accion}
                      </button>
                    ))}
                    {!['FINALIZADO', 'CANCELADO'].includes(t.estado) && (
                      <button onClick={() => cambiarEstado(t, 'CANCELADO')} className="text-sm text-red-600 hover:underline">
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
