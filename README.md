# Petit-Ruban - Gestion Multi-Créateurs v17

Application complète de gestion pour boutique multi-créateurs avec gestion mensuelle indépendante.

## 🚀 Nouvelles Fonctionnalités v17

### 📅 **Gestion Mensuelle Indépendante**
- Chaque mois est géré séparément
- Sélecteur de mois dans l'en-tête
- Import et données par mois
- Historique complet conservé

### 🛒 **Onglet Ventes Dédié**
- Visualisation complète des ventes du mois
- Modification de l'attribution des ventes
- Statistiques en temps réel
- Filtres avancés et recherche

### ⚙️ **Configuration des Templates**
- Paramétrage des colonnes d'import
- Templates personnalisables pour stock et ventes
- Configuration sauvegardée globalement

### 📊 **Fonctionnalités Complètes**
- Import CSV/Excel avec logique d'identification
- Gestion des créateurs et commissions
- Génération de rapports PDF
- Système d'archives et paiements
- Authentification sécurisée

## 🔧 Installation et Déploiement

### Déploiement sur Vercel

1. **Téléchargez le code** depuis v0 (bouton "Download Code")
2. **Créez un repository GitHub** et uploadez les fichiers
3. **Connectez à Vercel** et importez le projet
4. **Configurez les variables d'environnement** :
   \`\`\`
   ADMIN_USERNAME=petit-ruban-admin
   ADMIN_PASSWORD_HASH=$2a$12$VotreHashSecurise
   JWT_SECRET=votre-cle-jwt-super-longue-et-secrete
   \`\`\`
5. **Déployez** et configurez votre domaine

### Variables d'Environnement

- `ADMIN_USERNAME` : Nom d'utilisateur admin
- `ADMIN_PASSWORD_HASH` : Hash bcrypt du mot de passe
- `JWT_SECRET` : Clé secrète pour les tokens JWT

**Générer un hash de mot de passe :**
\`\`\`bash
node -e "console.log(require('bcryptjs').hashSync('VotreMotDePasse', 12))"
\`\`\`

## 📋 Guide d'Utilisation

### 1. **Sélection du Mois**
- Utilisez le sélecteur en haut à droite
- Chaque mois est indépendant
- Les données sont conservées par mois

### 2. **Import de Données**
- **Onglet Import** : Sélectionnez le mois puis importez
- **Stock** : Créateur dans "Item name", Article dans "Variations"
- **Ventes** : Description analysée automatiquement (4 premiers mots)

### 3. **Gestion des Ventes**
- **Onglet Ventes** : Visualisez toutes les ventes du mois
- Modifiez l'attribution avec les menus déroulants
- Filtrez par créateur ou statut d'identification

### 4. **Configuration**
- **Onglet Paramètres** : Configurez les templates d'import
- Personnalisez les noms de colonnes
- Gérez les données par mois ou globalement

### 5. **Rapports et Archives**
- **Onglet Rapports** : Générez des PDF détaillés
- **Onglet Archives** : Gérez les paiements mensuels
- Historique complet des transactions

## 🔐 Sécurité

- ✅ Authentification JWT sécurisée
- ✅ Cookies HttpOnly
- ✅ Hachage bcrypt des mots de passe
- ✅ Protection middleware
- ✅ Headers de sécurité

## 📊 Structure des Données

### Format Stock (CSV/Excel)
\`\`\`
Item name    | Variations           | Price | Quantity | SKU
Marie Dupont | Bracelet perles      | 25.00 | 5        | MD-001
Jean Martin  | Collier argent       | 45.00 | 3        | JM-002
\`\`\`

### Format Ventes (CSV/Excel)
\`\`\`
Description                    | Price | Payment method | Date
Marie Dupont bracelet perles   | 25.00 | Carte         | 2024-01-15
Jean Martin collier argent     | 45.00 | Espèces       | 2024-01-16
\`\`\`

## 🆘 Support

### Problèmes Courants

**Import ne fonctionne pas :**
- Vérifiez les noms de colonnes dans Paramètres > Templates
- Assurez-vous d'avoir sélectionné le bon mois

**Ventes non identifiées :**
- Utilisez l'onglet Ventes pour corriger manuellement
- Les 4 premiers mots de la description sont analysés

**Erreur d'authentification :**
- Vérifiez les variables d'environnement
- Régénérez le hash du mot de passe si nécessaire

### Contact
En cas de problème, vérifiez :
1. Les variables d'environnement
2. Les logs de déploiement Vercel
3. La configuration DNS du domaine

---

© 2024 Petit-Ruban - Version 17 Complète avec Gestion Mensuelle
