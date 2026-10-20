'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { botonGuardar, botonPrimario, formatoFecha, inputClase, labelClase, tdClase, thClase } from '@/lib/formato';
import { Organizacion, Plan, estaVencida } from './tipos';

const formVacio = {
  nombre: '',
  cuit: '',
  emailContacto: '',
  telefono: '',
  planId: '',
  superadminNombre: '',
  superadminEmail: '',
  superadminPassword: '',
};

export default function ClientesPage() {
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(formVacio);

  const fetchData = async () => {
    const [orgs, pl] = await Promise.all([api.get('/manager/organizaciones'), api.get('/manager/planes')]);
    setOrganizaciones(orgs.data);
    setPlanes(pl.data.filter((p: Plan) => p.activo));
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
    setGuardando(true);
    try {
      await api.post('/manager/organizaciones', {
        nombre: form.nombre,
        cuit: form.cuit || undefined,
        emailContacto: form.emailContacto,
        telefono: form.telefono || undefined,
        planId: form.planId || undefined,
        superadmin: {
          nombre: form.superadminNombre,
          email: form.superadminEmail,
          password: form.superadminPassword,
        },
      });
      setForm(formVacio);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const campo = (key: keyof typeof formVacio, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className={labelClase}>{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={inputClase}
        {...props}
      />
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button onClick={() => setShowForm(!showForm)} className={botonPrimario}>
          {showForm ? 'Cancelar' : '+ Nuevo cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Datos del cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              {campo('nombre', 'Nombre / razón social', { required: true })}
              {campo('cuit', 'CUIT')}
              {campo('emailContacto', 'Email de contacto', { type: 'email', required: true })}
              {campo('telefono', 'Teléfono')}
              <div>
                <label className={labelClase}>Plan</label>
                <select
                  value={form.planId}
                  onChange={(e) => setForm({ ...form, planId: e.target.value })}
                  className={inputClase}
                >
                  <option value="">Sin plan</option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Superadmin</h3>
            <p className="text-sm text-gray-500 mb-3">Es la persona que va a administrar los complejos del cliente.</p>
            <div className="grid grid-cols-3 gap-4">
              {campo('superadminNombre', 'Nombre', { required: true })}
              {campo('superadminEmail', 'Email', { type: 'email', required: true })}
              {campo('superadminPassword', 'Contraseña inicial', { type: 'password', minLength: 8, required: true })}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={guardando} className={botonGuardar}>
              {guardando ? 'Guardando...' : 'Dar de alta'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : organizaciones.length === 0 ? (
        <p className="text-gray-500">Todavía no hay clientes.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className={thClase}>Cliente</th>
                <th className={thClase}>Plan</th>
                <th className={thClase}>Complejos</th>
                <th className={thClase}>Vence</th>
                <th className={thClase}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organizaciones.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className={tdClase}>
                    <Link href={`/dashboard/manager/organizaciones/${org.id}`} className="font-medium text-blue-600 hover:underline">
                      {org.nombre}
                    </Link>
                    <p className="text-sm text-gray-500">{org.emailContacto}</p>
                  </td>
                  <td className={tdClase}>{org.plan?.nombre ?? '-'}</td>
                  <td className={tdClase}>{org._count?.complejos ?? 0}</td>
                  <td className={tdClase}>
                    <span className={estaVencida(org) ? 'text-red-600 font-medium' : ''}>
                      {org.vencimiento ? formatoFecha(org.vencimiento) : 'Sin pagos'}
                    </span>
                  </td>
                  <td className={tdClase}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${org.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {org.estado === 'ACTIVA' ? 'Activa' : 'Suspendida'}
                    </span>
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
