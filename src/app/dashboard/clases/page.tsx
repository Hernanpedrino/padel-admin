'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import EstadoBadge from '@/components/EstadoBadge';
import {
  CATEGORIAS,
  HORARIOS,
  botonGuardar,
  botonPrimario,
  etiquetaCategoria,
  fechaHoraIso,
  formatoFecha,
  formatoHora,
  formatoPrecio,
  inputClase,
  labelClase,
  tdClase,
  thClase,
} from '@/lib/formato';
import { Clase } from './tipos';

const formVacio = {
  canchaId: '',
  profesor: '',
  nivel: '',
  descripcion: '',
  fecha: '',
  horaInicio: '09:00',
  horaFin: '10:00',
  cupo: '4',
  precio: '',
};

export default function ClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [canchas, setCanchas] = useState<{ id: string; nombre: string; activa: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [verPasadas, setVerPasadas] = useState(false);
  const [form, setForm] = useState(formVacio);

  const fetchClases = async () => {
    const { data } = await api.get('/clases/mi-complejo');
    setClases(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClases().catch((err) => {
      alert(mensajeError(err));
      setLoading(false);
    });
    api.get('/canchas').then(({ data }) => setCanchas(data.filter((c: { activa: boolean }) => c.activa)));
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clases', {
        canchaId: form.canchaId,
        profesor: form.profesor,
        nivel: form.nivel || undefined,
        descripcion: form.descripcion || undefined,
        fechaHoraInicio: fechaHoraIso(form.fecha, form.horaInicio),
        fechaHoraFin: fechaHoraIso(form.fecha, form.horaFin),
        cupo: parseInt(form.cupo, 10),
        precio: parseFloat(form.precio),
      });
      setForm(formVacio);
      setShowForm(false);
      fetchClases();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const handleCancelar = async (clase: Clase) => {
    if (!confirm(`¿Cancelar la clase de ${clase.profesor} del ${formatoFecha(clase.fechaHoraInicio)}? Se cancelan también las inscripciones.`)) return;
    try {
      await api.patch(`/clases/${clase.id}/cancelar`);
      fetchClases();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const ahora = new Date();
  const visibles = clases
    .filter((c) => verPasadas || new Date(c.fechaHoraFin) >= ahora)
    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clases</h2>
        <button onClick={() => setShowForm(!showForm)} className={botonPrimario}>
          {showForm ? 'Cancelar' : '+ Nueva clase'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 grid grid-cols-4 gap-4 items-end">
          <div>
            <label className={labelClase}>Profesor</label>
            <input value={form.profesor} onChange={(e) => setForm({ ...form, profesor: e.target.value })}
              className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Cancha</label>
            <select value={form.canchaId} onChange={(e) => setForm({ ...form, canchaId: e.target.value })} className={inputClase} required>
              <option value="">Elegí una cancha</option>
              {canchas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClase}>Nivel</label>
            <select value={form.nivel} onChange={(e) => setForm({ ...form, nivel: e.target.value })} className={inputClase}>
              <option value="">Todos los niveles</option>
              {CATEGORIAS.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClase}>Fecha</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Desde</label>
            <select value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className={inputClase}>
              {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClase}>Hasta</label>
            <select value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} className={inputClase}>
              {HORARIOS.filter((h) => h > form.horaInicio).map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClase}>Cupo</label>
            <input type="number" min="1" value={form.cupo} onChange={(e) => setForm({ ...form, cupo: e.target.value })}
              className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Precio</label>
            <input type="number" min="0" step="0.01" value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })} className={inputClase} required />
          </div>
          <div className="col-span-3">
            <label className={labelClase}>Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={inputClase} placeholder="Técnica de bandeja, iniciación..." />
          </div>
          <div className="flex justify-end">
            <button type="submit" className={botonGuardar}>Publicar clase</button>
          </div>
        </form>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <input type="checkbox" checked={verPasadas} onChange={(e) => setVerPasadas(e.target.checked)} />
        Mostrar clases pasadas
      </label>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : visibles.length === 0 ? (
        <p className="text-gray-500">No hay clases próximas.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className={thClase}>Fecha</th>
                <th className={thClase}>Clase</th>
                <th className={thClase}>Cancha</th>
                <th className={thClase}>Inscriptos</th>
                <th className={thClase}>Precio</th>
                <th className={thClase}>Estado</th>
                <th className={thClase}></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visibles.map((c) => (
                <tr key={c.id}>
                  <td className={`${tdClase} text-sm`}>
                    {formatoFecha(c.fechaHoraInicio)}
                    <p className="text-gray-500">{formatoHora(c.fechaHoraInicio)} – {formatoHora(c.fechaHoraFin)}</p>
                  </td>
                  <td className={tdClase}>
                    <Link href={`/dashboard/clases/${c.id}`} className="font-medium text-blue-600 hover:underline">{c.profesor}</Link>
                    <p className="text-sm text-gray-500">{c.nivel ? etiquetaCategoria(c.nivel) : 'Todos los niveles'}</p>
                  </td>
                  <td className={tdClase}>{c.cancha.nombre}</td>
                  <td className={tdClase}>{c._count.inscripciones} / {c.cupo}</td>
                  <td className={tdClase}>{formatoPrecio(c.precio)}</td>
                  <td className={tdClase}><EstadoBadge estado={c.estado} /></td>
                  <td className={`${tdClase} text-right`}>
                    {c.estado === 'PUBLICADA' && new Date(c.fechaHoraInicio) > ahora && (
                      <button onClick={() => handleCancelar(c)} className="text-sm text-red-600 hover:underline">Cancelar</button>
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
