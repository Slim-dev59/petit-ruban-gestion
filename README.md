# Petit-Ruban - Gestion Multi-Créateurs v17

Application de gestion pour boutique multi-créateurs avec authentification sécurisée et gestion mensuelle des données.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec JWT et bcrypt
- **Gestion mensuelle** des données (stock et ventes)
- **Import CSV/Excel** avec détection automatique des créateurs
- **Calcul automatique** des commissions (1.75% par défaut)
- **Génération de rapports** PDF et HTML
- **Interface moderne** avec Tailwind CSS et shadcn/ui

## 🔐 Identifiants par défaut

- **Username:** `petit-ruban-admin`
- **Password:** `admin123`

## 📦 Installation

1. Clonez le projet
2. Installez les dépendances : `npm install`
3. Copiez `.env.example` vers `.env.local`
4. Lancez en développement : `npm run dev`

## 🌐 Déploiement

Pour déployer en production, configurez les variables d'environnement :

\`\`\`bash
ADMIN_USERNAME=votre-username
ADMIN_PASSWORD_HASH=votre-hash-bcrypt
JWT_SECRET=votre-clé-jwt-secrète
\`\`\`

## 📋 Utilisation

1. **Import** - Importez vos fichiers CSV/Excel
2. **Ventes** - Gérez et visualisez les ventes par créateur
3. **Créateurs** - Administrez la liste des créateurs
4. **Rapports** - Générez des rapports détaillés
5. **Archives** - Consultez l'historique des paiements
6. **Paramètres** - Configurez l'application

## 🛠️ Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (state management)
- bcryptjs (authentification)
- JWT (sessions)
- jsPDF (génération PDF)
- xlsx (import Excel)

## 📄 Licence

© 2024 Petit-Ruban - Tous droits réservés
