import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { requerirAuth, requerirRol } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validar.js';
import { ErrorHttp, leerId } from '../../lib/errores.js';

const router = Router();
router.use(requerirAuth);

const categoriaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(60, 'El nombre no puede superar 60 caracteres'),
});

// Nombre único sin distinguir mayúsculas ("Labiales" = "labiales")
async function verificarNombreLibre(nombre, excluirId) {
  const where = { nombre: { equals: nombre, mode: 'insensitive' } };
  if (excluirId) where.NOT = { id: excluirId };

  const existente = await prisma.categoria.findFirst({ where });
  if (existente) throw new ErrorHttp(409, 'Ya existe una categoría con ese nombre');
}

router.get('/', async (req, res) => {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: true } } },
  });
  res.json({
    categorias: categorias.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      cantidadProductos: c._count.productos,
    })),
  });
});

router.post('/', requerirRol('admin'), validar(categoriaSchema), async (req, res) => {
  await verificarNombreLibre(req.datos.nombre);
  const categoria = await prisma.categoria.create({ data: { nombre: req.datos.nombre } });
  res.status(201).json({
    categoria: { id: categoria.id, nombre: categoria.nombre, cantidadProductos: 0 },
  });
});

router.put('/:id', requerirRol('admin'), validar(categoriaSchema), async (req, res) => {
  const id = leerId(req.params.id);
  const existe = await prisma.categoria.findUnique({ where: { id } });
  if (!existe) throw new ErrorHttp(404, 'Categoría no encontrada');

  await verificarNombreLibre(req.datos.nombre, id);
  const categoria = await prisma.categoria.update({
    where: { id },
    data: { nombre: req.datos.nombre },
  });
  res.json({ categoria: { id: categoria.id, nombre: categoria.nombre } });
});

router.delete('/:id', requerirRol('admin'), async (req, res) => {
  const id = leerId(req.params.id);
  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: { _count: { select: { productos: true } } },
  });
  if (!categoria) throw new ErrorHttp(404, 'Categoría no encontrada');

  if (categoria._count.productos > 0) {
    throw new ErrorHttp(
      409,
      `No se puede eliminar: la categoría tiene ${categoria._count.productos} producto(s). Muévelos a otra categoría primero.`
    );
  }

  await prisma.categoria.delete({ where: { id } });
  res.json({ mensaje: 'Categoría eliminada' });
});

export default router;