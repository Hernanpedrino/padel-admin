'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
}

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface TurnoFijo {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
  fechaDesde: string;
  fechaHasta: string | null;
  activo: boolean;
  cancha: Cancha;
  usuario: Usuario;
}

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export default function TurnosFijosPage() {
  const [turnosFijos, setTurnosFijos] = useState<TurnoFijo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGenerar, setShowGenerar] = useState<string | null>(null);
  const [form, setForm] = useState({
    canchaId: '',
    usuarioEmail: '',
    diaSemana: 'lunes',
    horaInicio: '08',
    minInicio: '00',
    horaFin: '09',
    minFin: '30',
    fechaDesde: '',
    fechaHasta: '',
    precio: '',
  });
  const [formGenerar, setFormGenerar] = useState({
    fechaDesde: '',
    fechaHasta: '',
    precio: '',
  });

  const horas = Array.from({ length: 17 }, (_, i) => (i + 7).toString().padStart(2, '0'));
  const minutos = ['00', '30'];

  const fetchData = async () => {
    const [tf, ca] = await Promise.all([
      api.get('/turnos-fijos'),
      api.get('/canchas'),
    ]);
    setTurnosFijos(tf.data);
    setCanchas(ca.data.filter((c: any) => c.activa));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const buscarUsuario = async () => {
    try {
      const { data } = await api.get('/auth/usuario/buscar', { params: { email: form.usuarioEmail } });
      setUsuarios([data]);
    } catch {
      setUsuarios([]);
      alert('Usuario no encontrado');
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarios.length === 0) return alert('Buscá un usuario primero');

    await api.post('/turnos-fijos', {
      canchaId: form.canchaId,
      usuarioId: usuarios[0].id,
      diaSemana: form.diaSemana,
      horaInicio: `${form.horaInicio}:${form.minInicio}`,
      horaFin: `${form.horaFin}:${form.minFin}`,
      fechaDesde: form.fechaDesde,
      fechaHasta: form.fechaHasta || undefined,
      precio: parseFloat(form.precio),
    });

    setShowForm(false);
    setUsuarios([]);
    setForm({ canchaId: '', usuarioEmail: '', diaSemana: 'lunes', horaInicio: '08', minInicio: '00', horaFin: '09', minFin: '30', fechaDesde: '', fechaHasta: '', precio: '' });
    fetchData();
  };

  const handleGenerar = async (turnoFijoId: string) => {
    try {
      const { data } = await api.post('/turnos-fijos/generar', {
        turnoFijoId,
        fechaDesde: formGenerar.fechaDesde,
        fechaHasta: formGenerar.fechaHasta,
        precio: parseFloat(formGenerar.precio),
      });
      alert(`✅ Se generaron ${data.generados} turnos`);
      setShowGenerar(null);
      setFormGenerar({ fechaDesde: '', fechaHasta: '', precio: '' });
    } catch {
      alert('Error al generar turnos');
    }
  };

  const handleDesactivar = async (id: string) => {
    await api.patch(`/turnos-fijos/${id}/desactivar`);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Turnos fijos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nuevo turno fijo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancha</label>
              <select
                value={form.canchaId}
                onChange={(e) => setForm({ ...form, canchaId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccioná una cancha</option>
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana</label>
              <select
                value={form.diaSemana}
                onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DIAS.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
              <div className="flex gap-2">
                <select value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2">
                  {horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={form.minInicio} onChange={(e) => setForm({ ...form, minInicio: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2">
                  {minutos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
              <div className="flex gap-2">
                <select value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2">
                  {horas.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select value={form.minFin} onChange={(e) => setForm({ ...form, minFin: e.target.value })} className="flex-1 border border-gray-300 rounded-lg px-4 py-2">
                  {minutos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
              <input type="date" value={form.fechaDesde} onChange={(e) => setForm({ ...form, fechaDesde: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta (opcional)</label>
              <input type="date" value={form.fechaHasta} onChange={(e) => setForm({ ...form, fechaHasta: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (buscá por email)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.usuarioEmail}
                  onChange={(e) => setForm({ ...form, usuarioEmail: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="juan@gmail.com"
                />
                <button type="button" onClick={buscarUsuario} className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                  Buscar
                </button>
              </div>
              {usuarios.length > 0 && (
                <p className="text-green-600 text-sm mt-1">✅ {usuarios[0].nombre} {usuarios[0].apellido}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Guardar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : turnosFijos.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <p className="text-gray-400 text-lg">No hay turnos fijos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {turnosFijos.map((tf) => (
            <div key={tf.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-800">{tf.cancha.nombre}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tf.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tf.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-gray-600 capitalize">{tf.diaSemana} · {tf.horaInicio} - {tf.horaFin}</p>
                  <p className="text-gray-500 text-sm">{tf.usuario.nombre} {tf.usuario.apellido} — {tf.usuario.email}</p>
                  <p className="text-gray-400 text-sm">Desde {new Date(tf.fechaDesde).toLocaleDateString('es-AR')}
                    {tf.fechaHasta ? ` hasta ${new Date(tf.fechaHasta).toLocaleDateString('es-AR')}` : ' (sin fecha de fin)'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {tf.activo && (
                    <>
                      <button
                        onClick={() => setShowGenerar(showGenerar === tf.id ? null : tf.id)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-100 transition"
                      >
                        Generar turnos
                      </button>
                      <button
                        onClick={() => handleDesactivar(tf.id)}
                        className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-100 transition"
                      >
                        Desactivar
                      </button>
                    </>
                  )}
                </div>
              </div>

              {showGenerar === tf.id && (
                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <input type="date" value={formGenerar.fechaDesde}
                      onChange={(e) => setFormGenerar({ ...formGenerar, fechaDesde: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input type="date" value={formGenerar.fechaHasta}
                      onChange={(e) => setFormGenerar({ ...formGenerar, fechaHasta: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input type="number" value={formGenerar.precio}
                      onChange={(e) => setFormGenerar({ ...formGenerar, precio: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2" placeholder="2500" />
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <button
                      onClick={() => handleGenerar(tf.id)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Generar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}