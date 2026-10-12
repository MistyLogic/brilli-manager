import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import CampoFormulario from '@/components/comunes/CampoFormulario';
import MontoSoles from '@/components/comunes/MontoSoles';
import { useAjustarCosto } from '../hooks';
import { ajusteCostoSchema } from '../schemas';

function Formulario({ producto, onCerrar }) {
  const ajustar = useAjustarCosto();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ajusteCostoSchema),
    defaultValues: { costoNuevo: String(producto.costoPromedio), motivo: '' },
  });

  async function alEnviar(valores) {
    try {
      await ajustar.mutateAsync({ id: producto.id, datos: valores });
      onCerrar();
    } catch {
      // El aviso de error ya se muestra con un toast
    }
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-4">
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Este cambio afecta la utilidad de las ventas futuras. Las ventas ya registradas conservan el costo que tenían.
      </p>

      <CampoFormulario
        etiqueta="Costo unitario nuevo (S/)"
        htmlFor="costoNuevo"
        error={errors.costoNuevo?.message}
      >
        <Input id="costoNuevo" inputMode="decimal" className="h-11" {...register('costoNuevo')} />
      </CampoFormulario>
      <p className="-mt-2 text-xs text-gray-500">
        Costo actual: <MontoSoles valor={producto.costoPromedio} precision />
      </p>

      <CampoFormulario etiqueta="Motivo" htmlFor="motivo-costo" error={errors.motivo?.message}>
        <Input id="motivo-costo" className="h-11" placeholder="Ej: error al registrar el costo" {...register('motivo')} />
      </CampoFormulario>

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar costo'}
      </Button>
    </form>
  );
}

export default function AjusteCostoDialog({ abierto, onCerrar, producto }) {
  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar costo</DialogTitle>
          <DialogDescription>{producto.nombre}</DialogDescription>
        </DialogHeader>
        <Formulario producto={producto} onCerrar={onCerrar} />
      </DialogContent>
    </Dialog>
  );
}