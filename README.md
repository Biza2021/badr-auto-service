# Badr Auto Service

Application web full-stack pour un garage automobile marocain, en français, avec espace public, prise de rendez-vous, suivi de réparation et back-office admin.

## Pile technique

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Railway avec Railway PostgreSQL

## Installation locale

1. Installer les dépendances :

```bash
npm install
```

2. Copier les variables d’environnement :

```bash
cp .env.example .env
```

3. Renseigner `.env` :

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
AUTH_SECRET="une-valeur-longue-et-aleatoire-de-32-caracteres-minimum"
SEED_ADMIN_EMAIL="admin@badrautoservice.ma"
SEED_ADMIN_PASSWORD="mot-de-passe-local"
```

4. Appliquer les migrations :

```bash
npm run db:migrate
```

5. Charger les données de démonstration :

```bash
npm run db:seed
```

6. Lancer l’application :

```bash
npm run dev
```

L’application sera disponible sur `http://localhost:3000`.

## Routes principales

### Public

- `/`
- `/services`
- `/prendre-rendez-vous`
- `/suivi`
- `/contact`

### Admin

- `/admin/login`
- `/admin`
- `/admin/reparations`
- `/admin/reparations/new`
- `/admin/reparations/[id]`
- `/admin/clients`
- `/admin/clients/[id]`
- `/admin/rendez-vous`
- `/admin/factures`
- `/admin/factures/[id]`
- `/admin/technicien`
- `/admin/parametres`

## Déploiement Railway

1. Créer un projet Railway.
2. Ajouter un service PostgreSQL Railway.
3. Ajouter l’application depuis le dépôt GitHub.
4. Définir les variables d’environnement dans Railway :

```bash
DATABASE_URL="fourni par Railway PostgreSQL"
AUTH_SECRET="valeur aleatoire longue et secrete"
SEED_ADMIN_EMAIL="admin@badrautoservice.ma"
SEED_ADMIN_PASSWORD="mot-de-passe-admin-initial"
```

5. Configurer la commande de build :

```bash
npm run build
```

6. Recommandation de commande pré-déploiement Railway :

```bash
npx prisma migrate deploy
```

7. Après le premier déploiement, lancer le seed une seule fois si nécessaire :

```bash
npm run db:seed
```

## Sécurité

- `DATABASE_URL` et `AUTH_SECRET` viennent des variables d’environnement.
- Les pages admin sont protégées par un cookie de session signé.
- Le suivi public affiche uniquement les informations liées à un code de suivi valide.
- Les mots de passe seed sont hachés avec bcrypt.

## Vérification

```bash
npm run build
```

Le projet a été préparé pour que cette commande génère Prisma puis construise l’application Next.js.
