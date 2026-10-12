import { Router } from 'express';
import { requerirAuth, requerirRol } from '../../middlewares/auth.js';
import { validar } from '../../middlewares/validar.js';
import { leerId } from '../../lib/errores.js';
import {
  crearProductoSchema,
  actualizarProductoSchema,
  ajusteStockSchema,
  ajusteCostoSchema,
  listadoQuerySchema,
  kardexQuerySchema,
} from './productos.schemas.js';
import {
  listarProductos,
  obtenerResumen,
  obtenerProducto,
  obtenerKardex,
  crearProducto,
  actualizarProducto,
  ajustarStock,
  ajustarCosto,
  serializarProducto,
} from './productos.service.js';

const router = Router();

// Todo el módulo exige sesión iniciada
router.use(requerirAuth);

// ----- Lectura (admin y ayudante) -----

router.get('/', validar(listadoQuerySchema, 'query'), async (req, res) => {
  const productos = await listarProductos(req.datos, req.usuario.rol);
  res.json({ productos });
});

// Debe ir antes de '/:id'
router.get('/resumen', async (req, res) => {
  res.json(await obtenerResumen(req.usuario.rol));
});

router.get('/:id', async (req, res) => {
  const producto = await obtenerProducto(leerId(req.params.id), req.usuario.rol);
  res.json({ producto });
});

router.get('/:id/kardex', validar(kardexQuerySchema, 'query'), async (req, res) => {
  res.json(await obtenerKardex(leerId(req.params.id), req.datos));
});

// ----- Escritura (solo admin) -----

router.post('/', requerirRol('admin'), validar(crearProductoSchema), async (req, res) => {
  const producto = await crearProducto(req.datos, req.usuario);
  res.status(201).json({ producto: serializarProducto(producto, req.usuario.rol) });
});

router.put('/:id', requerirRol('admin'), validar(actualizarProductoSchema), async (req, res) => {
  const producto = await actualizarProducto(leerId(req.params.id), req.datos, req.usuario);
  res.json({ producto: serializarProducto(producto, req.usuario.rol) });
});

router.post('/:id/ajuste-stock', requerirRol('admin'), validar(ajusteStockSchema), async (req, res) => {
  const producto = await ajustarStock(leerId(req.params.id), req.datos, req.usuario);
  res.json({ producto: serializarProducto(producto, req.usuario.rol) });
});

router.post('/:id/ajuste-costo', requerirRol('admin'), validar(ajusteCostoSchema), async (req, res) => {
  const producto = await ajustarCosto(leerId(req.params.id), req.datos, req.usuario);
  res.json({ producto: serializarProducto(producto, req.usuario.rol) });
});

export default router;