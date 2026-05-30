/**
 * Configuration de l'application MoneyMinder.
 * Toutes les requêtes passent par l'API Gateway (Spring Cloud Gateway).
 */
export const environment = {
  production: false,

  // Point d'entrée unique : API Gateway
  apiUrl: 'http://localhost:9000',

  // Préfixes de routes exposés par la Gateway
  routes: {
    revenues: '/revenues',
    categoriesRevenue: '/categories',
    objectifs: '/api/objectifs',
    categoriesObjectif: '/api/categories',
    reclamations: '/api/reclamations',
    utilisateurs: '/api/utilisateurs',
    roles: '/api/roles',
    posts: '/api/posts',
    commentaires: '/api/commentaires',
  },
};
