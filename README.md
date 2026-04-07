<h1 align="center">📰 Flowly</h1>

<h3 align="center">Agrégateur d’Actualités • FR / EN</h3>

<p align="center">
  <img src="https://img.shields.io/badge/FORMATION-BTS%20SIO%20SLAM-blue?style=for-the-badge" alt="BTS SIO SLAM"> 
  <img src="https://img.shields.io/badge/Statut-Projet%20Étudiant-blue?style=for-the-badge" />
</p>

<p align="center">
Flowly est une application web moderne permettant d’agréger, filtrer et afficher des actualités 
provenant de multiples sources (<strong>NewsAPI + RSS</strong>), avec une interface claire et performante.
</p>

<p align="center">
⚡ Backend : <strong>Node.js / Express</strong> <br>
🎨 Frontend : <strong>HTML / CSS / JavaScript </strong> 
</p>

---

## 🚀 Démo en ligne
Retrouvez la version déployée de Flowly ici : 👉 https://flowly-xat3.onrender.com

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

---

### ⭐ Bonus
- Système de favoris (localStorage)
- Gestion des erreurs API

---

## 🛠️ Installation
```text
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
🌐 Accès : http://localhost:3000
📡 API
🔹 Récupérer les articles
🔹 Récupérer les sources
```
## 📂 Structure du projet
```text
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
```
🔗 GitHub : 3mamri

🏁 Licence
Projet académique
Ce projet est réalisé dans le cadre de ma foramtion de mon bts sio slam
