import { prisma } from '../../lib/prisma.js';
import { ErrorHttp } from '../../lib/errores.js';

// Opciones de transacción: margen extra por si Neon está "despertando"
const OPCIONES_TX = { maxWait: 10000, timeout: 15000 };

const redondear2 = (n) => Math.round(n * 100) / 100;
const redondear4 = (n) => Math.round(n * 10000) / 10000;

export function estadoStock(stockActual, stockMinimo) {
  if (stockActual <= 0) return 'agotado';
  if (stockActual <= stockMinimo) return 'bajo';
  return 'ok';
}

// Lista blanca de campos: el costo SOLO se incluye para admin.
// Así un campo nuevo del modelo nunca se filtra por accidente al ayudante.
export function serializarProducto(p, rol) {
  const producto = {
    id: p.id,
    nombre: p.nombre,
    categoriaId: p.categoriaId,
    categoria: p.categoria ? { id: p.categoria.id, nombre: p.categoria.nombre } : null,
    marca: p.marca,
    sku: p.sku,
    fotoUrl: p.fotoUrl,
    stockActual: p.stockActual,
    stockMinimo: p.stockMinimo,
    estadoStock: estadoStock(p.stockActual, p.stockMinimo),
    activo: p.activo,
    creadoEn: p.creadoEn,
  };

  if (rol === 'admin') {
    const costo = Number(p.costoPromedio);
    producto.costoPromedio = costo;
    producto.valorStock = redondear2(p.stockActual * costo);
  }
  return producto;
}

function datosAuditoria(p) {
  return {
    nombre: p.nombre,
    categoriaId: p.categoriaId,
    marca: p.marca,
    sku: p.sku,
    fotoUrl: p.fotoUrl,
    stockMinimo: p.stockMinimo,
    stockActual: p.stockActual,
    costoPromedio: Number(p.costoPromedio),
    activo: p.activo,
  };
}

function traducirErrorPrisma(error) {
  if (error?.code === 'P2002') {
    throw new ErrorHttp(409, 'Ya existe un producto con ese SKU');
  }
  throw error;
}

async function verificarCategoria(categoriaId) {
  if (categoriaId == null) return;
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) throw new ErrorHttp(400, 'La categoría seleccionada no existe');
}

// ---------- Consultas ----------

export async function listarProductos(filtros, rol) {
  const where = {};

  // El ayudante solo ve productos activos
  const activo = rol === 'admin' ? filtros.activo : 'true';
  if (activo !== 'todos') where.activo = activo === 'true';

  if (filtros.categoriaId) where.categoriaId = filtros.categoriaId;

  if (filtros.buscar) {
    where.OR = [
      { nombre: { contains: filtros.buscar, mode: 'insensitive' } },
      { marca: { contains: filtros.buscar, mode: 'insensitive' } },
      { sku: { contains: filtros.buscar, mode: 'insensitive' } },
    ];
  }

  const productos = await prisma.producto.findMany({
    where,
    include: { categoria: true },
    orderBy: { nombre: 'asc' },
  });

  let resultado = productos.map((p) => serializarProducto(p, rol));

  // El estado depende de comparar dos columnas, por eso se filtra aquí
  if (filtros.estado === 'alerta') {
    resultado = resultado.filter((p) => p.estadoStock !== 'ok');
  } else if (filtros.estado) {
    resultado = resultado.filter((p) => p.estadoStock === filtros.estado);
  }
  return resultado;
}

export async function obtenerResumen(rol) {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { stockActual: true, stockMinimo: true, costoPromedio: true },
  });

  let stockBajo = 0;
  let agotados = 0;
  let valor = 0;

  for (const p of productos) {
    const estado = estadoStock(p.stockActual, p.stockMinimo);
    if (estado === 'bajo') stockBajo++;
    if (estado === 'agotado') agotados++;
    valor += p.stockActual * Number(p.costoPromedio);
  }

  const resumen = { totalActivos: productos.length, stockBajo, agotados };
  if (rol === 'admin') resumen.valorInventario = redondear2(valor);
  return resumen;
}

export async function obtenerProducto(id, rol) {
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
  if (!producto) throw new ErrorHttp(404, 'Producto no encontrado');
  return serializarProducto(producto, rol);
}

