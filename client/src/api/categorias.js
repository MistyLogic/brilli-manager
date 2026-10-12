import { api } from './cliente';

export const categoriasApi = {
  listar: () => api.get('/categorias'),
  crear: (nombre) => api.post('/categorias', { nombre }),
  renombrar: (id, nombre) => api.put(`/categorias/${id}`, { nombre }),
  eliminar: (id) => api.delete(`/categorias/${id}`),
};