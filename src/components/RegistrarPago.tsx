'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { mensajeError } from '@/lib/sesion';
import { formatoPrecio, inputClase } from '@/lib/formato';

export interface PagoRegistrado {
  id: string;
  monto: string;
  metodo: string;
  estado: string;
}

const METODOS = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO', 'OTRO'];

// Módulo opcional de cobros: muestra lo cobrado y permite registrar un pago
export default function RegistrarPago({
  destino,
  montoSugerido,
  pagos,
  onRegistrado,
}: {
  destino: { inscripcionTorneoId: string } | { inscripcionClaseId: string } | { reservaId: string };
  montoSugerido: string | number;
  pagos: PagoRegistrado[];
  onRegistrado: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState(String(Number(montoSugerido)));
  const [metodo, setMetodo] = useState('EFECTIVO');
  const [referencia, setReferencia] = useState('');

  const cobrado = pagos.filter((p) => p.estado === 'APROBADO').reduce((t, p) => t + Number(p.monto), 0);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/pagos', { ...destino, monto: parseFloat(monto), metodo, referencia: referencia || undefined });
      setAbierto(false);
      setReferencia('');
      onRegistrado();
    } catch (err) {
      alert(mensajeError(err));
    }
  };

  if (!abierto) {
    return (
      <div className="text-sm">
        <span className={cobrado >= Number(montoSugerido) ? 'text-green-700' : 'text-gray-600'}>
          {cobrado > 0 ? `Cobrado ${formatoPrecio(cobrado)}` : 'Sin cobrar'}
        </span>
        <button onClick={() => setAbierto(true)} className="ml-2 text-blue-600 hover:underline">+ Pago</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegistrar} className="flex gap-2 items-center">
      <input type="number" min="0.01" step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)}
        className={`${inputClase} w-24 px-2 py-1 text-sm`} required />
      <select value={metodo} onChange={(e) => setMetodo(e.target.value)} className={`${inputClase} w-36 px-2 py-1 text-sm`}>
        {METODOS.map((m) => <option key={m} value={m}>{m.toLowerCase()}</option>)}
      </select>
      <input placeholder="Ref." value={referencia} onChange={(e) => setReferencia(e.target.value)}
        className={`${inputClase} w-24 px-2 py-1 text-sm`} />
      <button type="submit" className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">OK</button>
      <button type="button" onClick={() => setAbierto(false)} className="text-sm text-gray-500 hover:underline">✕</button>
    </form>
  );
}
