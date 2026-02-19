<h1 align="center">📰 Flowly</h1>

<h2 align="center">Agrégateur d’Actualités Moderne</h2>

<p align="center">
Flowly est un agrégateur d’actualités développé avec <strong>Node.js (Express)</strong> 
et <strong>HTML / CSS / JavaScript vanilla</strong>.
</p>

<p align="center">
Il combine <strong>NewsAPI</strong> et plusieurs <strong>flux RSS</strong> 
afin de proposer un fil d’actualité dynamique, filtrable et bilingue.
</p>

---

## 🚀 Fonctionnalités

### 🌍 Multilingue
- Français 🇫🇷
- Anglais 🇬🇧

### 🗂️ Catégories
- Actualités
- Politique
- Économie
- Sports
- Culture

### 🔎 Filtrage dynamique
- Filtre par média
- Recherche par mot-clé
- Changement de langue instantané

### 🔄 Agrégation intelligente
- Fusion NewsAPI + RSS
- Suppression des doublons
- Normalisation des données

### 🎨 Interface
- Dark Mode
- Sources cliquables
- Gestion des erreurs et fallback si données manquantes

---

## 🛠️ Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/3mamri/flowly.git
cd flowly
2️⃣ Installer les dépendances
npm install
3️⃣ Configuration
Créer un fichier .env à la racine :

NEWS_API_KEY=VOTRE_CLE_API
GNEWS_API_KEY=VOTRE_CLE_API

4️⃣ Lancer le serveur
npm run dev
Le serveur démarre sur :

http://localhost:3000
⚙️ Fonctionnement
Le frontend envoie la langue et la catégorie sélectionnées.

Le backend récupère les articles via NewsAPI et RSS.

Les données sont normalisées et fusionnées.

Le frontend applique les filtres pour un affichage fluide.

📂 Structure du projet
flowly/
├── public/          # Frontend
├── src/             # Backend (routes, services, utils)
├── server.js
└── .env

🎓 Objectif

Projet académique démontrant :

Utilisation d’API REST

Architecture backend modulaire

Gestion d’état frontend

Fusion et traitement de données
