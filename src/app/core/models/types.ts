/**
 * Modèles alignés sur les entités réelles des microservices Spring Boot.
 */

export type UserRole = 'ADMIN' | 'CLIENT';

/* ===================== Gestion-Utilisateur ===================== */
export interface Role {
  id?: number;
  nom: string;
  description?: string;
}

export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;   // format ISO yyyy-MM-dd
  telephone?: string;
  email: string;
  motDePasse?: string;
  roleId?: number;
}

/* Utilisateur connecté, conservé en session (localStorage) */
export interface SessionUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  roleId?: number;
}

/* ===================== Revenue-Service ===================== */
export interface CategorieRevenue {
  id?: number;
  name: string;
  description?: string;
}

export interface Revenue {
  id?: number;
  amount: number;
  source: string;
  date: string;             // yyyy-MM-dd
  description: string;
  categoryId: number;
  userId: number;
}

/* ===================== Gestion-Objectif ===================== */
export interface CategorieObjectif {
  id?: number;
  nom: string;
  description?: string;
}

export interface Objectif {
  id?: number;
  titre: string;
  montantGlobal: number;
  frequence: string;        // ex: MENSUELLE
  mensualite: number;
  mois: number;
  annee: number;
  commentaire?: string;
  statut: string;           // EN_COURS | ATTEINT | ABANDONNE
  userId: number;
  categorieId: number;
}

/* ===================== Reclamation-Service ===================== */
export interface Reclamation {
  id?: number;
  sujet: string;
  message: string;
  statut?: string;          // EN_ATTENTE | EN_TRAITEMENT | RESOLUE
  dateCreation?: string;
  reponse?: string;
  dateReponse?: string;
  userId: number;
}

/* ===================== Forum ===================== */
export interface Post {
  id?: number;
  titre: string;
  contenu: string;
  auteur: string;
  userId: number;
  dateCreation?: string;
}

export interface Commentaire {
  id?: number;
  contenu: string;
  auteur: string;
  userId: number;
  dateCreation?: string;
  post: { id: number };
}

/* ===================== Notifications (microservice Django, port 8086) ===== */
export type NotificationType =
  | 'notification.revenue.ajoute'
  | 'notification.depense.ajoutee'
  | 'notification.objectif.atteint'
  | 'notification.reclamation.creee'
  | 'notification.post.cree'
  | string;

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: NotificationType;
  data: Record<string, any>;
  is_read: boolean;
  timestamp: string;            // ISO 8601
}

/* ===================== Dépense (microservice Depense, port 8081) ===== */
export interface Depense {
  id: number;
  titre?: string;           // requis par le backend, pris depuis description si absent
  montant: number;
  description: string;
  categorie: string;
  date: string;
  userId: number;
}
