# 🚀 Guide Complet de Déploiement - Boutique Multi-Créateurs

## Phase 1: Préparation Locale

### 1.1 Installation des dépendances
\`\`\`bash
npm install
\`\`\`

### 1.2 Configuration des variables d'environnement
\`\`\`bash
cp .env.example .env.local
\`\`\`

Remplissez `.env.local` avec vos identifiants Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clé de rôle de service (pour les scripts)

### 1.3 Créer les tables dans Supabase
1. Allez dans votre projet Supabase → SQL Editor
2. Copiez le contenu de `scripts/001_create_tables.sql`
3. Exécutez le script pour créer toutes les tables

### 1.4 Tester localement
\`\`\`bash
npm run dev
\`\`\`

Accédez à http://localhost:3000 et vérifiez que tout fonctionne.

## Phase 2: Vérification de la santé

### 2.1 Vérifier la connexion à la base de données
\`\`\`bash
curl http://localhost:3000/api/health
\`\`\`

Réponse attendue:
\`\`\`json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
\`\`\`

### 2.2 Vérifier la migration des données (si nécessaire)
1. Allez à l'onglet "Réglages"
2. Cliquez sur "Migration des données" 
3. Vérifiez que vos données locales sont transférées vers Supabase

## Phase 3: Déploiement sur Vercel

### 3.1 Connecter votre GitHub
1. Poussez votre code vers GitHub:
\`\`\`bash
git add .
git commit -m "Setup Supabase integration for deployment"
git push
\`\`\`

### 3.2 Importer le projet sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New..." → "Project"
3. Sélectionnez votre repository GitHub

### 3.3 Configurer les variables d'environnement
Dans les "Environment Variables" de Vercel, ajoutez:

| Variable | Valeur |
|----------|--------|
| \`NEXT_PUBLIC_SUPABASE_URL\` | Votre URL Supabase |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Votre clé anon Supabase |

**Note:** Ne pas ajouter \`SUPABASE_SERVICE_ROLE_KEY\` en production (trop sensible)

### 3.4 Déployer
Cliquez sur "Deploy" et attendez que le build se termine.

## Phase 4: Vérification Post-Déploiement

### 4.1 Vérifier la santé de l'application
Après le déploiement, vérifiez:
\`\`\`bash
curl https://votre-app.vercel.app/api/health
\`\`\`

### 4.2 Vérifier les logs
\`\`\`bash
vercel logs
\`\`\`

### 4.3 Tester les fonctionnalités clés
- Connexion (Utilisateur admin/admin)
- Import de fichiers
- Création de créateurs
- Visualisation du stock
- Paiements

## Troubleshooting

### ❌ Erreur: "Cannot find module '@supabase/ssr'"
\`\`\`bash
npm install @supabase/ssr @supabase/supabase-js
npm run build
\`\`\`

### ❌ Erreur: "Missing environment variables"
Vérifiez dans Vercel:
1. Project Settings → Environment Variables
2. Confirmez que toutes les variables sont présentes
3. Déclenchez un nouveau déploiement

### ❌ Erreur: "Database connection failed"
1. Vérifiez que l'URL Supabase est correcte
2. Vérifiez la clé anon Supabase
3. Allez dans Supabase → SQL Editor et testez une requête simple
4. Vérifiez les RLS policies

### ❌ Erreur: "Build failed"
\`\`\`bash
# Localement:
npm run build
\`\`\`

Vérifiez les erreurs TypeScript et corrigez-les avant de redéployer.

## Monitoring

### Vercel Analytics
- Tableau de bord Vercel: Performance, Edge Network, API routes
- URL: https://vercel.com/your-team/your-project/analytics

### Supabase Monitoring
- Allez sur votre projet Supabase
- Vérifiez: Database Usage, Query Performance, Logs

## Mise à jour de la base de données

Si vous devez ajouter des colonnes ou modifier le schéma:

1. Allez dans Supabase → SQL Editor
2. Écrivez votre migration SQL
3. Testez localement d'abord
4. Exécutez en production

Exemple pour ajouter une colonne:
\`\`\`sql
ALTER TABLE creators ADD COLUMN notes TEXT;
\`\`\`

## Support

Pour des questions:
- Docs Supabase: https://supabase.com/docs
- Docs Vercel: https://vercel.com/docs
- GitHub Issues: [Votre repo]
`
