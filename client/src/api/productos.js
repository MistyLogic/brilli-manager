import { api } from './cliente';

function construirQuery(filtros) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') params.set(clave, valor);
  });
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

export const productosApi = {
  listar: (filtros = {}) => api.get(`/productos${construirQuery(filtros)}`),
  resumen: () => api.get('/productos/resumen'),
  obtener: (id) => api.get(`/productos/${id}`),
  kardex: (id, pagina = 1, limite = 20) =>
    api.get(`/productos/${id}/kardex?pagina=${pagina}&limite=${limite}`),
  crear: (datos) => api.post('/productos', datos),
  actualizar: (id, datos) => api.put(`/productos/${id}`, datos),
  ajustarStock: (id, datos) => api.post(`/productos/${id}/ajuste-stock`, datos),
  ajustarCosto: (id, datos) => api.post(`/productos/${id}/ajuste-costo`, datos),
};