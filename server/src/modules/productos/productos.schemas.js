import { z } from 'zod';

const nombre = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(120, 'El nombre no puede superar 120 caracteres');

const motivo = z
  .string()
  .trim()
  .min(3, 'El motivo es obligatorio (mínimo 3 caracteres)')
  .max(200, 'El motivo no puede superar 200 caracteres');

// Texto opcional: "" se guarda como null
const textoOpcional = (max, etiqueta) =>
  z
    .string()
    .trim()
    .max(max, `${etiqueta} no puede superar ${max} caracteres`)
    .transform((v) => (v === '' ? null : v))
    .nullish();

const urlOpcional = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^https?:\/\/\S+$/i.test(v),
    'La URL de la foto no es válida (debe empezar con http:// o https://)'
  )
  .transform((v) => (v === '' ? null : v))
  .nullish();

const categoriaId = z.number().int().positive('Categoría no válida').nullish();

export const crearProductoSchema = z
  .object({
    nombre,
    categoriaId,
    marca: textoOpcional(80, 'La marca'),
    sku: textoOpcional(60, 'El SKU'),
    fotoUrl: urlOpcional,
    stockMinimo: z.number().int('El stock mínimo debe ser entero').min(0, 'El stock mínimo no puede ser negativo').default(0),
    stockInicial: z.number().int('El stock inicial debe ser entero').min(0, 'El stock inicial no puede ser negativo').default(0),
    costoInicial: z.number().min(0, 'El costo no puede ser negativo').max(1000000, 'El costo es demasiado alto').default(0),
  })
  .superRefine((datos, ctx) => {
    if (datos.stockInicial > 0 && !(datos.costoInicial > 0)) {
      ctx.addIssue({
        code: 'custom',
        path: ['costoInicial'],
        message: 'El costo unitario inicial es obligatorio y debe ser mayor que 0 cuando hay stock inicial',
      });
    }
  });

// Solo datos generales: NO acepta stock ni costo (los campos desconocidos se descartan)
export const actualizarProductoSchema = z.object({
  nombre: nombre.optional(),
  categoriaId,
  marca: textoOpcional(80, 'La marca'),
  sku: textoOpcional(60, 'El SKU'),
  fotoUrl: urlOpcional,
  stockMinimo: z.number().int('El stock mínimo debe ser entero').min(0, 'El stock mínimo no puede ser negativo').optional(),
  activo: z.boolean().optional(),
});

export const ajusteStockSchema = z.object({
  cantidad: z
    .number()
    .int('La cantidad debe ser un número entero')
    .refine((n) => n !== 0, 'La cantidad no puede ser 0'),
  motivo,
});

export const ajusteCostoSchema = z.object({
  costoNuevo: z.number().min(0, 'El costo no puede ser negativo').max(1000000, 'El costo es demasiado alto'),
  motivo,
});

export const listadoQuerySchema = z.object({
  buscar: z.string().trim().optional(),
  categoriaId: z.coerce.number().int().positive('Categoría no válida').optional(),
  // "alerta" = stock bajo + agotado
  estado: z.enum(['ok', 'bajo', 'agotado', 'alerta'], { message: 'Estado no válido' }).optional(),
  activo: z.enum(['true', 'false', 'todos'], { message: 'Valor de "activo" no válido' }).default('true'),
});

export const kardexQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});