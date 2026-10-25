## Nom de l'application

**Lucook** : un générateur de recettes par IA.

## Présentation

Lucook propose trois recettes adaptées à la situation de l'utilisateur connecté. Il y a trois points de départ :

- **Frigo** : l'utilisateur liste ses ingrédients et/ou envoie une photo de son frigo. Les recettes utilisent ce qu'il a, et les ingrédients à acheter sont signalés.
- **Envie** : l'utilisateur décrit une envie (plat, humeur, saison) et peut préciser un temps maximum, un budget et une difficulté.
- **Sport** : l'utilisateur choisit un objectif (prise de masse, sèche, maintien) et/ou des apports cibles en kcal, protéines, glucides et lipides. Chaque recette indique ses macros estimées.

Le parcours est le suivant : l'utilisateur se connecte par lien magique et envoie sa demande. La génération se fait en arrière-plan, et la page de suivi se met à jour en temps réel jusqu'à l'affichage des trois recettes. Celles-ci sont enregistrées et rattachées à leur auteur.

Il les retrouve ensuite dans **Mes recettes**, avec des filtres par mode et par favoris. Il peut ouvrir chaque recette en détail (ingrédients à cocher, étapes, macros, photo de départ). Il peut aussi recevoir par e-mail un résumé et une **liste de courses** regroupée par rayon pour les recettes de son choix.

Son **profil** (régime alimentaire, ingrédients à éviter, objectif sport par défaut) est pris en compte à chaque génération. Une page **/admin** réservée aux administrateurs contrôle l'état de tous les services.

## Adresse de production

https://lucook-wmgi.vercel.app

## Architecture

```
Navigateur (Next.js, composants React)
   │  connexion par lien magique et lectures via la RLS (Supabase Auth + Postgres)
   │  envoi direct de la photo dans le bucket privé (Supabase Storage)
   │  abonnement au statut de la génération (Supabase Realtime)
   ▼
Vercel ─ POST /api/generations ──► vérifie la session, valide (Zod), applique le quota (Upstash Redis)
   │                                 crée la génération « en_attente », publie la tâche (QStash), répond 202
   │
   │      QStash ──► POST /api/jobs/generer-recettes (signature vérifiée, nouvelles tentatives)
   │                   ├─ lit la photo (Storage) et le profil
   │                   ├─ appelle le modèle d'IA, valide la réponse (Zod), corrige si besoin
   │                   ├─ enregistre les 3 recettes, passe la génération à « terminee » (déclenche Realtime)
   │                   └─ envoie l'e-mail « recettes prêtes » (Resend), sans bloquer en cas d'échec
   │      QStash ──► POST /api/jobs/echec-generation (après la dernière tentative : statut « erreur »)
   │
   ├─ POST /api/emails/liste-courses ──► résumé et liste de courses par e-mail (Resend)
   └─ /admin et /api/admin/statut ──► contrôle de santé de chaque service
```

| Service | Rôle |
|---|---|
| **Vercel** | Hébergement de l'application Next.js 16 (App Router), des routes API et des fonctions serverless (worker). |
| **Supabase Postgres** | Données : profils, générations, recettes, journal des e-mails. Row Level Security sur toutes les tables. |
| **Supabase Auth** | Connexion par lien magique (e-mails envoyés via le SMTP de Resend). |
| **Modèle d'IA hébergé** | Transforme la demande (texte et/ou photo) en 3 recettes au format JSON. Appelé uniquement côté serveur. |
| **Upstash Redis** | Limitation de débit par utilisateur : 5 générations et 5 e-mails par heure, en fenêtre glissante. |

### Briques choisies et pourquoi

| Brique | Utilisation | Pourquoi |
|---|---|---|
| **Upstash QStash** | La route API publie une tâche et répond **immédiatement (202)**. Le worker vérifie la **signature** de QStash, qui réessaie jusqu'à 3 fois en cas d'échec passager. Un `failureCallback` passe la génération en erreur après la dernière tentative. | Une génération dure de 10 à 40 secondes : la faire dans la requête bloquerait l'utilisateur et risquerait de dépasser les délais des fonctions serverless. QStash garantit la reprise. |
| **Supabase Realtime** | La page `/generations/[id]` s'abonne aux mises à jour de sa génération (`postgres_changes`, filtrée par identifiant, canal authentifié pour que la RLS s'applique) et affiche les recettes **sans rechargement**. | Suivi naturel d'un traitement asynchrone, sans requêtes répétées. |
| **Supabase Storage** | Bucket **privé** `photos-frigo`. Chaque utilisateur ne lit et n'écrit que dans son dossier `<user_id>/`. La photo est envoyée au modèle (vision) par le worker, puis réaffichée sur la recette via une URL signée de 5 minutes. | Le mode Frigo par photo est le cas d'usage le plus naturel, et les photos de cuisine sont personnelles. |
| **Resend** | E-mail « tes recettes sont prêtes » envoyé à la fin de la génération, et e-mail de **résumé et liste de courses** à la demande. Tout envoi est journalisé dans `envois_email`. Un échec n'interrompt jamais la génération : délai maximal de 10 secondes, erreur interceptée et enregistrée. | L'utilisateur peut quitter la page pendant la génération, et la liste de courses se consulte au magasin. |

