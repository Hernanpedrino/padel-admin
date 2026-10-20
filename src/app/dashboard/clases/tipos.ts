export interface Clase {
  id: string;
  profesor: string;
  nivel: string | null;
  descripcion: string | null;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  cupo: number;
  precio: string;
  estado: string;
  cancha: { id: string; nombre: string };
  _count: { inscripciones: number };
}
