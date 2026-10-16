# Lucook — Plan de l'interface

## 0. État des lieux

- shadcn est déjà initialisé (style `base-nova`, primitives `@base-ui/react`, `cn` via le paquet `cn`). Composants présents : badge, button, card, input, label, select, sonner, tabs, textarea. À ajouter : checkbox, skeleton, separator, dropdown-menu, toggle-group.
- `framer-motion`, `lucide-react`, `next-themes`, `sonner` sont déjà installés.
- Des changements non commités traînent (init shadcn, `globals.css`, déplacement de `/auth/callback/deconnexion` vers `/auth/deconnexion`, retouches sur `next.config.ts` et `admin/page.tsx`). Je les inclurai tels quels dans le commit de la phase 1, sans rien supprimer de plus.
- Le backend n'est pas touché. Tout passe par `entreesSchema`, `POST /api/generations`, les clients Supabase navigateur et serveur, et la RLS existante (`favori` seul modifiable sur `recettes` ; `regime`, `ingredients_a_eviter` et `objectif_sport` seuls modifiables sur `profils`).

## 1. Directions visuelles

### A. Bento japonais (recommandée)

L'écran est organisé comme une boîte à bento : un plateau en bois clair découpé en compartiments rectangulaires, séparés par de fines cloisons de 1 px. Il n'y a ni ombres portées ni dégradés, et les angles sont presque droits (rayon de 2 px). Chaque information occupe sa propre case.

| Rôle | Clair | Sombre |
|---|---|---|
| Fond (washi) | `#F4EFE6` | `#1F1D1A` (encre) |
| Compartiment | `#FBF8F2` | `#2A2723` |
| Cloisons, bois clair | `#D9C4A3` | `#4A3B2C` |
| Bois foncé (texte secondaire, cadres) | `#6B4F36` | `#C9B08A` |
| Texte (encre) | `#1F1D1A` | `#F4EFE6` |
| Primaire, vermillon | `#C8402F` | `#E0604E` |
| Matcha (remplissage) / matcha pour le texte | `#7A8B5A` / `#55663A` | `#9DB07A` |
| Indigo | `#2E4A62` | `#7FA0BE` |

- **Accents par mode** : Frigo en indigo (le froid), Envie en vermillon (la gourmandise), Sport en matcha (la sobriété). Le matcha `#7A8B5A` n'atteint pas 4,5:1 sur le washi : il sert pour les aplats et les bordures, et le texte utilise `#55663A`.
- **Typographies** : Shippori Mincho pour les titres (serif japonaise, élégante pour les noms de recettes), Zen Kaku Gothic New pour le texte et l'interface, IBM Plex Mono pour les chiffres (temps, kcal, grammes, numéros d'étapes, horodatages).
- **Mise en page** : une grille en cases avec `gap-px` sur un fond « bois », ce qui dessine les cloisons sans aucune bordure. Sur mobile, les cases s'empilent en une colonne ; à partir de `md`, la grille passe à 6 colonnes avec des cases de tailles différentes. Les recettes sont présentées en bento asymétrique : une grande case (2×2) et deux petites. Les numéros d'étapes sont des petits tampons carrés vermillon.

### B. Marché du dimanche

Une direction éditoriale et chaleureuse, dans l'esprit d'un magazine de cuisine : grandes photos absentes mais grandes typos, papier crème, encres terreuses.

- **Palette** : crème `#FAF6EE`, terre cuite `#B5532E`, olive `#5E6B3A`, bleu ardoise `#3C4F5C`, encre brune `#2B211A`. Fond sombre `#1C1714`.
- **Typographies** : Fraunces pour les titres, Instrument Sans pour le texte, Geist Mono pour les chiffres.
- **Mise en page** : une colonne de lecture centrée, des titres très grands et des filets horizontaux. Les recettes sont présentées comme des articles : une « une » suivie de deux brèves.

### C. Labo nutrition

Une direction suisse, précise et sportive : grille stricte, beaucoup de blanc et un accent vif unique.

- **Palette** : blanc `#FFFFFF`, gris `#F2F2F0`, noir `#111111`, citron vert `#C6F432` (accent), rouge signal `#FF4D2E`. Fond sombre `#0E0E0E`.
- **Typographies** : Space Grotesk pour les titres, Inter Tight pour le texte, JetBrains Mono pour les chiffres.
- **Mise en page** : une grille de 12 colonnes, des étiquettes en majuscules en petit corps et des macros mises en avant sous forme de jauges. Les recettes sont présentées comme des fiches techniques.

