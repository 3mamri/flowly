<h1 align="center">📰 Flowly</h1>

<p align="center">
  <strong>Agrégateur d’actualités moderne, rapide et personnalisable</strong><br>
  Construit avec Node.js, Express et JavaScript Vanilla
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-green">
  <img src="https://img.shields.io/badge/JS-Frontend-yellow">
</p>

---

# 📰 Flowly — Agrégateur d'Actualités

Flowly est un agrégateur d’actualités **rapide, léger et personnalisable**.  
Il combine **NewsAPI** et plusieurs **flux RSS** pour proposer un fil d’information complet, filtrable et dynamique.

Le projet est pensé pour être :
- ⚡ rapide
- 🧩 simple à déployer
- 🎯 facilement extensible
- 🧠 propre côté architecture

---

## 🚀 Stack Technique

### Backend
- Node.js

### Frontend
- HTML
- CSS
- JavaScript

### Outils
- PhpStorm
- Git / GitHub

---

# ✨ Fonctionnalités

## 🗂️ Agrégation intelligente
- Récupération automatique des sources NewsAPI
- Support des flux RSS externes
- Fusion des résultats
- Suppression des doublons
- FR 🇫🇷 / EN 🇬🇧

## 🔎 Filtrage dynamique
- Sélection multi-média
- Recherche par mot-clé instantanée
- Masquage de sources
- Mise à jour en temps réel (sans rechargement)

## 🎨 Personnalisation
- Dark Mode
- Changement de langue
- Historique de lecture

---

# ⚙️ Installation

## 1️⃣ Prérequis
- Node.js
- Une clé NewsAPI

---

## 2️⃣ Cloner le projet

```bash
git clone https://github.com/3mamri/flowly.git
cd flowly
3️⃣ Installer les dépendances
npm install

4️⃣ Configuration

Créer un fichier .env à la racine :

NEWS_API_KEY=YOUR_API_KEY_HERE


⚠️ Ne jamais commit ce fichier.

5️⃣ Lancer le serveur
Développement
npm run dev

Production
npm start


Serveur disponible sur :
👉 http://localhost:3000

🧠 Architecture du projet
flowly/
│
├── public/            → Frontend (HTML / CSS / JS)
│   ├── js/
│   ├── styles.css
│
├── src/
│   ├── routes/        → Routes API Express
│   ├── services/      → Logique NewsAPI + RSS
│   ├── utils/         → Helpers (dedupe, normalize…)
│
├── server.js          → Point d’entrée serveur
├── .env               → Variables d’environnement (non versionné)
├── .gitignore
└── package.json

🔄 Fonctionnement interne
1. Chargement

Le frontend envoie la langue sélectionnée au backend.

2. Backend

Appel NewsAPI

Récupération flux RSS

Normalisation des données

Déduplication

3. Frontend (ordre des filtres)

Sources masquées

Médias sélectionnés

Mot-clé

➡️ Affichage instantané et fluide

🔐 Bonnes pratiques Git

Le projet ignore :

node_modules/
.env
.idea/
dist/


Après clone :

npm install

🚀 Roadmap (évolutions futures)

Authentification utilisateur

Favoris persistants (DB)

Vrais résumés IA (OpenAI API)

PWA / Offline mode

Docker

Déploiement cloud

👨‍💻 Auteur

Développé par Amirouche Mamri

Projet personnel pour apprendre :

Architecture backend Express

Manipulation d’API REST

Traitement RSS

Filtrage dynamique frontend
