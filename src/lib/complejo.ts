import api from './axios';

// Indica si el complejo con el que se opera tiene habilitado el módulo de cobros
export async function pagosHabilitados(): Promise<boolean> {
  const { data } = await api.get('/complejos/mi-complejo');
  return !!data?.pagosHabilitados;
}
