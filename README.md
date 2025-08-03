# DOCC - Gestion de Stock PBA

Application web complète de gestion de stock pour l'entreprise DOCC, spécialisée dans la fabrication de poteaux en béton armé (PBA).

## 🏗️ Architecture

- **Frontend**: React 18 avec Material-UI
- **Backend**: Node.js avec Express
- **Base de données**: PostgreSQL
- **Containerisation**: Docker & Docker Compose

## 📋 Fonctionnalités

### Pour les Employés
- Saisie quotidienne des données de production, livraison et avaries
- Interface simple et intuitive
- Calcul automatique du stock actuel

### Pour le PDG (Admin)
- Dashboard en temps réel avec graphiques
- Historique détaillé des mouvements
- Filtres par date et type de PBA
- Vue synthétique mensuelle

## 🚀 Installation et Démarrage

### Prérequis
- Docker et Docker Compose installés
- Node.js 18+ (pour le développement local)

### Démarrage avec Docker (Recommandé)

```bash
# Cloner le projet
git clone <repository-url>
cd docc-stock-management

# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

L'application sera accessible sur :
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- PostgreSQL: localhost:5432

### Démarrage en développement local

```bash
# Installer les dépendances racine
npm install

# Installer les dépendances du serveur
cd server && npm install

# Installer les dépendances du client
cd ../client && npm install

# Retourner à la racine et démarrer en mode développement
cd .. && npm run dev
```

## 👥 Comptes de Test

- **Admin (PDG)**: `admin` / `password`
- **Employé**: `employee` / `password`

## 📊 Types de PBA Gérés

- 9AR150, 9AR300, 9AR400, 9AR650
- 12AR400, 12AR650
- 12B1000, 12B1250, 12B1600, 12B2000
- 10B2000

## 🗄️ Structure de la Base de Données

### Tables principales
- `users`: Gestion des utilisateurs et rôles
- `pba_types`: Types de PBA disponibles
- `daily_stock`: Mouvements quotidiens de stock

### Calcul automatique
Stock Actuel = Stock Initial + Production - Livraison - Avaries

## 🔧 Configuration

### Variables d'environnement

**Serveur** (server/.env):
```
DATABASE_URL=postgresql://docc_user:docc_password@localhost:5432/docc_stock
JWT_SECRET=docc_jwt_secret_key_2024
NODE_ENV=development
```

**Client** (client/.env):
```
REACT_APP_API_URL=http://localhost:5001
```

## 📱 Utilisation

1. **Connexion**: Utilisez les comptes de test ou créez de nouveaux utilisateurs
2. **Saisie quotidienne**: Les employés saisissent production, livraisons et avaries
3. **Dashboard PDG**: Vue d'ensemble en temps réel avec graphiques
4. **Historique**: Consultation détaillée des mouvements passés

## 🛠️ Développement

### Structure du projet
```
docc-stock-management/
├── server/                 # Backend Node.js
│   ├── controllers/       # Logique métier
│   ├── routes/           # Routes API
│   ├── middleware/       # Middlewares (auth, etc.)
│   └── database/         # Configuration DB
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── context/      # Contextes React
└── docker-compose.yml    # Configuration Docker
```

### Scripts disponibles
```bash
npm run dev          # Démarrage en développement
npm run docker:build # Construction des images Docker
npm run docker:up    # Démarrage avec Docker
npm run docker:down  # Arrêt des conteneurs
```

## 🔒 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection des routes selon les rôles
- Validation des données côté serveur

## 📈 Monitoring

L'application calcule et affiche :
- Stock en temps réel par type de PBA
- Totaux journaliers, hebdomadaires et mensuels
- Évolution graphique des stocks
- Alertes pour les stocks faibles

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request