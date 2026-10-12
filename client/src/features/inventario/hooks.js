import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productosApi } from '@/api/productos';
import { categoriasApi } from '@/api/categorias';

// ---------- Consultas ----------

export const useProductos = (filtros) =>
  useQuery({
    queryKey: ['productos', 'lista', filtros],
    queryFn: async () => (await productosApi.listar(filtros)).productos,
    placeholderData: keepPreviousData, // evita parpadeos al escribir en el buscador
  });

export const useResumenInventario = () =>
  useQuery({ queryKey: ['productos', 'resumen'], queryFn: () => productosApi.resumen() });

export const useProducto = (id) =>
  useQuery({
    queryKey: ['productos', 'detalle', id],
    queryFn: async () => (await productosApi.obtener(id)).producto,
  });

export const useKardex = (id, pagina) =>
  useQuery({
    queryKey: ['productos', 'kardex', id, pagina],
    queryFn: () => productosApi.kardex(id, pagina),
    placeholderData: keepPreviousData,
  });

export const useCategorias = () =>
  useQuery({
    queryKey: ['categorias'],
    queryFn: async () => (await categoriasApi.listar()).categorias,
  });

// ---------- Mutaciones ----------
// Tras cada cambio se invalidan las consultas relacionadas y se avisa con un toast

function useMutacion(funcion, mensaje, clavesAInvalidar) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: funcion,
    onSuccess: () => {
      clavesAInvalidar.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
      toast.success(mensaje);
    },
    onError: (error) => toast.error(error.message),
  });
}

const PRODUCTOS_Y_CATEGORIAS = [['productos'], ['categorias']];

export const useCrearProducto = () =>
  useMutacion((datos) => productosApi.crear(datos), 'Producto creado', PRODUCTOS_Y_CATEGORIAS);

export const useActualizarProducto = () =>
  useMutacion(({ id, datos }) => productosApi.actualizar(id, datos), 'Producto actualizado', PRODUCTOS_Y_CATEGORIAS);

export const useAjustarStock = () =>
  useMutacion(({ id, datos }) => productosApi.ajustarStock(id, datos), 'Stock ajustado', PRODUCTOS_Y_CATEGORIAS);

export const useAjustarCosto = () =>
  useMutacion(({ id, datos }) => productosApi.ajustarCosto(id, datos), 'Costo actualizado', PRODUCTOS_Y_CATEGORIAS);

export const useCrearCategoria = () =>
  useMutacion((nombre) => categoriasApi.crear(nombre), 'Categoría creada', [['categorias']]);

export const useRenombrarCategoria = () =>
  useMutacion(({ id, nombre }) => categoriasApi.renombrar(id, nombre), 'Categoría actualizada', PRODUCTOS_Y_CATEGORIAS);

export const useEliminarCategoria = () =>
  useMutacion((id) => categoriasApi.eliminar(id), 'Categoría eliminada', [['categorias']]);