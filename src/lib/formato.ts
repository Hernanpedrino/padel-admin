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

// Fecha 'YYYY-MM-DD' + hora 'HH:mm' en la zona horaria del navegador → ISO con zona
export function fechaHoraIso(fecha: string, hora: string) {
  return new Date(`${fecha}T${hora}:00`).toISOString();
}

export function formatoFechaHora(fecha: string) {
  return new Date(fecha).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatoHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

// Horarios cada 30 minutos de 07:00 a 23:30
export const HORARIOS = Array.from({ length: 34 }, (_, i) => {
  const h = String(7 + Math.floor(i / 2)).padStart(2, '0');
  return `${h}:${i % 2 ? '30' : '00'}`;
});

export const CATEGORIAS = [
  { valor: 'PRIMERA', etiqueta: '1ra' },
  { valor: 'SEGUNDA', etiqueta: '2da' },
  { valor: 'TERCERA', etiqueta: '3ra' },
  { valor: 'CUARTA', etiqueta: '4ta' },
  { valor: 'QUINTA', etiqueta: '5ta' },
  { valor: 'SEXTA', etiqueta: '6ta' },
  { valor: 'SEPTIMA', etiqueta: '7ma' },
  { valor: 'OCTAVA', etiqueta: '8va' },
];

export const RAMAS = [
  { valor: 'MASCULINO', etiqueta: 'Masculino' },
  { valor: 'FEMENINO', etiqueta: 'Femenino' },
  { valor: 'MIXTO', etiqueta: 'Mixto' },
];

export function etiquetaCategoria(valor: string | null | undefined) {
  return CATEGORIAS.find((c) => c.valor === valor)?.etiqueta ?? '-';
}

export function etiquetaRama(valor: string | null | undefined) {
  return RAMAS.find((r) => r.valor === valor)?.etiqueta ?? '-';
}

export const ESTILO_ESTADO: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  CONFIRMADA: 'bg-green-100 text-green-700',
  RECHAZADA: 'bg-red-100 text-red-700',
  CANCELADA: 'bg-gray-100 text-gray-600',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
  BORRADOR: 'bg-gray-100 text-gray-600',
  PUBLICADO: 'bg-blue-100 text-blue-700',
  PUBLICADA: 'bg-blue-100 text-blue-700',
  INSCRIPCION_CERRADA: 'bg-yellow-100 text-yellow-700',
  EN_CURSO: 'bg-green-100 text-green-700',
  FINALIZADO: 'bg-gray-100 text-gray-600',
  CANCELADO: 'bg-red-100 text-red-700',
};

export function etiquetaEstado(estado: string) {
  const texto = estado.replace('_', ' ').toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export const inputClase =
  'w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';
export const labelClase = 'block text-sm font-medium text-gray-700 mb-1';
export const botonPrimario = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50';
export const botonGuardar = 'bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50';
export const thClase = 'text-left px-6 py-3 text-sm font-medium text-gray-500';
export const tdClase = 'px-6 py-4 text-gray-700';
