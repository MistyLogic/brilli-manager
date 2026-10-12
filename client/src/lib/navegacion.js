import {
  LayoutDashboard, ShoppingCart, Users, Truck, Boxes,
  PackagePlus, Wallet, Receipt, TrendingUp, Settings,
} from 'lucide-react';

// principal: aparece en la barra inferior del celular
export const SECCIONES = [
  { ruta: '/', etiqueta: 'Dashboard', icono: LayoutDashboard, roles: ['admin'], end: true },
  { ruta: '/ventas', etiqueta: 'Ventas', icono: ShoppingCart, roles: ['admin', 'ayudante'], principal: true },
  { ruta: '/pedidos', etiqueta: 'Pedidos', icono: Truck, roles: ['admin', 'ayudante'], principal: true },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: Users, roles: ['admin', 'ayudante'], principal: true },
  { ruta: '/inventario', etiqueta: 'Inventario', icono: Boxes, roles: ['admin', 'ayudante'], principal: true },
  { ruta: '/compras', etiqueta: 'Compras', icono: PackagePlus, roles: ['admin'] },
  { ruta: '/caja', etiqueta: 'Caja', icono: Wallet, roles: ['admin'] },
  { ruta: '/finanzas', etiqueta: 'Finanzas', icono: Receipt, roles: ['admin'] },
  { ruta: '/reportes', etiqueta: 'Reportes', icono: TrendingUp, roles: ['admin'] },
  { ruta: '/config', etiqueta: 'Configuración', icono: Settings, roles: ['admin'] },
];

export function seccionesPara(rol) {
  return SECCIONES.filter((s) => s.roles.includes(rol));
}