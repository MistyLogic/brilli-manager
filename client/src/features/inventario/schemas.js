import { z } from 'zod';

const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// Convierte el texto de un campo numérico a número (acepta coma o punto; vacío = 0)
export const aNumero = (texto) => {
  const v = String(texto ?? '').trim().replace(',', '.');
  return v === '' ? 0 : Number(v);
};

// Campo numérico escrito como texto
export function numero(nombre, { entero = false, min = 0, opcional = false } = {}) {
  return z
    .string()
    .trim()
    .refine((v) => opcional || v !== '', `Escribe ${nombre}`)
    .transform((v) => aNumero(v))
    .refine((n) => Number.isFinite(n), `${mayuscula(nombre)} debe ser un número`)
    .refine((n) => !entero || Number.isInteger(n), `${mayuscula(nombre)} debe ser un número entero`)
    .refine((n) => n >= min, `${mayuscula(nombre)} no puede ser menor que ${min}`);
}

const motivo = z
  .string()
  .trim()
  .min(3, 'Escribe el motivo (mínimo 3 caracteres)')
  .max(200, 'El motivo no puede superar 200 caracteres');

const productoBase = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar 120 caracteres'),
  categoriaId: z.string(), // "ninguna" o el id de la categoría
  marca: z.string().trim().max(80, 'La marca no puede superar 80 caracteres'),
  sku: z.string().trim().max(60, 'El SKU no puede superar 60 caracteres'),
  fotoUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'La URL debe empezar con http:// o https://'),
  stockMinimo: numero('el stock mínimo', { entero: true, opcional: true }),
});

export const crearProductoSchema = productoBase
  .extend({
    stockInicial: numero('el stock inicial', { entero: true, opcional: true }),
    costoInicial: numero('el costo inicial', { opcional: true }),
  })
  .superRefine((datos, ctx) => {
    if (datos.stockInicial > 0 && !(datos.costoInicial > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['costoInicial'],
        message: 'Escribe el costo unitario (mayor que 0) cuando hay stock inicial',
      });
    }
  });

export const editarProductoSchema = productoBase;

export const ajusteDeltaSchema = z.object({
  cantidad: numero('la cantidad', { entero: true, min: 1 }),
  motivo,
});

export const ajusteConteoSchema = z.object({
  real: numero('el stock real', { entero: true, min: 0 }),
  motivo,
});

export const ajusteCostoSchema = z.object({
  costoNuevo: numero('el costo nuevo', { min: 0 }),
  motivo,
});