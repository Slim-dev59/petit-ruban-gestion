# Petit-Ruban - Gestion Multi-Créateurs v17

Application de gestion pour boutique multi-créateurs avec système de gestion mensuelle.

## Fonctionnalités

### 🔐 Authentification Sécurisée
- Connexion avec nom d'utilisateur et mot de passe
- Sessions JWT avec expiration automatique
- Protection des routes et API

### 📅 Gestion Mensuelle
- Sélecteur de mois pour naviguer entre les périodes
- Données indépendantes par mois
- Sauvegarde automatique des configurations

### 📊 Import de Données
- Import CSV/Excel pour stock et ventes
- Templates configurables dans les paramètres
- Identification automatique des créateurs

### 🛒 Gestion des Ventes
- Visualisation complète des ventes
- Modification des attributions de créateurs
- Validation des ventes
- Statistiques en temps réel

### 👥 Gestion des Créateurs
- Ajout/modification/suppression de créateurs
- Configuration des commissions individuelles
- Codes couleur pour identification

### 📈 Rapports et Analytics
- Génération de rapports PDF/HTML
- Statistiques détaillées par créateur
- Calculs automatiques des commissions

### ⚙️ Paramètres Avancés
- Configuration des templates d'import
- Export/import des paramètres
- Personnalisation des colonnes

## Installation

1. Clonez le repository
2. Installez les dépendances : `npm install`
3. Copiez `.env.example` vers `.env.local`
4. Configurez vos variables d'environnement
5. Lancez l'application : `npm run dev`

## Identifiants par défaut

- **Username:** petit-ruban-admin
- **Password:** admin123

⚠️ **Important:** Changez ces identifiants en production !

## Déploiement

L'application est optimisée pour Vercel avec :
- Configuration Next.js 14
- Support des API routes
- Gestion des cookies sécurisés
- Build optimisé

## Technologies

- **Frontend:** Next.js 14, React, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **State:** Zustand avec persistance
- **Auth:** JWT, bcryptjs
- **Data:** CSV/Excel parsing avec PapaParse

## Version

**v17** - Gestion mensuelle complète avec nouvelles fonctionnalités avancées
