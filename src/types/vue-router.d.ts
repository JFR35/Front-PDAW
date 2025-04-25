import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    // Indica si la ruta requiere autenticación previa.
    requiresAuth?: boolean;
    // Lista de roles permitidos para acceder a la ruta.
    roles?: string[];
  }
}