## 2. Composants Skiper UI retenus (gratuits)

J'ai vérifié l'accès au registre `skiper-ui.com/r/skiperXX.json` sans compte : ceux qui répondent 200 sont gratuits, ceux qui répondent 401 sont Pro. Voici les trois composants retenus et un quatrième en option.

| Composant | Ce qu'il fait | Où | Pourquoi |
|---|---|---|---|
| **skiper62**, hook `useLoop` et texte en rotation | Fait défiler des phrases en boucle avec une animation de glissement vertical | `/generations/[id]`, pendant les états « en attente » et « en préparation » | Pendant l'attente, des phrases de cuisine défilent (« On épluche les carottes… », « Le dashi infuse… ») au-dessus d'une animation maison : les trois compartiments du bento se remplissent l'un après l'autre. C'est engageant sans être un spinner. Il est léger (framer-motion seul). |
| **skiper52**, `HoverExpand` | Panneaux horizontaux dont celui survolé ou actif s'élargit | Accueil, choix du mode | Les trois modes (Frigo, Envie, Sport) deviennent trois compartiments colorés. Le mode choisi s'élargit et montre sa description. Je l'adapte : des aplats et des icônes au lieu d'images, des imports `swiper` inutilisés retirés, des `button` accessibles (`aria-pressed`) et une version empilée sur mobile. |
| **skiper26**, bascule de thème animée | Bouton clair/sombre avec une transition View Transitions | En-tête | Le passage clair/sombre balaie l'écran comme un fusuma qui coulisse. Il s'appuie sur `next-themes`, déjà installé. Je ne garde qu'une variante (le rectangle de bas en haut) et je retire la démo. |
| *(option)* **skiper58**, `TextRoll` | Les lettres d'un lien roulent au survol | Les trois liens de la navigation | Un petit détail de finition. Je ne l'ajoute que si tu le souhaites. |

L'apparition des recettes se fait avec framer-motion directement (les cases apparaissent l'une après l'autre en 80 ms). Aucun composant Skiper gratuit ne convient ici : skiper16 est lié au défilement et demande `lenis`. Toutes les animations respectent `prefers-reduced-motion` grâce à `useReducedMotion` : la rotation et les cases restent figées, et la bascule de thème se fait sans transition.

Le crédit « Composants : Skiper UI » apparaîtra dans le pied de page, avec un lien vers https://skiper-ui.com.

## 3. Écrans et composants

### Mise en page commune
- `src/app/layout.tsx` : les polices via `next/font/google`, `lang="fr"`, `ThemeProvider` (next-themes), `Toaster`, l'en-tête et le pied de page.
- `src/components/fournisseur-theme.tsx` (client)
- `src/components/en-tete.tsx` (serveur) : le nom de l'app, les liens, le lien Admin si `rpc("est_admin")` le permet, la bascule de thème et le bouton de déconnexion (formulaire POST vers `/auth/deconnexion`).
- `src/components/navigation.tsx` (client) : le lien actif via `usePathname` et un menu mobile.
- `src/components/pied-de-page.tsx`
- `src/components/skiper/…` : les composants Skiper installés puis adaptés.
- `src/lib/modes.ts` : les libellés, icônes et classes d'accent de chaque mode, toutes écrites en entier dans un objet. Ce module ne contient que de la présentation, pas de logique backend.

### Accueil `/`
- `src/app/page.tsx` (serveur) : charge le profil pour pré-remplir l'objectif sport et rappeler le régime.
- `src/components/accueil/choix-mode.tsx` (client, skiper52)
- `src/components/accueil/formulaire-generation.tsx` (client) : l'état, la validation `entreesSchema.safeParse`, l'appel à l'API et la redirection.
- `src/components/accueil/champs-frigo.tsx`, `champs-envie.tsx`, `champs-sport.tsx`
- `src/components/accueil/depot-photo.tsx` : contrôle du type et de la taille, aperçu, puis envoi dans `photos-frigo/${user.id}/${uuid}.${ext}` avant l'appel à l'API.
- `src/components/erreur-champ.tsx` : le message lié par `aria-describedby`.
- Erreurs de l'API : un bandeau `role="alert"` pour 401, 403, 429 et 503, et les erreurs de champs (400) reportées près des champs concernés.

