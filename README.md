<h1 align="center">📰 Flowly</h1>

<h3 align="center">Agrégateur d’Actualités Intelligent • FR / EN</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Statut-Projet%20Étudiant-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow?style=for-the-badge&logo=javascript" />
</p>

<p align="center">
Flowly est une application web moderne permettant d’agréger, filtrer et afficher des actualités 
provenant de multiples sources (<strong>NewsAPI + RSS</strong>), avec une interface claire et performante.
</p>

<p align="center">
⚡ Backend : <strong>Node.js / Express</strong> <br>
🎨 Frontend : <strong>HTML / CSS / JavaScript (Vanilla)</strong>
</p>

---

## ✨ Fonctionnalités

### 🌍 Multilingue
- Français 🇫🇷
- Anglais 🇬🇧
- Synchronisation des catégories FR / EN

---

### 🗂️ Catégorisation intelligente
- Actualités (`general`)
- Politique (`politics`)
- Économie (`economy`)
- Sports (`sports`)
- Culture (`culture`)
- Technologie (`technology`)

✔️ **Filtrage strict**  
👉 Aucun mélange entre catégories (ex: sport ≠ politique)

---

### 🔎 Filtrage dynamique avancé
- Filtre par source (Le Monde, BBC, etc.)
- Recherche par mot-clé
- Filtrage instantané côté client
- Navigation fluide sans rechargement

---

### 🔄 Agrégation intelligente
- Fusion **NewsAPI + RSS**
- Déduplication des articles
- Normalisation des données
- Nettoyage HTML automatique (anti caractères parasites)

---

### 🎨 Interface moderne
- Dark Mode / Light Mode
- UI inspirée presse premium
- Sources cliquables
- Responsive (desktop + mobile)
- UX rapide et minimaliste

---

### ⭐ Bonus
- Système de favoris (localStorage)
- Gestion des erreurs API
- Fallback automatique si une source échoue
- Timeout réseau sécurisé

---

## 🧠 Architecture

### 🔁 Pipeline des données

1. Récupération des articles (RSS + API)
2. Nettoyage des données
3. Normalisation des champs
4. Détection de catégorie
5. Déduplication
6. Filtrage strict
7. Envoi au frontend

---

## 🛠️ Installation

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/3mamri/flowly.git
cd flowly
2️⃣ Installer les dépendances
npm install
3️⃣ Configuration

Créer un fichier .env :

NEWS_API_KEY=VOTRE_CLE_API

⚠️ Optionnel : sans clé API, Flowly fonctionne uniquement avec les flux RSS

4️⃣ Lancer le serveur
npm run dev

ou

node server.js
🌐 Accès
http://localhost:3000
📡 API
🔹 Récupérer les articles
GET /api/news?lang=fr&category=general
🔹 Récupérer les sources
GET /api/sources?lang=fr&category=sports
🔹 Healthcheck
GET /health
📂 Structure du projet
flowly/
├── public/                # Frontend
│   ├── js/
│   │   ├── fetchNews.js
│   │   └── ui.js
│   ├── styles.css
│   ├── script.js
│   └── index.html
│
├── src/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── config/
│
├── server.js
├── package.json
└── .env

🔐 Sécurité & Robustesse
Helmet (sécurité HTTP)
Rate limiting (anti-spam)
Timeout sur fetch
Gestion des erreurs API
Nettoyage des données (anti XSS)
📈 Axes d’amélioration
Cache backend (Redis)
Pagination avancée
Tri intelligent (score pertinence)
Dashboard admin des sources
IA de classification (NLP)
Déploiement cloud (Docker / CI-CD)
🎯 Objectif du projet

Ce projet démontre :

✔️ Conception d’une API REST
✔️ Architecture Node.js modulaire
✔️ Traitement et normalisation de données
✔️ Gestion d’état frontend
✔️ UX moderne sans framework

👨‍💻 Auteur

🔗 https://github.com/3mamri

🏁 Licence

Projet académique / portfolio
