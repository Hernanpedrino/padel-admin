'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
  activa: boolean;
}

export default function CanchasPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('cristal');

  const fetchCanchas = async () => {
    const { data } = await api.get('/canchas');
    setCanchas(data);
    setLoading(false);
  };

  useEffect(() => { fetchCanchas(); }, []);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/canchas', { nombre, tipo });
    setNombre('');
    setTipo('cristal');
    setShowForm(false);
    fetchCanchas();
  };

  const handleToggle = async (cancha: Cancha) => {
    await api.patch(`/canchas/${cancha.id}`, { activa: !cancha.activa });
    fetchCanchas();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Canchas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva cancha'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cancha 4"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cristal">Cristal</option>
              <option value="cemento">Cemento</option>
              <option value="pasto_sintetico">Pasto sintético</option>
              <option value="indoor">Indoor</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Guardar
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nombre</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tipo</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Estado</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {canchas.map((cancha) => (
                <tr key={cancha.id}>
                  <td className="px-6 py-4 text-gray-800">{cancha.nombre}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{cancha.tipo.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${cancha.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cancha.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(cancha)}
                      className={`text-sm px-3 py-1 rounded-lg transition ${cancha.activa ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {cancha.activa ? 'Desactivar' : 'Activar'}
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