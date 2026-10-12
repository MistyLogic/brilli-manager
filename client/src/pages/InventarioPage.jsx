import { useState } from 'react';
import { Package, Plus, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EstadoVacio from '@/components/comunes/EstadoVacio';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useCategorias, useProductos, useResumenInventario } from '@/features/inventario/hooks';
import ResumenInventario from '@/features/inventario/componentes/ResumenInventario';
import FiltrosInventario from '@/features/inventario/componentes/FiltrosInventario';
import ListaProductos from '@/features/inventario/componentes/ListaProductos';
import ProductoFormDialog from '@/features/inventario/componentes/ProductoFormDialog';
import CategoriasDialog from '@/features/inventario/componentes/CategoriasDialog';

const FILTROS_INICIALES = { buscarTexto: '', categoriaId: 'todas', soloAlerta: false, verInactivos: false };

export default function InventarioPage() {
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'admin';

  const [valores, setValores] = useState(FILTROS_INICIALES);
  const [formAbierto, setFormAbierto] = useState(false);
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);

  const buscar = useDebounce(valores.buscarTexto.trim(), 300);

  const consulta = {
    buscar: buscar || undefined,
    categoriaId: valores.categoriaId === 'todas' ? undefined : valores.categoriaId,
    estado: valores.soloAlerta ? 'alerta' : undefined,
    activo: esAdmin && valores.verInactivos ? 'todos' : undefined,
  };

  const { data: productos, isLoading, isError, error, refetch } = useProductos(consulta);
  const { data: resumen, isLoading: cargandoResumen } = useResumenInventario();
  const { data: categorias = [] } = useCategorias();

  const hayFiltros = Boolean(buscar) || valores.categoriaId !== 'todas' || valores.soloAlerta;
  const cambiar = (parcial) => setValores((v) => ({ ...v, ...parcial }));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        {esAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 flex-1 md:flex-none" onClick={() => setCategoriasAbierto(true)}>
              <Tags size={16} /> Categorías
            </Button>
            <Button className="h-11 flex-1 md:flex-none" onClick={() => setFormAbierto(true)}>
              <Plus size={16} /> Nuevo producto
            </Button>
          </div>
        )}
      </div>

      <ResumenInventario resumen={resumen} cargando={cargandoResumen} onVerAlertas={() => cambiar({ soloAlerta: true })} />

      <FiltrosInventario valores={valores} onCambio={cambiar} categorias={categorias} esAdmin={esAdmin} />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error.message}{' '}
          <button onClick={() => refetch()} className="font-medium underline">
            Reintentar
          </button>
        </div>
      ) : productos.length === 0 ? (
        hayFiltros ? (
          <EstadoVacio icono={Package} titulo="Sin resultados" descripcion="Ningún producto coincide con los filtros aplicados.">
            <Button variant="outline" onClick={() => setValores(FILTROS_INICIALES)}>
              Limpiar filtros
            </Button>
          </EstadoVacio>
        ) : (
          <EstadoVacio
            icono={Package}
            titulo="Aún no hay productos"
            descripcion={esAdmin ? 'Crea tu primer producto para empezar a llevar el inventario.' : 'Todavía no se han cargado productos.'}
          >
            {esAdmin && (
              <Button onClick={() => setFormAbierto(true)}>
                <Plus size={16} /> Nuevo producto
              </Button>
            )}
          </EstadoVacio>
        )
      ) : (
        <ListaProductos productos={productos} />
      )}

      {esAdmin && (
        <>
          <ProductoFormDialog abierto={formAbierto} onCerrar={() => setFormAbierto(false)} />
          <CategoriasDialog abierto={categoriasAbierto} onCerrar={() => setCategoriasAbierto(false)} />
        </>
      )}
    </div>
  );
}