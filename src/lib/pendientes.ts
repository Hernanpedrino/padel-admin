import api from './axios';

// Cosas del complejo que esperan una acción del panel
export interface Pendientes {
  torneos: number;
  clases: number;
  pagos: number;
}

const EVENTO = 'pendientes-actualizados';

export async function obtenerPendientes(): Promise<Pendientes> {
  const { data } = await api.get('/complejos/mi-complejo/pendientes');
  return data;
}

// Las páginas lo llaman después de confirmar, rechazar o aprobar algo para que el menú se actualice
export function avisarCambioPendientes() {
  window.dispatchEvent(new Event(EVENTO));
}

export function escucharCambioPendientes(callback: () => void) {
  window.addEventListener(EVENTO, callback);
  return () => window.removeEventListener(EVENTO, callback);
}
