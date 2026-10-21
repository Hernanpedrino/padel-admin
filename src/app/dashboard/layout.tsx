'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Rol, cerrarSesion, elegirComplejo, getComplejo, getNombre, getRol } from '@/lib/sesion';
import { Pendientes, escucharCambioPendientes, obtenerPendientes } from '@/lib/pendientes';

interface ItemMenu {
  href: string;
  label: string;
  // Clave del contador de pendientes que se muestra como indicador en el menú
  pendientes?: keyof Pendientes;
}

const MENU_OPERACION: ItemMenu[] = [
  { href: '/dashboard/canchas', label: '🎾 Canchas' },
  { href: '/dashboard/turnos', label: '📅 Turnos' },
  { href: '/dashboard/reservas', label: '📋 Reservas' },
  { href: '/dashboard/turnos-fijos', label: '📌 Turnos fijos' },
  { href: '/dashboard/torneos', label: '🏆 Torneos', pendientes: 'torneos' },
  { href: '/dashboard/clases', label: '🎓 Clases', pendientes: 'clases' },
  { href: '/dashboard/pagos', label: '💵 Cobros', pendientes: 'pagos' },
];

const MENU_MANAGER: ItemMenu[] = [
  { href: '/dashboard/manager', label: '🏢 Clientes' },
  { href: '/dashboard/manager/planes', label: '💳 Planes' },
];

const MENU_SUPERADMIN: ItemMenu[] = [
  { href: '/dashboard/organizacion', label: '🏢 Mi organización' },
  { href: '/dashboard/organizacion/admins', label: '👥 Administradores' },
];

const ETIQUETA_ROL: Record<Rol, string> = {
  manager: 'Manager',
  superadmin: 'Superadmin',
  admin: 'Administrador',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // La sesión está en cookies del navegador: se lee después de montar para no
  // generar diferencias entre el render del servidor y el del cliente
  const [rol, setRol] = useState<Rol>();
  const [nombre, setNombre] = useState<string>();
  const [complejo, setComplejo] = useState<{ id: string; nombre: string }>();
  const [complejos, setComplejos] = useState<{ id: string; nombre: string }[]>([]);
  const [pendientes, setPendientes] = useState<Pendientes>();

  useEffect(() => {
    const r = getRol();
    setRol(r);
    setNombre(getNombre());
    setComplejo(getComplejo());
    if (r === 'superadmin') {
      api.get('/organizacion').then(({ data }) => setComplejos(data.complejos));
    }
  }, []);

  // Los pendientes se piden al cambiar de página y cuando una página avisa que confirmó algo
  const operaComplejo = rol === 'admin' || (rol === 'superadmin' && !!complejo);
  useEffect(() => {
    if (!operaComplejo) return;
    const cargar = () => obtenerPendientes().then(setPendientes).catch(() => setPendientes(undefined));
    cargar();
    return escucharCambioPendientes(cargar);
  }, [operaComplejo, pathname]);

  const handleLogout = () => {
    cerrarSesion();
    router.push('/login');
  };

  const handleElegirComplejo = (id: string) => {
    const elegido = complejos.find((c) => c.id === id);
    elegirComplejo(elegido);
    // Recarga completa para que cada página vuelva a pedir los datos del complejo elegido
    window.location.href = elegido ? '/dashboard/canchas' : '/dashboard/organizacion';
  };

  // Se marca el ítem más específico que contiene la ruta actual (ej. /dashboard/torneos/123 → Torneos)
  const hrefActivo = [...MENU_OPERACION, ...MENU_MANAGER, ...MENU_SUPERADMIN, { href: '/dashboard', label: '' }]
    .map((m) => m.href)
    .filter((h) => pathname === h || pathname.startsWith(h + '/'))
    .sort((a, b) => b.length - a.length)[0];
  const activo = (href: string) => href === hrefActivo;

  const linkClase = (href: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
      activo(href) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`;

  const renderMenu = (items: ItemMenu[]) =>
    items.map((item) => {
      const cantidad = item.pendientes ? pendientes?.[item.pendientes] ?? 0 : 0;
      return (
        <Link key={item.href} href={item.href} className={linkClase(item.href)}>
          <span className="flex-1">{item.label}</span>
          {cantidad > 0 && (
            <span
              className="min-w-6 h-6 px-2 rounded-full bg-amber-500 text-white text-xs font-semibold flex items-center justify-center"
              title={`${cantidad} esperando confirmación`}
            >
              {cantidad}
            </span>
          )}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Padel Admin</h1>
          {rol && (
            <p className="text-sm text-gray-500 mt-1">
              {nombre} · {ETIQUETA_ROL[rol]}
            </p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {rol === 'manager' && renderMenu(MENU_MANAGER)}

          {rol === 'superadmin' && (
            <>
              {renderMenu(MENU_SUPERADMIN)}
              <div className="pt-4 pb-2 px-4">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Operar complejo</label>
                <select
                  value={complejo?.id ?? ''}
                  onChange={(e) => handleElegirComplejo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Elegí un complejo</option>
                  {complejos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              {complejo && renderMenu(MENU_OPERACION)}
            </>
          )}

          {rol === 'admin' && (
            <>
              <Link href="/dashboard" className={linkClase('/dashboard')}>🏠 Dashboard</Link>
              {renderMenu(MENU_OPERACION)}
            </>
          )}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