Chaque service et chaque brique a son contrôle de santé dans **/admin** : base de données, authentification, stockage (bucket privé vérifié), temps réel (abonnement test), modèle d'IA (appel minimal), Redis (ping), QStash (appel à l'API) et Resend (validité de la clé).

## Modèle d'IA

- **Fournisseur** : Anthropic, via son point d'accès compatible avec le format *chat completions* (`AI_BASE_URL=https://api.anthropic.com/v1`).
- **Modèle** : `claude-haiku-5-5`, configuré par `AI_MODEL`.
- **Configuration** : `AI_BASE_URL`, `AI_API_KEY` et `AI_MODEL`, lues uniquement côté serveur. [src/lib/ia.ts](src/lib/ia.ts) est marqué `server-only`.
- **Réponse structurée et vérifiée** : le prompt impose un JSON précis. La réponse est extraite puis validée par un schéma **Zod** strict ([src/lib/recette.ts](src/lib/recette.ts) : exactement 3 recettes, types, bornes, rayons, macros obligatoires en mode Sport). Si elle est invalide, le modèle reçoit le détail des erreurs et doit corriger, une seule fois. Les entrées de l'utilisateur sont traitées comme des données : le prompt demande d'ignorer toute instruction qu'elles contiendraient.

**Justification** : Haiku est rapide (une génération en 10 à 20 secondes) et peu coûteux, ce qui compte avec un quota de 5 générations par heure et par utilisateur. Il accepte les **images**, indispensables pour le mode Frigo par photo, et respecte bien un format JSON imposé. Le format *chat completions* permet de changer de fournisseur en modifiant seulement les trois variables.

## Structure de données

Le script versionné est [supabase/migrations/001_schema.sql](supabase/migrations/001_schema.sql). Il est idempotent et peut être relancé.

| Table | Contenu | Relations |
|---|---|---|
| `profils` | Rôle (`utilisateur` ou `admin`), régime, ingrédients à éviter, objectif sport. Créé automatiquement à l'inscription (trigger). | `user_id` → `auth.users` (clé primaire) |
| `generations` | Mode, entrées validées (JSON), chemin de la photo, statut (`en_attente`, `en_cours`, `terminee`, `erreur`), message d'erreur, nombre de tentatives. | `user_id` → `auth.users` |
| `recettes` | Titre, description, temps, difficulté, portions, ingrédients et étapes (JSON), macros, tags, favori. | `user_id` → `auth.users`, **`generation_id` → `generations`** (suppression en cascade) |
| `envois_email` | Recettes concernées, statut (`envoye` ou `echec`), erreur éventuelle. | `user_id` → `auth.users` |

Chaque table a une colonne `user_id`.

### Règles de sécurité

- La **Row Level Security est activée sur toutes les tables**. Chaque utilisateur ne lit que ses propres lignes. Un administrateur peut tout lire via la fonction `est_admin()`, qui est `security definer` pour éviter la récursion.
- **Écritures restreintes par colonne** : un utilisateur ne peut modifier que `regime`, `ingredients_a_eviter` et `objectif_sport` de son profil (jamais son rôle), et seulement `favori` sur ses recettes. Il peut créer une génération, mais uniquement au statut `en_attente`.
- Les recettes et le passage d'un statut à l'autre ne sont écrits que par le **worker**, avec la clé secrète. Aucune politique ne le permet à l'utilisateur.
- **Storage** : bucket privé, avec des politiques de lecture, d'envoi et de suppression limitées au dossier `<user_id>/`. L'API vérifie en plus que le chemin de la photo commence par l'identifiant de l'utilisateur.
- **Client administrateur** (clé secrète) : il n'est utilisé que côté serveur, dans le worker, dans le passage en erreur quand la publication échoue, et dans les contrôles de `/admin`. Tout le reste passe par la session de l'utilisateur et la RLS.
- **Realtime** : publication activée sur `generations` et `recettes`. Le canal est authentifié avec le jeton de l'utilisateur, donc la RLS s'applique aux événements.

