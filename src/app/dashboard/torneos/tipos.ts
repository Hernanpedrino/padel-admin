export interface Torneo {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  rama: string;
  fechaInicio: string;
  fechaFin: string;
  cierreInscripcion: string;
  cupoParejas: number;
  precioInscripcion: string;
  estado: string;
  _count: { inscripciones: number };
}

// Transiciones que ofrece el panel; el backend acepta cualquier estado válido
export const SIGUIENTES_ESTADOS: Record<string, { estado: string; accion: string }[]> = {
  BORRADOR: [{ estado: 'PUBLICADO', accion: 'Publicar' }],
  PUBLICADO: [{ estado: 'INSCRIPCION_CERRADA', accion: 'Cerrar inscripción' }],
  INSCRIPCION_CERRADA: [
    { estado: 'PUBLICADO', accion: 'Reabrir inscripción' },
    { estado: 'EN_CURSO', accion: 'Iniciar' },
  ],
  EN_CURSO: [{ estado: 'FINALIZADO', accion: 'Finalizar' }],
  FINALIZADO: [],
  CANCELADO: [],
};
