// Sin dependencias de navegador: lo usan tanto el middleware como los componentes
export type Rol = 'manager' | 'superadmin' | 'admin';

// Secciones de operación de un complejo: ADMIN, o SUPERADMIN con un complejo elegido
export const RUTAS_OPERACION = [
  '/dashboard/canchas',
  '/dashboard/turnos',
  '/dashboard/reservas',
  '/dashboard/turnos-fijos',
];

export function inicioSegunRol(rol: string | undefined) {
  if (rol === 'manager') return '/dashboard/manager';
  if (rol === 'superadmin') return '/dashboard/organizacion';
  return '/dashboard';
}