export async function obtenerKardex(id, { pagina, limite }) {
  const existe = await prisma.producto.findUnique({ where: { id }, select: { id: true } });
  if (!existe) throw new ErrorHttp(404, 'Producto no encontrado');

  const [movimientos, total] = await Promise.all([
    prisma.movimientoStock.findMany({
      where: { productoId: id },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      skip: (pagina - 1) * limite,
      take: limite,
      select: {
        id: true,
        fecha: true,
        tipo: true,
        cantidad: true,
        stockResultante: true,
        motivo: true,
        ventaId: true,
        compraId: true,
      },
    }),
    prisma.movimientoStock.count({ where: { productoId: id } }),
  ]);

  return { movimientos, total, pagina, limite };
}

// ---------- Escrituras (todas con auditoría) ----------

export async function crearProducto(datos, usuario) {
  await verificarCategoria(datos.categoriaId);

  try {
    return await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          nombre: datos.nombre,
          categoriaId: datos.categoriaId ?? null,
          marca: datos.marca ?? null,
          sku: datos.sku ?? null,
          fotoUrl: datos.fotoUrl ?? null,
          stockMinimo: datos.stockMinimo,
          stockActual: datos.stockInicial,
          costoPromedio: redondear4(datos.costoInicial),
        },
        include: { categoria: true },
      });

      if (datos.stockInicial > 0) {
        await tx.movimientoStock.create({
          data: {
            productoId: producto.id,
            tipo: 'ajuste',
            cantidad: datos.stockInicial,
            stockResultante: datos.stockInicial,
            motivo: 'Stock inicial',
          },
        });
      }

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          entidad: 'Producto',
          entidadId: producto.id,
          accion: 'crear',
          datosDespues: datosAuditoria(producto),
        },
      });

      return producto;
    }, OPCIONES_TX);
  } catch (error) {
    traducirErrorPrisma(error);
  }
}

export async function actualizarProducto(id, datos, usuario) {
  if (datos.categoriaId) await verificarCategoria(datos.categoriaId);

  try {
    return await prisma.$transaction(async (tx) => {
      const antes = await tx.producto.findUnique({ where: { id } });
      if (!antes) throw new ErrorHttp(404, 'Producto no encontrado');

      const despues = await tx.producto.update({
        where: { id },
        data: datos, // solo contiene los campos permitidos por el esquema
        include: { categoria: true },
      });

      await tx.auditoria.create({
        data: {
          usuarioId: usuario.id,
          entidad: 'Producto',
          entidadId: id,
          accion: 'editar',
          datosAntes: datosAuditoria(antes),
          datosDespues: datosAuditoria(despues),
        },
      });

      return despues;
    }, OPCIONES_TX);
  } catch (error) {
    traducirErrorPrisma(error);
  }
}

export async function ajustarStock(id, { cantidad, motivo }, usuario) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.producto.findUnique({ where: { id } });
    if (!antes) throw new ErrorHttp(404, 'Producto no encontrado');

    // Actualización atómica: solo se aplica si el stock no queda negativo.
    // Evita errores si dos personas ajustan el mismo producto a la vez.
    const minimoRequerido = cantidad < 0 ? -cantidad : 0;
    const resultado = await tx.producto.updateMany({
      where: { id, stockActual: { gte: minimoRequerido } },
      data: { stockActual: { increment: cantidad } },
    });
    if (resultado.count === 0) {
      throw new ErrorHttp(400, `Stock insuficiente: hay ${antes.stockActual} unidades`);
    }

    const despues = await tx.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    await tx.movimientoStock.create({
      data: {
        productoId: id,
        tipo: 'ajuste',
        cantidad,
        stockResultante: despues.stockActual,
        motivo,
      },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: usuario.id,
        entidad: 'Producto',
        entidadId: id,
        accion: 'ajuste_stock',
        datosAntes: { stockActual: antes.stockActual },
        datosDespues: { stockActual: despues.stockActual, cantidad, motivo },
      },
    });

    return despues;
  }, OPCIONES_TX);
}

export async function ajustarCosto(id, { costoNuevo, motivo }, usuario) {
  return prisma.$transaction(async (tx) => {
    const antes = await tx.producto.findUnique({ where: { id } });
    if (!antes) throw new ErrorHttp(404, 'Producto no encontrado');

    const despues = await tx.producto.update({
      where: { id },
      data: { costoPromedio: redondear4(costoNuevo) },
      include: { categoria: true },
    });

    await tx.auditoria.create({
      data: {
        usuarioId: usuario.id,
        entidad: 'Producto',
        entidadId: id,
        accion: 'ajuste_costo',
        datosAntes: { costoPromedio: Number(antes.costoPromedio) },
        datosDespues: { costoPromedio: Number(despues.costoPromedio), motivo },
      },
    });

    return despues;
  }, OPCIONES_TX);
}