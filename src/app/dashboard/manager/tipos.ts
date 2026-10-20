export interface Plan {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioMensual: string;
  maxComplejos: number | null;
  maxCanchas: number | null;
  activo: boolean;
  _count?: { organizaciones: number };
}

export interface UsuarioPanel {
  id: string;
  rol: 'MANAGER' | 'SUPERADMIN' | 'ADMIN';
  nombre: string;
  email: string;
  activo: boolean;
  complejoId: string | null;
}

export interface Organizacion {
  id: string;
  nombre: string;
  cuit: string | null;
  emailContacto: string;
  telefono: string | null;
  estado: 'ACTIVA' | 'SUSPENDIDA';
  planId: string | null;
  vencimiento: string | null;
  creadoEn: string;
  plan: Plan | null;
  _count?: { complejos: number; admins: number };
  complejos?: { id: string; nombre: string; direccion: string; _count: { canchas: number } }[];
  admins?: UsuarioPanel[];
}

export interface PagoServicio {
  id: string;
  monto: string;
  metodo: string;
  periodoDesde: string;
  periodoHasta: string;
  referencia: string | null;
  creadoEn: string;
}

export const METODOS_PAGO = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO', 'OTRO'];

export function estaVencida(org: Pick<Organizacion, 'vencimiento'>) {
  return !org.vencimiento || new Date(org.vencimiento) < new Date();
}
