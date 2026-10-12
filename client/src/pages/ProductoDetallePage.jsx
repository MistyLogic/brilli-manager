import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import ConfirmarDialogo from '@/components/comunes/ConfirmarDialogo';
import EstadoVacio from '@/components/comunes/EstadoVacio';
import MontoSoles from '@/components/comunes/MontoSoles';
import { useAuth } from '@/context/AuthContext';
import { useActualizarProducto, useProducto } from '@/features/inventario/hooks';
import AjusteCostoDialog from '@/features/inventario/componentes/AjusteCostoDialog';
import AjusteStockDialog from '@/features/inventario/componentes/AjusteStockDialog';
import EstadoStockBadge from '@/features/inventario/componentes/EstadoStockBadge';
import FotoProducto from '@/features/inventario/componentes/FotoProducto';
import KardexTabla from '@/features/inventario/componentes/KardexTabla';
import ProductoFormDialog from '@/features/inventario/componentes/ProductoFormDialog';

function Dato({ titulo, children }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{titulo}</p>
      <p className="mt-0.5 text-xl font-bold text-gray-800">{children}</p>
    </div>
  );
}

export default function ProductoDetallePage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const esAdmin = usuario.rol === 'admin';

  const { data: producto, isLoading, isError, error, refetch } = useProducto(id);
  const actualizar = useActualizarProducto();

  const [dialogo, setDialogo] = useState(null); // 'editar' | 'stock' | 'costo' | null
  const [confirmarEstado, setConfirmarEstado] = useState(false);

  const volver = (
    <Link to="/inventario" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-pink-600">
      <ArrowLeft size={16} /> Volver al inventario
    </Link>
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {volver}
        <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {volver}
        {error.status === 404 ? (
          <EstadoVacio icono={Package} titulo="Producto no encontrado" descripcion="Es posible que el enlace sea incorrecto." />
        ) : (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error.message}{' '}
            <button onClick={() => refetch()} className="font-medium underline">
              Reintentar
            </button>
          </div>
        )}
      </div>
    );
  }

  const verCostos = producto.costoPromedio !== undefined;

  async function cambiarEstado() {
    try {
      await actualizar.mutateAsync({ id: producto.id, datos: { activo: !producto.activo } });
      setConfirmarEstado(false);
    } catch {
      // toast de error ya mostrado
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {volver}

      <section className="rounded-xl border border-gray-200 bg-white p-4 md:p-6">
        <div className="flex gap-4">
          <FotoProducto url={producto.fotoUrl} className="size-20 md:size-28" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-gray-800 md:text-2xl">{producto.nombre}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {[producto.categoria?.nombre, producto.marca, producto.sku].filter(Boolean).join(' · ') || 'Sin categoría'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <EstadoStockBadge estado={producto.estadoStock} />
              {!producto.activo && <Badge variant="outline">Inactivo</Badge>}
            </div>
          </div>
        </div>

        <div className={`mt-5 grid grid-cols-2 gap-3 ${verCostos ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
          <Dato titulo="Stock actual">{producto.stockActual}</Dato>
          <Dato titulo="Stock mínimo">{producto.stockMinimo}</Dato>
          {verCostos && (
            <>
              <Dato titulo="Costo promedio">
                <MontoSoles valor={producto.costoPromedio} precision />
              </Dato>
              <Dato titulo="Valor del stock">
                <MontoSoles valor={producto.valorStock} />
              </Dato>
            </>
          )}
        </div>

        {esAdmin && (
          <>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" className="h-11" onClick={() => setDialogo('editar')}>
                <Pencil size={16} /> Editar
              </Button>
              <Button className="h-11" onClick={() => setDialogo('stock')}>
                Ajustar stock
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setDialogo('costo')}>
                Ajustar costo
              </Button>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
              <Switch id="activo" checked={producto.activo} onCheckedChange={() => setConfirmarEstado(true)} />
              <Label htmlFor="activo">Producto activo</Label>
            </div>
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Movimientos de stock</h2>
        <KardexTabla productoId={producto.id} />
      </section>

      {esAdmin && (
        <>
          <ProductoFormDialog abierto={dialogo === 'editar'} onCerrar={() => setDialogo(null)} producto={producto} />
          <AjusteStockDialog abierto={dialogo === 'stock'} onCerrar={() => setDialogo(null)} producto={producto} />
          <AjusteCostoDialog abierto={dialogo === 'costo'} onCerrar={() => setDialogo(null)} producto={producto} />
          <ConfirmarDialogo
            abierto={confirmarEstado}
            titulo={producto.activo ? 'Desactivar producto' : 'Activar producto'}
            descripcion={
              producto.activo
                ? 'Dejará de aparecer en el inventario y en las ventas. Podrás volver a activarlo cuando quieras.'
                : 'Volverá a aparecer en el inventario y estará disponible para vender.'
            }
            textoConfirmar={producto.activo ? 'Desactivar' : 'Activar'}
            cargando={actualizar.isPending}
            onConfirmar={cambiarEstado}
            onCancelar={() => setConfirmarEstado(false)}
          />
        </>
      )}
    </div>
  );
}