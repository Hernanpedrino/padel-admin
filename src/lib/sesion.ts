import Cookies from 'js-cookie';
import type { Rol } from './rutas';

export type { Rol } from './rutas';
export { inicioSegunRol } from './rutas';

// La sesión vive en cookies para que el middleware pueda leer el rol.
// El rol en el cliente solo decide qué se muestra: los permisos los valida el backend.
const COOKIES = ['token', 'rol', 'nombre', 'complejo', 'complejoNombre'];
const opciones = { expires: 7, sameSite: 'lax' as const };

export function iniciarSesion(data: { token: string; rol: Rol; nombre: string }) {
  Cookies.set('token', data.token, opciones);
  Cookies.set('rol', data.rol, opciones);
  Cookies.set('nombre', data.nombre, opciones);
}

export function cerrarSesion() {
  COOKIES.forEach((c) => Cookies.remove(c));
}

export function getRol(): Rol | undefined {
  return Cookies.get('rol') as Rol | undefined;
}

export function getNombre() {
  return Cookies.get('nombre');
}

// Complejo con el que opera el SUPERADMIN; se manda en el header X-Complejo-Id
export function getComplejo() {
  const id = Cookies.get('complejo');
  return id ? { id, nombre: Cookies.get('complejoNombre') ?? '' } : undefined;
}

export function elegirComplejo(complejo: { id: string; nombre: string } | undefined) {
  if (complejo) {
    Cookies.set('complejo', complejo.id, opciones);
    Cookies.set('complejoNombre', complejo.nombre, opciones);
  } else {
    Cookies.remove('complejo');
    Cookies.remove('complejoNombre');
  }
}

// Mensaje de error del backend (Nest devuelve { message: string | string[] })
export function mensajeError(error: unknown, porDefecto = 'Ocurrió un error') {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message ?? porDefecto;
}
