import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RUTAS_OPERACION, inicioSegunRol } from '@/lib/rutas';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const rol = request.cookies.get('rol')?.value;
  const complejo = request.cookies.get('complejo')?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';
  const isPublicPath = pathname.startsWith('/_next') || pathname === '/favicon.ico';

  if (isPublicPath) return NextResponse.next();

  const redirigir = (ruta: string) => NextResponse.redirect(new URL(ruta, request.url));

  if (!token && !isLoginPage) return redirigir('/login');
  if (token && isLoginPage) return redirigir(inicioSegunRol(rol));
  if (!token) return NextResponse.next();

  // Sesiones anteriores a los roles no tienen la cookie: se pide login de nuevo
  if (!rol) {
    const respuesta = redirigir('/login');
    respuesta.cookies.delete('token');
    return respuesta;
  }

  // Cada rol solo entra a sus secciones; la validación real la hace el backend
  if (pathname === '/' || pathname === '/dashboard') {
    return rol === 'admin' ? NextResponse.next() : redirigir(inicioSegunRol(rol));
  }
  if (pathname.startsWith('/dashboard/manager') && rol !== 'manager') return redirigir(inicioSegunRol(rol));
  if (pathname.startsWith('/dashboard/organizacion') && rol !== 'superadmin') return redirigir(inicioSegunRol(rol));

  const esOperacion = RUTAS_OPERACION.some((r) => pathname === r || pathname.startsWith(r + '/'));
  if (esOperacion) {
    if (rol === 'manager') return redirigir(inicioSegunRol(rol));
    if (rol === 'superadmin' && !complejo) return redirigir('/dashboard/organizacion');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