### Suivi `/generations/[id]`
- `page.tsx` (serveur) : charge la génération et les recettes, et renvoie `notFound()` si la génération est absente (la RLS s'en charge).
- `src/components/generation/suivi-generation.tsx` (client) : `setAuth(access_token)`, puis un canal `postgres_changes` UPDATE filtré par `id=eq.<id>`, une relecture complète après `SUBSCRIBED`, le rechargement des recettes à `terminee` et `removeChannel` au démontage.
- `attente-preparation.tsx` (skiper62 et les compartiments animés), `bento-recettes.tsx` (la mise en page asymétrique), `erreur-generation.tsx` (le message et le bouton Réessayer, qui renvoie `entrees` revalidées à l'API).
- `carte-recette.tsx`, partagé avec `/recettes`.

### Mes recettes `/recettes`
- `page.tsx` (serveur) : charge les recettes avec le mode de leur génération (jointure `generations(mode)`).
- `src/components/recettes/liste-recettes.tsx` (client) : les filtres par mode et par favoris (`ToggleGroup`), la sélection multiple avec cases à cocher et une barre d'action collante qui affiche le bouton e-mail désactivé avec la mention « bientôt disponible ».
- `bouton-favori.tsx` (client) : mise à jour optimiste de `favori` seul, avec retour en arrière et toast en cas d'échec.
- `etat-vide.tsx` : un bento vide illustré et un lien vers l'accueil.

### Détail `/recettes/[id]`
- `page.tsx` (serveur) : la recette, la génération (`chemin_photo`, `mode`), une URL signée de 300 s si une photo existe, et `notFound()` sinon.
- Composants : `liste-ingredients.tsx` (client, ingrédients cochables, ingrédients `manquant` mis en évidence avec un badge vermillon « à acheter »), `etapes.tsx`, `bloc-macros.tsx` (avec la mention « valeurs estimées ») et le bouton favori.

### Profil `/profil`
- `page.tsx` (serveur) et `src/components/profil/formulaire-profil.tsx` (client) : le régime (un select avec un choix « autre » libre), les ingrédients à éviter (des pastilles qu'on ajoute avec Entrée et qu'on retire d'un clic), l'objectif sport, puis un `update` limité aux trois colonnes autorisées et un toast.

### Connexion, erreurs et chargements
- `/connexion` est restylé : la page et `formulaire-connexion.tsx` reçoivent uniquement de nouvelles classes et des composants shadcn, sans changer la logique.
- `/admin` est harmonisé visuellement : classes, Card et Badge, sans toucher à la logique.
- `src/app/error.tsx`, `src/app/not-found.tsx` et `src/app/global-error.tsx`, plus un `error.tsx` dans `generations/[id]`, `recettes` et `profil`.
- Des `loading.tsx` avec des squelettes en cases de bento pour `/`, `/generations/[id]`, `/recettes`, `/recettes/[id]` et `/profil`.

## 4. Phases

Chaque phase se termine par `npm run lint`, `npm run typecheck` et `npm run build` sans erreur, puis par un commit en Conventional Commits rédigé en français.

1. **Fondations** : les composants shadcn manquants, skiper62, skiper52 et skiper26 (plus skiper58 si tu le valides), le thème dans `globals.css` (clair et sombre), les polices, le layout, l'en-tête, la navigation et le pied de page avec le crédit. Commit : `feat(ui): thème bento, polices et navigation commune`.
2. **Accueil** : le choix du mode, les trois formulaires, l'envoi de photo et la gestion des erreurs. Commit : `feat(accueil): formulaire de génération des trois modes`.
3. **Suivi en temps réel** : l'abonnement Realtime, l'animation d'attente, le bento de recettes et le bouton Réessayer. Commit : `feat(generations): suivi en temps réel`.
4. **Mes recettes** : les filtres, les favoris, la sélection et l'état vide. Commit : `feat(recettes): historique, favoris et sélection`.
5. **Détail d'une recette** : les ingrédients cochables, les étapes, les macros et la photo signée. Commit : `feat(recettes): page de détail`.
6. **Profil** : `feat(profil): préférences alimentaires`.
7. **Finitions** : la connexion restylée, l'admin harmonisé, `error.tsx`, `not-found.tsx` et `loading.tsx`, puis une passe sur le responsive, le mode sombre et l'accessibilité. Commit : `feat(ui): pages d'erreur, chargements et finitions`.

## 5. Points à valider

1. **La direction** : A (Bento japonais), B ou C.
2. **skiper58** sur la navigation : oui ou non.
3. **Un réglage de config dans la phase 1** : skiper26 utilise l'API View Transitions et n'a besoin d'aucune option Next. Je ne touche donc pas à `next.config.ts`, sauf pour retirer la ligne vide ajoutée par erreur à la fin du fichier, si tu es d'accord.
