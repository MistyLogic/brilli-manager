import { Badge } from '@/components/ui/badge';

const ESTILOS = {
  ok: { texto: 'OK', clase: 'bg-green-100 text-green-700 hover:bg-green-100' },
  bajo: { texto: 'Bajo', clase: 'bg-amber-100 text-amber-700 hover:bg-amber-100' },
  agotado: { texto: 'Agotado', clase: 'bg-red-100 text-red-700 hover:bg-red-100' },
};

export default function EstadoStockBadge({ estado }) {
  const { texto, clase } = ESTILOS[estado] ?? ESTILOS.ok;
  return (
    <Badge variant="secondary" className={clase}>
      {texto}
    </Badge>
  );
}