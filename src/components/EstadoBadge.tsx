import { ESTILO_ESTADO, etiquetaEstado } from '@/lib/formato';

export default function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${ESTILO_ESTADO[estado] ?? 'bg-gray-100 text-gray-600'}`}>
      {etiquetaEstado(estado)}
    </span>
  );
}
