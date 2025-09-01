# Petit-Ruban - Gestion Multi-Créateurs v17

Système de gestion pour boutique multi-créateurs avec authentification sécurisée.

## Fonctionnalités

### 🔐 Authentification Sécurisée
- ✅ Connexion avec nom d'utilisateur et mot de passe
- ✅ Sessions JWT avec expiration automatique
- ✅ Protection des routes et API

### 📅 Gestion Mensuelle
- ✅ Sélecteur de mois pour naviguer entre les périodes
- ✅ Données indépendantes par mois
- ✅ Sauvegarde automatique des configurations

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

### 🎨 Interface utilisateur moderne
- Interface utilisateur moderne

### 📦 Stockage persistant avec Zustand
- Stockage persistant avec Zustand

## Installation

1. Cloner le projet
2. Installer les dépendances : `npm install`
3. Lancer en développement : `npm run dev`
4. Ouvrir http://localhost:3000

## Identifiants de test

- **Username:** `petit-ruban-admin`
- **Password:** `admin123`

⚠️ **Important:** Changez ces identifiants en production !

## Déploiement

1. Build : `npm run build`
2. Déployer sur Vercel ou autre plateforme

## Configuration

Copier `.env.example` vers `.env.local` et modifier les valeurs selon vos besoins.

## Technologies

- **Frontend:** Next.js 14, React, TypeScript
- **UI:** Tailwind CSS, Radix UI, Lucide Icons
- **State:** Zustand avec persistance
- **Auth:** JWT, bcryptjs
- **Data:** CSV/Excel parsing avec PapaParse

## Version

**v17** - Gestion mensuelle complète avec nouvelles fonctionnalités avancées
