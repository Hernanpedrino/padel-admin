import Link from 'next/link';

// Inscripciones esperando confirmación; lleva al detalle donde se confirman
export default function PendientesBadge({ cantidad, href }: { cantidad: number; href: string }) {
  if (cantidad === 0) return null;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium hover:bg-amber-200 whitespace-nowrap"
    >
      ⏳ {cantidad} {cantidad === 1 ? 'pendiente' : 'pendientes'}
    </Link>
  );
}
