# Petit-Ruban v17 - Gestion Multi-Créateurs

## Description

Petit-Ruban est une application de gestion complète pour boutiques multi-créateurs. Elle permet de gérer les stocks, les ventes, les créateurs, et de générer des rapports détaillés avec un système d'archives et de paiements.

## Fonctionnalités

### 🔐 Authentification Sécurisée
- Connexion avec nom d'utilisateur et mot de passe
- Sessions sécurisées avec JWT
- Protection des routes sensibles

### 📊 Gestion des Ventes
- Import de fichiers CSV/Excel
- Attribution automatique aux créateurs
- Validation et modification des ventes
- Calcul automatique des commissions
- Filtrage et recherche avancée

### 👥 Gestion des Créateurs
- Ajout/modification/suppression de créateurs
- Gestion des taux de commission individuels
- Historique des paiements
- Système de paiement et archivage

### 📦 Gestion du Stock
- Import de fichiers de stock
- Suivi des quantités
- Alertes de stock faible
- Valorisation du stock

### 📋 Rapports et PDF
- Génération de rapports détaillés
- Export PDF professionnel
- Aperçu avant génération
- Filtrage par période

### 🗄️ Archives et Paiements
- Archivage mensuel des ventes
- Système de validation
- Gestion des virements
- Traçabilité complète

### ⚙️ Paramètres
- Configuration des templates d'import
- Personnalisation des colonnes
- Gestion des taux de commission
- Export/import des paramètres

## Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation locale

1. Clonez le repository
\`\`\`bash
git clone <repository-url>
cd petit-ruban-v17
\`\`\`

2. Installez les dépendances
\`\`\`bash
npm install
\`\`\`

3. Configurez les variables d'environnement
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Lancez l'application en développement
\`\`\`bash
npm run dev
\`\`\`

5. Ouvrez [http://localhost:3000](http://localhost:3000)

### Déploiement sur Vercel

1. Connectez votre repository à Vercel
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Déployez automatiquement

## Configuration

### Variables d'environnement

- `ADMIN_USERNAME`: Nom d'utilisateur administrateur
- `ADMIN_PASSWORD_HASH`: Hash du mot de passe (généré avec bcrypt)
- `JWT_SECRET`: Clé secrète pour les tokens JWT

### Identifiants par défaut

- **Username**: `petit-ruban-admin`
- **Password**: `admin123`

> ⚠️ **Important**: Changez ces identifiants en production !

## Utilisation

### 1. Import des données

1. Allez dans l'onglet "Import"
2. Importez d'abord votre fichier de stock
3. Puis importez vos fichiers de ventes
4. Les créateurs sont automatiquement détectés

### 2. Gestion des ventes

1. Allez dans l'onglet "Ventes"
2. Vérifiez les attributions automatiques
3. Modifiez si nécessaire
4. Validez les ventes

### 3. Génération de rapports

1. Allez dans l'onglet "Rapports"
2. Sélectionnez un créateur
3. Choisissez une période (optionnel)
4. Générez le PDF

### 4. Archivage et paiements

1. Allez dans l'onglet "Archives"
2. Créez une archive mensuelle
3. Validez l'archive
4. Enregistrez le virement

## Structure des fichiers

\`\`\`
petit-ruban-v17/
├── app/
│   ├── api/auth/          # Routes d'authentification
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page principale
├── components/
│   ├── ui/                # Composants UI de base
│   ├── archive-management.tsx
│   ├── creator-management.tsx
│   ├── import-files.tsx
│   ├── import-manager.tsx
│   ├── login-form.tsx
│   ├── month-selector.tsx
│   ├── pdf-generator.tsx
│   ├── sales-management.tsx
│   ├── settings-panel.tsx
│   └── stock-overview.tsx
├── lib/
│   ├── auth.ts            # Logique d'authentification
│   ├── sales-utils.ts     # Utilitaires pour les ventes
│   └── store.ts           # Store Zustand
└── middleware.ts          # Middleware Next.js
\`\`\`

## Technologies utilisées

- **Framework**: Next.js 14
- **UI**: Tailwind CSS + Radix UI
- **État**: Zustand
- **Authentification**: JWT + bcrypt
- **Import/Export**: Papa Parse + XLSX + jsPDF
- **Déploiement**: Vercel

## Support

Pour toute question ou problème :

1. Vérifiez la documentation
2. Consultez les logs de la console
3. Contactez le support technique

## Licence

© 2024 Petit-Ruban - Tous droits réservés
