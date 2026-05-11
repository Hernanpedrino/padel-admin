'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';

interface Cancha {
    id: string;
    nombre: string;
    tipo: string;
}

interface Turno {
    id: string;
    fechaHoraInicio: string;
    fechaHoraFin: string;
    precio: number;
    estado: string;
    cancha: Cancha;
}

export default function TurnosPage() {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        canchaId: '',
        fecha: '',
        horaInicio: '07',
        minInicio: '00',
        horaFin: '07',
        minFin: '30',
        precio: '',
    });

    const fetchTurnos = async () => {
        const { data } = await api.get('/turnos');
        setTurnos(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchTurnos();
        api.get('/canchas').then(({ data }) => setCanchas(data));
    }, []);

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/turnos', {
            canchaId: form.canchaId,
            fechaHoraInicio: buildFecha(form.fecha, form.horaInicio, form.minInicio),
            fechaHoraFin: buildFecha(form.fecha, form.horaFin, form.minFin),
            precio: parseFloat(form.precio),
        });
        setForm({ canchaId: '', fecha: '', horaInicio: '07', minInicio: '00', horaFin: '07', minFin: '30', precio: '' });
        setShowForm(false);
        fetchTurnos();
    };

    const handleCancelar = async (id: string) => {
        await api.patch(`/turnos/${id}/cancelar`);
        fetchTurnos();
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    const estadoStyle: Record<string, string> = {
        DISPONIBLE: 'bg-green-100 text-green-700',
        RESERVADO: 'bg-blue-100 text-blue-700',
        CANCELADO: 'bg-red-100 text-red-700',
    };
    const horas = Array.from({ length: 17 }, (_, i) => {
        const hora = i + 7;
        return hora.toString().padStart(2, '0');
    });

    const minutos = ['00', '30'];

    const buildFecha = (fecha: string, hora: string, min: string) => {
        return `${fecha}T${hora}:${min}:00`;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Turnos</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? 'Cancelar' : '+ Nuevo turno'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCrear} className="bg-white rounded-xl p-6 shadow-sm mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cancha</label>
                        <select
                            value={form.canchaId}
                            onChange={(e) => setForm({ ...form, canchaId: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Seleccioná una cancha</option>
                            {canchas.filter(c => (c as any).activa).map((cancha) => (
                                <option key={cancha.id} value={cancha.id}>
                                    {cancha.nombre} — {cancha.tipo.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <input
                            type="number"
                            value={form.precio}
                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="2500"
                            required
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                        <input
                            type="date"
                            value={form.fecha}
                            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                        <div className="flex gap-2">
                            <select
                                value={form.horaInicio}
                                onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {horas.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select
                                value={form.minInicio}
                                onChange={(e) => setForm({ ...form, minInicio: e.target.value })}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {minutos.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                        <div className="flex gap-2">
                            <select
                                value={form.horaFin}
                                onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {horas.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select
                                value={form.minFin}
                                onChange={(e) => setForm({ ...form, minFin: e.target.value })}
                                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {minutos.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            Guardar
                        </button>
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
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Cancha</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Inicio</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fin</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Precio</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Estado</th>
                                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {turnos.map((turno) => (
                                <tr key={turno.id}>
                                    <td className="px-6 py-4 text-gray-800">{turno.cancha.nombre}</td>
                                    <td className="px-6 py-4 text-gray-600">{formatFecha(turno.fechaHoraInicio)}</td>
                                    <td className="px-6 py-4 text-gray-600">{formatFecha(turno.fechaHoraFin)}</td>
                                    <td className="px-6 py-4 text-gray-600">${turno.precio}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoStyle[turno.estado]}`}>
                                            {turno.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {turno.estado !== 'CANCELADO' && (
                                            <button
                                                onClick={() => handleCancelar(turno.id)}
                                                className="text-sm px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                            >
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