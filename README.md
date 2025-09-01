# Petit-Ruban - Gestion Multi-Créateurs v17

Application de gestion pour boutique multi-créateurs avec système d'authentification sécurisé.

## Fonctionnalités

- 🔐 **Authentification sécurisée** avec JWT et bcrypt
- 📊 **Gestion mensuelle** des données (stock et ventes)
- 📈 **Onglet Ventes** dédié pour visualiser et modifier les attributions
- ⚙️ **Configuration des templates** d'import personnalisables
- 👥 **Gestion des créateurs** avec calcul automatique des commissions
- 📄 **Génération de rapports** PDF et HTML
- 📦 **Import/Export** CSV et Excel
- 🗄️ **Système d'archives** pour la sauvegarde

## Identifiants par défaut

- **Username:** `petit-ruban-admin`
- **Password:** `admin123`

⚠️ **Important:** Changez ces identifiants en production !

## Installation

1. Téléchargez le code depuis v0
2. Installez les dépendances : `npm install`
3. Configurez les variables d'environnement (voir .env.example)
4. Lancez l'application : `npm run dev`

## Déploiement

L'application est prête pour le déploiement sur Vercel avec le domaine `gestion.petit-ruban.fr`.

## Sécurité

- Authentification JWT avec expiration automatique (24h)
- Mots de passe hashés avec bcrypt
- Cookies sécurisés en production
- Middleware de protection des routes

## Version

Version 17 - Déploiement sécurisé avec gestion mensuelle
