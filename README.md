# Petit-Ruban - Gestion Multi-Créateurs v17

Application sécurisée de gestion pour boutique multi-créateurs avec authentification robuste.

## 🚀 Déploiement sur Vercel avec gestion.petit-ruban.fr

### Étape 1: Préparation du Repository

1. **Créez un nouveau repository GitHub** pour votre projet
2. **Clonez le repository** localement
3. **Copiez tous les fichiers** de cette version dans votre repository
4. **Commitez et pushez** les fichiers

\`\`\`bash
git add .
git commit -m "Initial commit - Petit-Ruban v17"
git push origin main
\`\`\`

### Étape 2: Configuration Vercel

1. **Connectez-vous à Vercel** (vercel.com)
2. **Importez votre repository GitHub**
3. **Configurez le projet** :
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Étape 3: Variables d'environnement

Dans les **Settings > Environment Variables** de votre projet Vercel, ajoutez :

\`\`\`
ADMIN_USERNAME=petit-ruban-admin
ADMIN_PASSWORD_HASH=$2a$12$VotreHashMotDePasseSecurise
JWT_SECRET=votre-cle-jwt-super-secrete-et-tres-longue-changez-moi-en-production
\`\`\`

**Pour générer un hash de mot de passe sécurisé :**
\`\`\`bash
node -e "console.log(require('bcryptjs').hashSync('VotreMotDePasseSecurise', 12))"
\`\`\`

### Étape 4: Configuration du domaine personnalisé

1. Dans **Settings > Domains** de votre projet Vercel
2. **Ajoutez votre domaine** : `gestion.petit-ruban.fr`
3. **Configurez les DNS** chez votre registraire :
   - Type: CNAME
   - Name: gestion
   - Value: cname.vercel-dns.com

### Étape 5: Déploiement

1. **Déployez** automatiquement via Vercel
2. **Testez l'accès** sur `https://gestion.petit-ruban.fr`
3. **Vérifiez l'authentification** avec vos identifiants

## 🔐 Sécurité

- ✅ **Authentification JWT** avec cookies HttpOnly
- ✅ **Hachage bcrypt** des mots de passe
- ✅ **Protection middleware** sur toutes les routes
- ✅ **Headers de sécurité** (noindex, X-Frame-Options, etc.)
- ✅ **Sessions expirantes** (24h)
- ✅ **Variables d'environnement** chiffrées

## 📊 Fonctionnalités v17

- 🔄 **Import CSV/Excel** avec logique exacte Vercel
- 🎯 **Identification automatique** des ventes (4 premiers mots)
- 📈 **Analytics avancés** avec graphiques interactifs
- 👥 **Gestion complète** des créateurs
- 📦 **Gestion du stock** avec alertes de stock faible
- 💰 **Suivi des ventes** et commissions
- 📊 **Rapports détaillés** exportables
- 🔍 **Recherche et filtres** avancés
- 📱 **Interface responsive** moderne

## 🛠️ Développement local

\`\`\`bash
npm install
npm run dev
\`\`\`

L'application sera accessible sur `http://localhost:3000`

## 📝 Notes importantes

- **Changez immédiatement** les identifiants par défaut
- **Utilisez HTTPS** en production (automatique avec Vercel)
- **Sauvegardez régulièrement** vos données
- **Testez l'authentification** avant la mise en production

## 🆘 Support

En cas de problème, vérifiez :
1. Les variables d'environnement sont correctement configurées
2. Le domaine DNS pointe vers Vercel
3. Les identifiants de connexion sont corrects
4. Les logs de déploiement Vercel pour les erreurs

---

© 2024 Petit-Ruban - Version 17 Sécurisée
