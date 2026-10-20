'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { elegirComplejo, mensajeError } from '@/lib/sesion';
import { botonGuardar, botonPrimario, formatoFecha, inputClase, labelClase, tdClase, thClase } from '@/lib/formato';

interface Complejo {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  pagosHabilitados: boolean;
  _count: { canchas: number };
}

interface MiOrganizacion {
  nombre: string;
  vencimiento: string | null;
  plan: { nombre: string; maxComplejos: number | null; maxCanchas: number | null } | null;
  complejos: Complejo[];
}

const formVacio = { nombre: '', direccion: '', telefono: '', email: '' };

export default function OrganizacionPage() {
  const [org, setOrg] = useState<MiOrganizacion>();
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<string>();
  const [form, setForm] = useState(formVacio);

  const fetchOrg = async () => {
    const { data } = await api.get('/organizacion');
    setOrg(data);
  };

  useEffect(() => {
    fetchOrg().catch((err) => alert(mensajeError(err)));
  }, []);

  const abrirNuevo = () => {
    setEditando(undefined);
    setForm(formVacio);
    setShowForm(!showForm || !!editando);
  };

  const abrirEdicion = (c: Complejo) => {
    setEditando(c.id);
    setForm({ nombre: c.nombre, direccion: c.direccion, telefono: c.telefono, email: c.email });
    setShowForm(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.patch(`/organizacion/complejos/${editando}`, form);
      } else {
        await api.post('/organizacion/complejos', form);
      }
      setShowForm(false);
      setEditando(undefined);
      fetchOrg();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const handlePagos = async (c: Complejo) => {
    try {
      await api.patch(`/organizacion/complejos/${c.id}`, { pagosHabilitados: !c.pagosHabilitados });
      fetchOrg();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const operar = (c: Complejo) => {
    elegirComplejo({ id: c.id, nombre: c.nombre });
    // Recarga completa para que el menú y las páginas tomen el complejo elegido
    window.location.href = '/dashboard/canchas';
  };

  if (!org) return <p className="text-gray-500">Cargando...</p>;

  const totalCanchas = org.complejos.reduce((t, c) => t + c._count.canchas, 0);
  const limite = (usado: number, max: number | null | undefined) => (max ? `${usado} de ${max}` : `${usado}`);
  const vencido = !org.vencimiento || new Date(org.vencimiento) < new Date();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{org.nombre}</h2>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Plan</p>
          <p className="text-lg font-semibold text-gray-800">{org.plan?.nombre ?? 'Sin plan'}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Servicio pago hasta</p>
          <p className={`text-lg font-semibold ${vencido ? 'text-red-700' : 'text-gray-800'}`}>
            {org.vencimiento ? formatoFecha(org.vencimiento) : 'Sin pagos'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Complejos</p>
          <p className="text-lg font-semibold text-gray-800">{limite(org.complejos.length, org.plan?.maxComplejos)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Canchas</p>
          <p className="text-lg font-semibold text-gray-800">{limite(totalCanchas, org.plan?.maxCanchas)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Complejos</h3>
          <button onClick={abrirNuevo} className={botonPrimario}>
            {showForm && !editando ? 'Cancelar' : '+ Nuevo complejo'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleGuardar} className="bg-white rounded-xl p-6 shadow-sm mb-4 grid grid-cols-4 gap-4 items-end">
            <div>
              <label className={labelClase}>Nombre</label>
              <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Dirección</label>
              <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Teléfono</label>
              <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClase} required />
            </div>
            <div className="col-span-4 flex justify-end gap-2">
              {editando && (
                <button type="button" onClick={() => { setShowForm(false); setEditando(undefined); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancelar
                </button>
              )}
              <button type="submit" className={botonGuardar}>{editando ? 'Guardar cambios' : 'Crear complejo'}</button>
            </div>
          </form>
        )}

        {org.complejos.length === 0 ? (
          <p className="text-gray-500">Todavía no cargaste complejos.</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className={thClase}>Complejo</th>
                  <th className={thClase}>Contacto</th>
                  <th className={thClase}>Canchas</th>
                  <th className={thClase}>Cobros</th>
                  <th className={thClase}></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {org.complejos.map((c) => (
                  <tr key={c.id}>
                    <td className={tdClase}>
                      <p className="font-medium text-gray-800">{c.nombre}</p>
                      <p className="text-sm text-gray-500">{c.direccion}</p>
                    </td>
                    <td className={`${tdClase} text-sm`}>{c.telefono}<br />{c.email}</td>
                    <td className={tdClase}>{c._count.canchas}</td>
                    <td className={tdClase}>
                      <button
                        onClick={() => handlePagos(c)}
                        title="Módulo opcional para registrar pagos de reservas e inscripciones"
                        className={`text-sm px-3 py-1 rounded-lg transition ${c.pagosHabilitados ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {c.pagosHabilitados ? 'Habilitado' : 'Deshabilitado'}
                      </button>
                    </td>
                    <td className={`${tdClase} text-right space-x-2`}>
                      <button onClick={() => abrirEdicion(c)} className="text-sm text-gray-600 hover:underline">Editar</button>
                      <button onClick={() => operar(c)} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100">
                        Operar →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