## Lancer le projet en local

### Prérequis

- Node.js 20.9 ou plus récent, et npm.
- Un projet **Supabase** (base, Auth, Storage, Realtime), une base **Upstash Redis**, un compte **Resend** avec un domaine vérifié, et une clé d'API **Anthropic**.

### Installation

```bash
git clone https://github.com/Lucasefrei123/lucook.git
cd lucook
npm install
cp .env.example .env.local
```

1. Remplis `.env.local` en suivant le tableau ci-dessous.
2. Dans Supabase, ouvre *SQL Editor* et exécute `supabase/migrations/001_schema.sql`.
3. Dans Supabase, va dans *Authentication → URL Configuration* et ajoute `http://localhost:3000/**` aux *Redirect URLs*.
4. Pour accéder à `/admin`, connecte-toi une première fois, puis exécute : `update public.profils set role = 'admin' where user_id = '<ton id>';`

### Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | URL et clé publique de Supabase. Publiques par nature, protégées par la RLS. |
| `SUPABASE_SECRET_KEY` | Clé secrète de Supabase, côté serveur uniquement (worker, admin). |
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Modèle d'IA (format *chat completions*). |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `QUOTA_PAR_HEURE` | Limitation de débit (5 générations par heure par défaut). |
| `QSTASH_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`, `NOMBRE_REESSAIS` | File de tâches et vérification de signature (3 nouvelles tentatives par défaut). |
| `RESEND_API_KEY`, `EMAIL_EXPEDITEUR` | Envoi des e-mails (par exemple `Lucook <recettes@mail.mondomaine.fr>`). |
| `APP_URL` | URL publique de l'application, appelée par QStash : `http://localhost:3000` en local, l'URL de production sur Vercel. |

### Démarrage

QStash, le service hébergé, ne peut pas appeler `localhost`. En local, on utilise donc le serveur QStash de développement d'Upstash :

1. Crée un fichier `.env.development.local`, ignoré par git et chargé uniquement par `npm run dev`. Il remplace les valeurs QStash de `.env.local` par les identifiants que le serveur local affiche au démarrage :

   ```
   QSTASH_URL=http://127.0.0.1:8081
   QSTASH_TOKEN=<affiché par npm run dev:qstash>
   QSTASH_CURRENT_SIGNING_KEY=<affiché par npm run dev:qstash>
   QSTASH_NEXT_SIGNING_KEY=<affiché par npm run dev:qstash>
   APP_URL=http://localhost:3000
   ```

2. Lance les deux processus, dans deux terminaux :

   ```bash
   npm run dev:qstash
   npm run dev
   ```

3. Ouvre http://localhost:3000 (le port 3000 doit être libre, puisque c'est la valeur d'`APP_URL`).

Vérifications de qualité : `npm run lint`, `npm run typecheck`, `npm run build`.

### Déploiement

Le projet Vercel est relié au dépôt GitHub, et chaque push sur `main` déploie la production. Toutes les variables ci-dessus doivent être définies dans Vercel, avec `APP_URL` égal au **domaine de production**. Les URL de prévisualisation sont protégées par l'authentification Vercel, et QStash ne pourrait pas les appeler.

## Limites et améliorations possibles

- **Panne de Redis** : dans ce cas, le quota **refuse** les générations (message « service momentanément indisponible ») plutôt que de laisser passer des appels au modèle sans limite. C'est un choix de maîtrise des coûts au détriment de la disponibilité.
- **Valeurs nutritionnelles** : elles sont **estimées** par le modèle et affichées comme telles. Une base nutritionnelle (Ciqual, Open Food Facts) les rendrait fiables.
- **Plan gratuit de Supabase** : le projet se met en pause après 7 jours sans activité. Une tâche planifiée (cron Vercel ou planification QStash) qui interroge la base l'éviterait, tout comme le passage à l'offre payante.
- **Photos** : elles sont conservées sans durée limite. Une suppression automatique après génération, ou au bout de N jours, réduirait les données personnelles stockées.
- **Quotas** : ils sont fixes (5 générations et 5 e-mails par heure). Des quotas par offre ou un compteur visible dans l'interface aideraient l'utilisateur.
- **Retour sur les recettes** : régénérer une seule recette, ajuster les portions et recalculer les quantités, ou noter une recette pour affiner les suivantes.
- **Tests** : il n'y a pas de tests automatisés. On pourrait ajouter des tests unitaires des schémas Zod et des gabarits d'e-mail, et des tests de bout en bout du parcours de génération (Playwright).
- **Observabilité** : des logs structurés et un suivi des erreurs (Sentry) en complément des contrôles de `/admin`.
