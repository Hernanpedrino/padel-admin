'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { botonGuardar, botonPrimario, inputClase, labelClase, tdClase, thClase } from '@/lib/formato';

interface UsuarioPanel {
  id: string;
  rol: 'SUPERADMIN' | 'ADMIN';
  nombre: string;
  email: string;
  activo: boolean;
  complejo: { id: string; nombre: string } | null;
}

const formVacio = { nombre: '', email: '', password: '', complejoId: '' };

export default function AdminsPage() {
  const [usuarios, setUsuarios] = useState<UsuarioPanel[]>([]);
  const [complejos, setComplejos] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  const fetchData = async () => {
    const [a, o] = await Promise.all([api.get('/organizacion/admins'), api.get('/organizacion')]);
    setUsuarios(a.data);
    setComplejos(o.data.complejos);
    setLoading(false);
  };

  useEffect(() => {
    fetchData().catch((err) => {
      alert(mensajeError(err));
      setLoading(false);
    });
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizacion/admins', form);
      setForm(formVacio);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const actualizar = async (id: string, data: Record<string, unknown>) => {
    try {
      await api.patch(`/organizacion/admins/${id}`, data);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const cambiarPassword = (u: UsuarioPanel) => {
    const password = prompt(`Nueva contraseña para ${u.nombre} (mínimo 8 caracteres):`);
    if (password) actualizar(u.id, { password });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Administradores</h2>
          <p className="text-sm text-gray-500">Cada administrador opera un complejo: turnos, reservas, torneos y clases.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={botonPrimario} disabled={complejos.length === 0}>
          {showForm ? 'Cancelar' : '+ Nuevo administrador'}
        </button>
      </div>

      {complejos.length === 0 && !loading && (
        <p className="text-gray-500 mb-4">Primero creá un complejo en &quot;Mi organización&quot;.</p>
      )}

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 grid grid-cols-4 gap-4 items-end">
          <div>
            <label className={labelClase}>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Contraseña inicial</label>
            <input type="password" minLength={8} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClase} required />
          </div>
          <div>
            <label className={labelClase}>Complejo</label>
            <select value={form.complejoId} onChange={(e) => setForm({ ...form, complejoId: e.target.value })} className={inputClase} required>
              <option value="">Elegí un complejo</option>
              {complejos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-span-4 flex justify-end">
            <button type="submit" className={botonGuardar}>Crear</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className={thClase}>Nombre</th>
                <th className={thClase}>Rol</th>
                <th className={thClase}>Complejo</th>
                <th className={thClase}>Estado</th>
                <th className={thClase}></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td className={tdClase}>
                    <p className="font-medium text-gray-800">{u.nombre}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </td>
                  <td className={tdClase}>{u.rol === 'SUPERADMIN' ? 'Superadmin' : 'Administrador'}</td>
                  <td className={tdClase}>
                    {u.rol === 'ADMIN' ? (
                      <select
                        value={u.complejo?.id ?? ''}
                        onChange={(e) => actualizar(u.id, { complejoId: e.target.value })}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {complejos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    ) : (
                      <span className="text-gray-500 text-sm">Todos</span>
                    )}
                  </td>
                  <td className={tdClase}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`${tdClase} text-right space-x-2`}>
                    {u.rol === 'ADMIN' && (
                      <>
                        <button onClick={() => cambiarPassword(u)} className="text-sm text-gray-600 hover:underline">
                          Cambiar contraseña
                        </button>
                        <button
                          onClick={() => actualizar(u.id, { activo: !u.activo })}
                          className={`text-sm px-3 py-1 rounded-lg transition ${u.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </>
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
