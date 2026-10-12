import { formatearCosto, formatearSoles } from '@/lib/formato';

// precision: muestra hasta 4 decimales (para costos promedio)
export default function MontoSoles({ valor, precision = false, className = '' }) {
  return <span className={className}>{precision ? formatearCosto(valor) : formatearSoles(valor)}</span>;
}