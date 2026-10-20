'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import {
  botonGuardar,
  finDelDia,
  formatoFecha,
  formatoPrecio,
  inicioDelDia,
  inputClase,
  labelClase,
  tdClase,
  thClase,
} from '@/lib/formato';
import { METODOS_PAGO, Organizacion, PagoServicio, Plan, estaVencida } from '../../tipos';

const pagoVacio = { monto: '', metodo: 'TRANSFERENCIA', periodoDesde: '', periodoHasta: '', referencia: '' };
const superadminVacio = { nombre: '', email: '', password: '' };

export default function OrganizacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<Organizacion>();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [pagos, setPagos] = useState<PagoServicio[]>([]);
  const [formPago, setFormPago] = useState(pagoVacio);
  const [formSuperadmin, setFormSuperadmin] = useState(superadminVacio);
  const [showPago, setShowPago] = useState(false);
  const [showSuperadmin, setShowSuperadmin] = useState(false);

  const fetchData = async () => {
    const [o, pl, pg] = await Promise.all([
      api.get(`/manager/organizaciones/${id}`),
      api.get('/manager/planes'),
      api.get(`/manager/organizaciones/${id}/pagos`),
    ]);
    setOrg(o.data);
    setPlanes(pl.data);
    setPagos(pg.data);
  };

  useEffect(() => {
    fetchData().catch((err) => alert(mensajeError(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const actualizar = async (data: Record<string, unknown>) => {
    try {
      await api.patch(`/manager/organizaciones/${id}`, data);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const handleEstado = () => {
    if (!org) return;
    const suspender = org.estado === 'ACTIVA';
    const mensaje = suspender
      ? `¿Suspender a ${org.nombre}? Sus usuarios no van a poder entrar al panel y sus complejos dejan de verse en la app.`
      : `¿Reactivar a ${org.nombre}?`;
    if (confirm(mensaje)) actualizar({ estado: suspender ? 'SUSPENDIDA' : 'ACTIVA' });
  };

  const abrirPago = () => {
    // Propone el precio del plan y el mes siguiente al vencimiento actual
    const desde = org?.vencimiento && !estaVencida(org) ? new Date(org.vencimiento) : new Date();
    const hasta = new Date(desde);
    hasta.setMonth(hasta.getMonth() + 1);
    const iso = (d: Date) => d.toLocaleDateString('sv-SE');
    setFormPago({
      ...pagoVacio,
      monto: org?.plan ? String(Number(org.plan.precioMensual)) : '',
      periodoDesde: iso(desde),
      periodoHasta: iso(hasta),
    });
    setShowPago(!showPago);
  };

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/manager/organizaciones/${id}/pagos`, {
        monto: parseFloat(formPago.monto),
        metodo: formPago.metodo,
        periodoDesde: inicioDelDia(formPago.periodoDesde),
        periodoHasta: finDelDia(formPago.periodoHasta),
        referencia: formPago.referencia || undefined,
      });
      setShowPago(false);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const handleSuperadmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/manager/organizaciones/${id}/superadmins`, formSuperadmin);
      setFormSuperadmin(superadminVacio);
      setShowSuperadmin(false);
      fetchData();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  if (!org) return <p className="text-gray-500">Cargando...</p>;

  const vencida = estaVencida(org);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/manager" className="text-sm text-blue-600 hover:underline">← Clientes</Link>
        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-gray-800">{org.nombre}</h2>
          <button
            onClick={handleEstado}
            className={`px-4 py-2 rounded-lg transition ${org.estado === 'ACTIVA' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
          >
            {org.estado === 'ACTIVA' ? 'Suspender' : 'Reactivar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Estado</p>
          <p className={`text-lg font-semibold ${org.estado === 'ACTIVA' ? 'text-green-700' : 'text-red-700'}`}>
            {org.estado === 'ACTIVA' ? 'Activa' : 'Suspendida'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">Servicio pago hasta</p>
          <p className={`text-lg font-semibold ${vencida ? 'text-red-700' : 'text-gray-800'}`}>
            {org.vencimiento ? formatoFecha(org.vencimiento) : 'Sin pagos'}
            {org.vencimiento && vencida && ' (vencido)'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <label className="text-sm text-gray-500">Plan</label>
          <select
            value={org.planId ?? ''}
            onChange={(e) => actualizar({ planId: e.target.value || null })}
            className="mt-1 w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin plan</option>
            {planes.filter((p) => p.activo || p.id === org.planId).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} — {formatoPrecio(p.precioMensual)}/mes</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Datos de contacto</h3>
        <dl className="grid grid-cols-3 gap-4 text-sm">
          <div><dt className="text-gray-500">Email</dt><dd className="text-gray-800">{org.emailContacto}</dd></div>
          <div><dt className="text-gray-500">Teléfono</dt><dd className="text-gray-800">{org.telefono ?? '-'}</dd></div>
          <div><dt className="text-gray-500">CUIT</dt><dd className="text-gray-800">{org.cuit ?? '-'}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 pb-3">
          <h3 className="font-semibold text-gray-800">Pagos del servicio</h3>
          <button onClick={abrirPago} className="text-sm text-blue-600 hover:underline">
            {showPago ? 'Cancelar' : '+ Registrar pago'}
          </button>
        </div>
        {showPago && (
          <form onSubmit={handlePago} className="px-6 pb-6 grid grid-cols-5 gap-4 items-end">
            <div>
              <label className={labelClase}>Monto</label>
              <input type="number" min="0" step="0.01" value={formPago.monto}
                onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Método</label>
              <select value={formPago.metodo} onChange={(e) => setFormPago({ ...formPago, metodo: e.target.value })} className={inputClase}>
                {METODOS_PAGO.map((m) => <option key={m} value={m}>{m.toLowerCase()}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClase}>Desde</label>
              <input type="date" value={formPago.periodoDesde}
                onChange={(e) => setFormPago({ ...formPago, periodoDesde: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Hasta</label>
              <input type="date" value={formPago.periodoHasta}
                onChange={(e) => setFormPago({ ...formPago, periodoHasta: e.target.value })} className={inputClase} required />
            </div>
            <div>
              <label className={labelClase}>Referencia</label>
              <input value={formPago.referencia} placeholder="N° comprobante"
                onChange={(e) => setFormPago({ ...formPago, referencia: e.target.value })} className={inputClase} />
            </div>
            <div className="col-span-5 flex justify-end">
              <button type="submit" className={botonGuardar}>Registrar</button>
            </div>
          </form>
        )}
        {pagos.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-500">Sin pagos registrados.</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-y">
              <tr>
                <th className={thClase}>Período</th>
                <th className={thClase}>Monto</th>
                <th className={thClase}>Método</th>
                <th className={thClase}>Referencia</th>
                <th className={thClase}>Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td className={tdClase}>{formatoFecha(p.periodoDesde)} – {formatoFecha(p.periodoHasta)}</td>
                  <td className={tdClase}>{formatoPrecio(p.monto)}</td>
                  <td className={`${tdClase} capitalize`}>{p.metodo.toLowerCase()}</td>
                  <td className={tdClase}>{p.referencia ?? '-'}</td>
                  <td className={tdClase}>{formatoFecha(p.creadoEn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Complejos ({org.complejos?.length ?? 0})</h3>
          {org.complejos?.length ? (
            <ul className="divide-y text-sm">
              {org.complejos.map((c) => (
                <li key={c.id} className="py-2">
                  <p className="text-gray-800">{c.nombre}</p>
                  <p className="text-gray-500">{c.direccion} · {c._count.canchas} cancha(s)</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">El cliente todavía no cargó complejos.</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Usuarios del panel</h3>
            <button onClick={() => setShowSuperadmin(!showSuperadmin)} className="text-sm text-blue-600 hover:underline">
              {showSuperadmin ? 'Cancelar' : '+ Superadmin'}
            </button>
          </div>
          {showSuperadmin && (
            <form onSubmit={handleSuperadmin} className="space-y-3 mb-4">
              <input placeholder="Nombre" value={formSuperadmin.nombre} className={inputClase} required
                onChange={(e) => setFormSuperadmin({ ...formSuperadmin, nombre: e.target.value })} />
              <input placeholder="Email" type="email" value={formSuperadmin.email} className={inputClase} required
                onChange={(e) => setFormSuperadmin({ ...formSuperadmin, email: e.target.value })} />
              <input placeholder="Contraseña inicial (mín. 8)" type="password" minLength={8} value={formSuperadmin.password}
                className={inputClase} required
                onChange={(e) => setFormSuperadmin({ ...formSuperadmin, password: e.target.value })} />
              <button type="submit" className={botonGuardar}>Crear superadmin</button>
            </form>
          )}
          <ul className="divide-y text-sm">
            {org.admins?.map((a) => (
              <li key={a.id} className="py-2 flex justify-between">
                <div>
                  <p className="text-gray-800">{a.nombre}</p>
                  <p className="text-gray-500">{a.email}</p>
                </div>
                <span className="text-xs text-gray-500 self-center">
                  {a.rol === 'SUPERADMIN' ? 'Superadmin' : 'Admin'}{!a.activo && ' · inactivo'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
