# Déploiement en Production - Guide Rapide

Votre application est maintenant configurée pour utiliser Supabase avec les variables d'environnement existantes.

## Étape 1: Vérifier que les tables Supabase sont créées

Vous avez déjà exécuté le script SQL. Vérifiez dans Supabase:
- Allez sur votre projet Supabase
- Onglet "Table Editor"
- Vous devriez voir: creators, sales, payments, stock_items, participations, settings, import_history

✅ Si vous voyez ces tables, passez à l'étape suivante.
❌ Si non, exécutez à nouveau le script `scripts/001_create_tables.sql` dans SQL Editor.

## Étape 2: Vérifier les variables d'environnement sur Vercel

Allez sur https://vercel.com/dashboard et vérifiez votre projet:

1. Sélectionnez votre projet **petit-ruban-gestion**
2. Allez dans **Settings** → **Environment Variables**
3. Vérifiez que vous avez AU MOINS ces variables:
   - `SUPABASE_URL` ou `SUPABASE_GPR_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` ou `SUPABASE_GPR_SUPABASE_ANON_KEY`

### Si les variables manquent, ajoutez-les:

Récupérez depuis Supabase (Settings → API):
- Project URL → copiez dans `SUPABASE_URL`
- anon/public key → copiez dans `SUPABASE_ANON_KEY`

Cochez les 3 environnements: Production, Preview, Development

## Étape 3: Pousser le code sur GitHub

**Méthode 1: Via v0 (Recommandé)**
1. Cliquez sur l'icône GitHub en haut à droite de v0
2. Cliquez "Push to GitHub"
3. Confirmez

**Méthode 2: Via terminal**
\`\`\`bash
git add .
git commit -m "Configure Supabase with existing env vars"
git push origin main
\`\`\`

## Étape 4: Attendre le déploiement automatique

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Onglet "Deployments"
4. Attendez que le déploiement passe au statut "Ready" (1-2 minutes)

## Étape 5: Tester votre site

Visitez https://gestion.petit-ruban.fr

Testez:
- La page se charge correctement
- Vous pouvez voir vos créateurs
- Les données sont sauvegardées

## En cas de problème

### Erreur "Missing Supabase environment variables"

1. Vérifiez dans Vercel Settings → Environment Variables
2. Ajoutez `SUPABASE_URL` et `SUPABASE_ANON_KEY`
3. Redéployez (Deployments → ⋯ → Redeploy)

### Les données ne s'affichent pas

1. Vérifiez que les tables sont créées dans Supabase
2. Vérifiez les logs: Vercel → Deployments → dernier déploiement → Logs
3. Testez l'API: https://gestion.petit-ruban.fr/api/health

### Le site ne se déploie pas

1. Vérifiez les logs de build dans Vercel
2. Assurez-vous que le code est bien poussé sur GitHub
3. Vérifiez que toutes les dépendances sont dans package.json

## Support

Si vous avez besoin d'aide, partagez:
- L'URL de votre déploiement Vercel
- Les logs d'erreur
- Les captures d'écran du problème
