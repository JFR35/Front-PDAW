import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    // Indicar si la ruta requiere autenticación previa.
    requiresAuth?: boolean;
    // Listado de roles permitidos para acceder a la ruta.
    roles?: string[];
  }
}
