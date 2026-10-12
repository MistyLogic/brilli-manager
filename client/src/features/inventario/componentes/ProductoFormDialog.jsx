import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CampoFormulario from '@/components/comunes/CampoFormulario';
import { useActualizarProducto, useCategorias, useCrearProducto } from '../hooks';
import { aNumero, crearProductoSchema, editarProductoSchema } from '../schemas';

// El formulario vive dentro del diálogo: se monta al abrir, así siempre arranca con valores frescos
function Formulario({ producto, onCerrar }) {
  const esEdicion = Boolean(producto);
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esEdicion ? editarProductoSchema : crearProductoSchema),
    defaultValues: esEdicion
      ? {
          nombre: producto.nombre,
          categoriaId: producto.categoriaId ? String(producto.categoriaId) : 'ninguna',
          marca: producto.marca ?? '',
          sku: producto.sku ?? '',
          fotoUrl: producto.fotoUrl ?? '',
          stockMinimo: String(producto.stockMinimo),
        }
      : {
          nombre: '',
          categoriaId: 'ninguna',
          marca: '',
          sku: '',
          fotoUrl: '',
          stockMinimo: '0',
          stockInicial: '0',
          costoInicial: '',
        },
  });

  // El costo inicial solo se pide si hay stock inicial
  const hayStockInicial = !esEdicion && aNumero(watch('stockInicial')) > 0;

  async function alEnviar(valores) {
    const datos = {
      nombre: valores.nombre,
      categoriaId: valores.categoriaId === 'ninguna' ? null : Number(valores.categoriaId),
      marca: valores.marca,
      sku: valores.sku,
      fotoUrl: valores.fotoUrl,
      stockMinimo: valores.stockMinimo,
    };

    try {
      if (esEdicion) {
        await actualizar.mutateAsync({ id: producto.id, datos });
      } else {
        await crear.mutateAsync({
          ...datos,
          stockInicial: valores.stockInicial,
          costoInicial: valores.costoInicial,
        });
      }
      onCerrar();
    } catch {
      // El mensaje de error ya se muestra con un aviso (toast)
    }
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-4">
      <CampoFormulario etiqueta="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
        <Input id="nombre" className="h-11" {...register('nombre')} />
      </CampoFormulario>

      <CampoFormulario etiqueta="Categoría" htmlFor="categoriaId">
        <Controller
          control={control}
          name="categoriaId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="categoriaId" className="h-11 w-full">
                <SelectValue placeholder="Sin categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">Sin categoría</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </CampoFormulario>

      <div className="grid grid-cols-2 gap-3">
        <CampoFormulario etiqueta="Marca" htmlFor="marca" error={errors.marca?.message}>
          <Input id="marca" className="h-11" {...register('marca')} />
        </CampoFormulario>
        <CampoFormulario etiqueta="SKU" htmlFor="sku" error={errors.sku?.message}>
          <Input id="sku" className="h-11" {...register('sku')} />
        </CampoFormulario>
      </div>

      <CampoFormulario etiqueta="URL de la foto (opcional)" htmlFor="fotoUrl" error={errors.fotoUrl?.message}>
        <Input id="fotoUrl" className="h-11" placeholder="https://..." {...register('fotoUrl')} />
      </CampoFormulario>

      <CampoFormulario
        etiqueta="Stock mínimo"
        htmlFor="stockMinimo"
        error={errors.stockMinimo?.message}
        ayuda="Por debajo de este número el producto aparece como stock bajo."
      >
        <Input id="stockMinimo" inputMode="numeric" className="h-11" {...register('stockMinimo')} />
      </CampoFormulario>

      {!esEdicion && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">Existencias iniciales</p>
          <CampoFormulario etiqueta="Stock inicial" htmlFor="stockInicial" error={errors.stockInicial?.message}>
            <Input id="stockInicial" inputMode="numeric" className="h-11" {...register('stockInicial')} />
          </CampoFormulario>

          {hayStockInicial && (
            <CampoFormulario
              etiqueta="Costo unitario inicial (S/)"
              htmlFor="costoInicial"
              error={errors.costoInicial?.message}
              ayuda="Cuánto te costó cada unidad. Luego se actualiza solo con las compras."
            >
              <Input id="costoInicial" inputMode="decimal" className="h-11" {...register('costoInicial')} />
            </CampoFormulario>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="h-11" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}

export default function ProductoFormDialog({ abierto, onCerrar, producto = null }) {
  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            {producto
              ? 'El stock y el costo se cambian con "Ajustar stock" y "Ajustar costo".'
              : 'Si ya tienes unidades de este producto, regístralas como stock inicial.'}
          </DialogDescription>
        </DialogHeader>
        <Formulario producto={producto} onCerrar={onCerrar} />
      </DialogContent>
    </Dialog>
  );
}