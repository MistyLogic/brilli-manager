import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampoFormulario from '@/components/comunes/CampoFormulario';
import { useAjustarStock } from '../hooks';
import { aNumero, ajusteConteoSchema, ajusteDeltaSchema } from '../schemas';

function Vista({ actual, nuevo }) {
  const negativo = nuevo < 0;
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${negativo ? 'bg-red-50 text-red-700' : 'bg-pink-50 text-pink-700'}`}>
      {negativo
        ? `Stock insuficiente: solo hay ${actual} unidades`
        : `Stock actual ${actual} → quedará en ${nuevo}`}
    </p>
  );
}

function FormDelta({ producto, onCerrar }) {
  const ajustar = useAjustarStock();
  const [signo, setSigno] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ajusteDeltaSchema),
    defaultValues: { cantidad: '', motivo: '' },
  });

  const cantidad = aNumero(watch('cantidad'));
  const hayCantidad = Number.isFinite(cantidad) && cantidad > 0;

  async function alEnviar(valores) {
    try {
      await ajustar.mutateAsync({
        id: producto.id,
        datos: { cantidad: signo * valores.cantidad, motivo: valores.motivo },
      });
      onCerrar();
    } catch {
      // El aviso de error ya se muestra con un toast
    }
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" className="h-11" variant={signo === 1 ? 'default' : 'outline'} onClick={() => setSigno(1)}>
          <Plus size={16} /> Sumar
        </Button>
        <Button type="button" className="h-11" variant={signo === -1 ? 'default' : 'outline'} onClick={() => setSigno(-1)}>
          <Minus size={16} /> Restar
        </Button>
      </div>

      <CampoFormulario etiqueta="Cantidad de unidades" htmlFor="cantidad" error={errors.cantidad?.message}>
        <Input id="cantidad" inputMode="numeric" className="h-11" {...register('cantidad')} />
      </CampoFormulario>

      {hayCantidad && <Vista actual={producto.stockActual} nuevo={producto.stockActual + signo * cantidad} />}

      <CampoFormulario etiqueta="Motivo" htmlFor="motivo-delta" error={errors.motivo?.message}>
        <Input
          id="motivo-delta"
          className="h-11"
          placeholder="Merma, producto dañado, regalo..."
          {...register('motivo')}
        />
      </CampoFormulario>

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar ajuste'}
      </Button>
    </form>
  );
}

function FormConteo({ producto, onCerrar }) {
  const ajustar = useAjustarStock();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(ajusteConteoSchema),
    defaultValues: { real: '', motivo: 'Conteo físico' },
  });

  const textoReal = String(watch('real') ?? '').trim();
  const real = aNumero(textoReal);
  const hayReal = textoReal !== '' && Number.isInteger(real) && real >= 0;
  const diferencia = real - producto.stockActual;

  async function alEnviar(valores) {
    const cantidad = valores.real - producto.stockActual;
    if (cantidad === 0) {
      setError('real', { message: 'El conteo coincide con el stock actual: no hay nada que ajustar' });
      return;
    }
    try {
      await ajustar.mutateAsync({ id: producto.id, datos: { cantidad, motivo: valores.motivo } });
      onCerrar();
    } catch {
      // El aviso de error ya se muestra con un toast
    }
  }

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-4 pt-2">
      <CampoFormulario
        etiqueta="Stock real contado"
        htmlFor="real"
        error={errors.real?.message}
        ayuda="Escribe cuántas unidades hay realmente; la diferencia se calcula sola."
      >
        <Input id="real" inputMode="numeric" className="h-11" {...register('real')} />
      </CampoFormulario>

      {hayReal && (
        <p className="rounded-lg bg-pink-50 px-3 py-2 text-sm text-pink-700">
          Stock actual {producto.stockActual} → {real}
          {diferencia !== 0 && ` (${diferencia > 0 ? '+' : ''}${diferencia})`}
        </p>
      )}

      <CampoFormulario etiqueta="Motivo" htmlFor="motivo-conteo" error={errors.motivo?.message}>
        <Input id="motivo-conteo" className="h-11" {...register('motivo')} />
      </CampoFormulario>

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar ajuste'}
      </Button>
    </form>
  );
}

export default function AjusteStockDialog({ abierto, onCerrar, producto }) {
  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && onCerrar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar stock</DialogTitle>
          <DialogDescription>
            {producto.nombre} · stock actual: {producto.stockActual}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="delta">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="delta">Sumar o restar</TabsTrigger>
            <TabsTrigger value="conteo">Conteo físico</TabsTrigger>
          </TabsList>
          <TabsContent value="delta">
            <FormDelta producto={producto} onCerrar={onCerrar} />
          </TabsContent>
          <TabsContent value="conteo">
            <FormConteo producto={producto} onCerrar={onCerrar} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}