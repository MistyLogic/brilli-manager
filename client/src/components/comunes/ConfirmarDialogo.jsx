import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ConfirmarDialogo({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = 'Confirmar',
  cargando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && onCancelar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" className="h-11" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </Button>
          <Button className="h-11" onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Procesando...' : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}