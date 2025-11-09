# ✅ Checklist de Déploiement - Boutique Multi-Créateurs

## Avant le déploiement

### Configuration Supabase
- [ ] Projet Supabase créé
- [ ] URL du projet notée
- [ ] Clé anon Supabase copiée
- [ ] Clé de service copiée
- [ ] Script SQL exécuté (`scripts/001_create_tables.sql`)
- [ ] Tables visibles dans Supabase SQL Editor

### Configuration Locale
- [ ] \`.env.local\` créé avec les bonnes variables
- [ ] \`npm install\` exécuté
- [ ] \`npm run dev\` fonctionne
- [ ] Accès à http://localhost:3000 réussi
- [ ] Connexion avec admin/admin réussie
- [ ] \`/api/health\` retourne status healthy

### Code
- [ ] Tous les fichiers Supabase créés:
  - lib/supabase/client.ts
  - lib/supabase/server.ts
  - lib/supabase/database.ts
  - middleware.ts
  - app/api/health/route.ts
  - app/api/creators/route.ts
  - app/api/sales/route.ts
  - etc.
- [ ] Pas d'erreurs TypeScript: \`npm run build\`
- [ ] Pas d'erreurs ESLint: \`npm run lint\`

### Migration des Données
- [ ] (Optionnel) Données locales migrées vers Supabase
- [ ] Vérification des données dans Supabase

### Git
- [ ] Tous les changements committen
- [ ] Branche main à jour
- [ ] Pas de conflicts

## Déploiement sur Vercel

### Configuration Vercel
- [ ] Compte Vercel créé
- [ ] GitHub connecté à Vercel
- [ ] Projet importé
- [ ] Framework détecté automatiquement: Next.js
- [ ] Build command: \`next build\`

### Variables d'Environnement
- [ ] NEXT_PUBLIC_SUPABASE_URL ajoutée
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY ajoutée
- [ ] Variables correctes vérifiées
- [ ] (NE PAS ajouter SUPABASE_SERVICE_ROLE_KEY en prod)

### Déploiement
- [ ] "Deploy" cliqué
- [ ] Build en cours...
- [ ] Build réussi (pas d'erreurs)
- [ ] Application en ligne

## Post-Déploiement

### Vérification Immédiate
- [ ] URL de l'app notée
- [ ] Page d'accueil accessible
- [ ] Formulaire de connexion visible
- [ ] Connexion admin/admin réussie
- [ ] Pas d'erreurs en console (F12)

### Tests Fonctionnels
- [ ] Créer un nouveau créateur
- [ ] Import de fichier CSV (si données disponibles)
- [ ] Visualiser le stock
- [ ] Créer un paiement
- [ ] Générer un rapport PDF
- [ ] Changer les réglages

### Monitoring
- [ ] Vérifier \`/api/health\` est accessible
- [ ] Vercel Analytics consulté
- [ ] Supabase SQL Editor: vérifier nombre de requêtes
- [ ] Logs Vercel consultés

## En cas de Problème

### Erreur Build
- [ ] Vérifier les logs Vercel
- [ ] Reproduire localement: \`npm run build\`
- [ ] Corriger les erreurs
- [ ] Re-déployer

### Erreur Runtime
- [ ] Vérifier \`vercel logs\`
- [ ] Vérifier variables d'env dans Vercel
- [ ] Vérifier Supabase SQL Editor pour erreurs
- [ ] Vérifier console navigateur

### Pas de Connexion BD
- [ ] URL Supabase correcte?
- [ ] Clé anon correcte?
- [ ] Tables créées?
- [ ] RLS policies OK?

## Maintenance

### Quotidienne
- [ ] Vérifier logs Vercel
- [ ] Vérifier \`/api/health\`

### Hebdomadaire
- [ ] Backup Supabase
- [ ] Vérifier usage quotas Supabase
- [ ] Vérifier erreurs Supabase

### Mensuelle
- [ ] Optimiser les requêtes lentes
- [ ] Archiver les données anciennes
- [ ] Vérifier l'usage des crédits Vercel

## URLs Utiles

- **App**: https://votre-app.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Health Check**: https://votre-app.vercel.app/api/health
- **Debug Config**: https://votre-app.vercel.app/api/debug/config

## Contacts Support

- **Vercel Support**: https://vercel.com/help
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: [Lien vers votre repo]
