'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { botonGuardar, botonPrimario, formatoPrecio, inputClase, labelClase, tdClase, thClase } from '@/lib/formato';
import { Plan } from '../tipos';

const formVacio = { nombre: '', descripcion: '', precioMensual: '', maxComplejos: '', maxCanchas: '' };

// Un campo vacío significa "sin límite"
const limite = (valor: string) => (valor ? parseInt(valor, 10) : null);

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(formVacio);

  const fetchPlanes = async () => {
    const { data } = await api.get('/manager/planes');
    setPlanes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlanes().catch((err) => {
      alert(mensajeError(err));
      setLoading(false);
    });
  }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/manager/planes', {
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        precioMensual: parseFloat(form.precioMensual),
        maxComplejos: limite(form.maxComplejos),
        maxCanchas: limite(form.maxCanchas),
      });
      setForm(formVacio);
      setShowForm(false);
      fetchPlanes();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  const handleToggle = async (plan: Plan) => {
    try {
      await api.patch(`/manager/planes/${plan.id}`, { activo: !plan.activo });
      fetchPlanes();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Planes</h2>
        <button onClick={() => setShowForm(!showForm)} className={botonPrimario}>
          {showForm ? 'Cancelar' : '+ Nuevo plan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 grid grid-cols-5 gap-4 items-end">
          <div>
            <label className={labelClase}>Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className={inputClase} placeholder="Pro" required />
          </div>
          <div className="col-span-2">
            <label className={labelClase}>Descripción</label>
            <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className={inputClase} />
          </div>
          <div>
            <label className={labelClase}>Precio mensual</label>
            <input type="number" min="0" step="0.01" value={form.precioMensual}
              onChange={(e) => setForm({ ...form, precioMensual: e.target.value })} className={inputClase} required />
          </div>
          <div />
          <div>
            <label className={labelClase}>Máx. complejos</label>
            <input type="number" min="1" value={form.maxComplejos} placeholder="Sin límite"
              onChange={(e) => setForm({ ...form, maxComplejos: e.target.value })} className={inputClase} />
          </div>
          <div>
            <label className={labelClase}>Máx. canchas</label>
            <input type="number" min="1" value={form.maxCanchas} placeholder="Sin límite"
              onChange={(e) => setForm({ ...form, maxCanchas: e.target.value })} className={inputClase} />
          </div>
          <div className="col-span-3 flex justify-end">
            <button type="submit" className={botonGuardar}>Guardar</button>
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
                <th className={thClase}>Plan</th>
                <th className={thClase}>Precio mensual</th>
                <th className={thClase}>Complejos</th>
                <th className={thClase}>Canchas</th>
                <th className={thClase}>Clientes</th>
                <th className={thClase}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {planes.map((plan) => (
                <tr key={plan.id}>
                  <td className={tdClase}>
                    <p className="font-medium text-gray-800">{plan.nombre}</p>
                    {plan.descripcion && <p className="text-sm text-gray-500">{plan.descripcion}</p>}
                  </td>
                  <td className={tdClase}>{formatoPrecio(plan.precioMensual)}</td>
                  <td className={tdClase}>{plan.maxComplejos ?? 'Sin límite'}</td>
                  <td className={tdClase}>{plan.maxCanchas ?? 'Sin límite'}</td>
                  <td className={tdClase}>{plan._count?.organizaciones ?? 0}</td>
                  <td className={tdClase}>
                    <button
                      onClick={() => handleToggle(plan)}
                      className={`text-sm px-3 py-1 rounded-lg transition ${plan.activo ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      title={plan.activo ? 'Desactivar: no se puede asignar a clientes nuevos' : 'Activar'}
                    >
                      {plan.activo ? 'Activo' : 'Inactivo'}
                    </button>
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
