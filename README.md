# ☀️ Sovoltt — Marketplace d'énergie solaire pair-à-pair

**Plateforme d'autoconsommation collective** permettant aux producteurs solaires de vendre leur surplus d'énergie à leurs voisins, dans le cadre réglementaire français (Article L315-2 du Code de l'énergie, Décret 2017-676).

---

## 📋 Architecture

```
sovoltt/
├── apps/
│   ├── backend/          # API NestJS + Prisma + PostgreSQL
│   ├── mobile/           # App React Native Expo (iOS + Android)
│   └── web/              # Site vitrine Netlify (HTML/CSS/JS)
├── package.json          # Workspaces monorepo
└── README.md
```

## 🛠 Stack technique

| Couche | Technologies |
|--------|-------------|
| **Backend** | NestJS, Prisma ORM, PostgreSQL, JWT/Passport, Socket.io, Stripe Connect |
| **Mobile** | React Native, Expo SDK 50, React Navigation, Zustand, Axios |
| **Web** | HTML5, CSS3 (responsive), JavaScript, Netlify |
| **APIs externes** | Enedis SGE (données Linky), Stripe Connect (paiements), Expo Push |

## 🎨 Design System

| Token | Valeur | Usage |
|-------|--------|-------|
| Primary | `#1A4731` (Vert forêt) | Confiance, énergie naturelle |
| Secondary | `#F59E0B` (Ambre doré) | Soleil, énergie solaire |
| Accent | `#10B981` (Vert émeraude) | Succès, croissance |

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Compte Stripe (pour les paiements)
- Accès API Enedis SGE (pour les données Linky)

### Backend

```bash
cd apps/backend
cp .env.example .env    # Configurer les variables d'environnement
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev       # → http://localhost:3000
```

### Mobile (Expo)

```bash
cd apps/mobile
npm install
npx expo start          # Scanner le QR code avec Expo Go
```

### Site web

```bash
cd apps/web
npx serve public        # → http://localhost:3000
# Ou déployer sur Netlify (publish: apps/web/public)
```

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription (nom, email, mot de passe, rôle) |
| POST | `/auth/login` | Connexion → JWT access token |
| GET | `/auth/refresh` | Rafraîchir le token JWT |

### Users (`/api/users`) 🔒

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users/me` | Profil de l'utilisateur connecté |
| PUT | `/users/me` | Modifier le profil |
| GET | `/users/nearby?lat=&lng=&radius=` | Producteurs à proximité (Haversine) |

### PMO (`/api/pmo`) 🔒

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/pmo` | Créer une PMO |
| GET | `/pmo/me` | Mes PMO |
| GET | `/pmo/nearby?lat=&lng=&radius=` | PMO à proximité |
| GET | `/pmo/:id` | Détails d'une PMO |
| POST | `/pmo/:id/join` | Rejoindre une PMO |
| DELETE | `/pmo/:id/leave` | Quitter une PMO |

### Marketplace (`/api/marketplace`) 🔒

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/marketplace/offers` | Lister les offres (filtres: prix, distance, kWh, PMO) |
| POST | `/marketplace/offers` | Publier une offre de surplus |
| POST | `/marketplace/buy` | Acheter de l'énergie |
| GET | `/marketplace/match?kwh=&maxPrice=` | Matching intelligent (40% prix + 40% distance + 20% quantité) |

### Enedis (`/api/enedis`) 🔒

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/enedis/consumption?prm=&start=&end=` | Données de consommation |
| GET | `/enedis/production?prm=&start=&end=` | Données de production |
| POST | `/enedis/meters` | Enregistrer un compteur Linky (PRM) |
| POST | `/enedis/sync/:meterId` | Synchroniser les données d'un compteur |
| GET | `/enedis/readings?type=&days=` | Relevés stockés |

### Payments (`/api/payments`) 🔒

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/payments/connect-account` | Créer un compte Stripe Connect |
| POST | `/payments/create-intent/:transactionId` | Créer un PaymentIntent |
| POST | `/payments/webhook` | Webhook Stripe (signature vérifiée) |
| POST | `/payments/invoice/:operationId` | Générer une facture mensuelle |
| GET | `/payments/transactions` | Historique des transactions |

### Production (WebSocket)

Le gateway WebSocket (`/production`) fournit des mises à jour en temps réel :

- `joinProduction` — S'abonner aux données d'un compteur
- `leaveProduction` — Se désabonner
- Événements émis : `productionUpdate`, `surplusAlert`

---

## 📱 Écrans de l'app mobile

| Écran | Description |
|-------|-------------|
| **Welcome** | Page d'accueil avec branding et CTA |
| **Login / Register** | Authentification par email/mot de passe |
| **Onboarding (4 étapes)** | 1. Rôle · 2. Géolocalisation · 3. Compteur Linky · 4. PMO |
| **Dashboard** | Vue producteur ou consommateur avec jauge SVG et graphiques |
| **Marketplace** | Offres disponibles avec filtres (prix, distance) |
| **Production** | Monitoring temps réel via WebSocket |
| **PMO** | Gestion PMO (info réglementaire, membres, périmètres) |
| **Profile** | Paramètres utilisateur, compteur Linky, paiements |

---

## 🌐 Déploiement

### Backend

```bash
# Build
cd apps/backend && npm run build

# Variables d'environnement requises :
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENEDIS_CLIENT_ID=...
ENEDIS_CLIENT_SECRET=...
```

### Mobile

```bash
cd apps/mobile
npx eas build --platform all
npx eas submit --platform all
```

### Website (Netlify)

Connecter le repo GitHub à Netlify :
- **Base directory** : `apps/web`
- **Publish directory** : `apps/web/public`
- **Build command** : (aucun — site statique)

---

## 📄 Réglementation

Sovoltt respecte le cadre français de l'autoconsommation collective :

- **Article L315-2** du Code de l'énergie
- **Décret 2017-676** relatif à l'autoconsommation d'électricité
- **Périmètres** : 2 km (urbain dense), 10 km (périurbain), 20 km (rural)
- **Puissance max** : 5 MW (standard), 10 MW (collectivités)
- **PMO obligatoire** pour organiser les échanges entre producteurs et consommateurs

---

## 🧑‍💻 Développement

```bash
# Installer toutes les dépendances
npm run install:all

# Lancer le backend en mode développement
npm run backend:dev

# Lancer l'app mobile
npm run mobile:start

# Lancer le site web en local
npm run web:dev
```

---

## 📝 Licence

MIT © Sovoltt
