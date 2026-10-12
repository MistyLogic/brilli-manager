const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const costo = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});
const fechaHora = new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' });

// S/ 1,234.50
export const formatearSoles = (n) => moneda.format(n ?? 0);
// Hasta 4 decimales, para costos promedio como S/ 3.3333
export const formatearCosto = (n) => costo.format(n ?? 0);
export const formatearFechaHora = (f) => fechaHora.format(new Date(f));