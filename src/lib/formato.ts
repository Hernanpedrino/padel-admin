// Los Decimal del backend llegan como string
export function formatoPrecio(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined) return '-';
  return `$${Number(valor).toLocaleString('es-AR')}`;
}

export function formatoFecha(fecha: string | null | undefined) {
  if (!fecha) return '-';
  return new Date(fecha).toLocaleDateString('es-AR');
}

// Un <input type="date"> da 'YYYY-MM-DD'; se convierte con la zona horaria del navegador
export function inicioDelDia(fecha: string) {
  return new Date(`${fecha}T00:00:00`).toISOString();
}

export function finDelDia(fecha: string) {
  return new Date(`${fecha}T23:59:59`).toISOString();
}

export const inputClase =
  'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
export const labelClase = 'block text-sm font-medium text-gray-700 mb-1';
export const botonPrimario = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50';
export const botonGuardar = 'bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50';
export const thClase = 'text-left px-6 py-3 text-sm font-medium text-gray-500';
export const tdClase = 'px-6 py-4 text-gray-700';
