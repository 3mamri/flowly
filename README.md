<h1 align="center">📰 Flowly</h1>

Agrégateur d’Actualités Moderne

Flowly est un agrégateur d’actualités développé avec Node.js (Express) et HTML / CSS / JavaScript vanilla.

Il combine NewsAPI et plusieurs flux RSS afin de proposer un fil d’actualité dynamique, filtrable et bilingue.

🚀 Fonctionnalités

🌍 Support Français 🇫🇷 / Anglais 🇬🇧

🗂️ Catégories :

Actualités

Politique

Économie

Sports

Culture

🔎 Filtrage par média

🔍 Recherche par mot-clé

🔄 Fusion NewsAPI + RSS

🧹 Suppression des doublons

🌙 Dark Mode

🔗 Sources cliquables

⚠️ Gestion propre des erreurs et fallback si données manquantes

🛠️ Installation
1️⃣ Cloner le projet
git clone https://github.com/3mamri/flowly.git
cd flowly

2️⃣ Installer les dépendances
npm install

3️⃣ Configuration

Créer un fichier .env à la racine :

NEWS_API_KEY=VOTRE_CLE_API
GNEWS_API_KEY=VOTRE_CLE_API


⚠️ Ne jamais exposer vos clés API dans un dépôt public.

4️⃣ Lancer le serveur
npm run dev


Le serveur démarre sur :

http://localhost:3000

⚙️ Fonctionnement

Le frontend envoie la langue et la catégorie sélectionnées.

Le backend :

récupère les articles via NewsAPI

complète avec des flux RSS

normalise et fusionne les données

supprime les doublons

Le frontend applique les filtres (catégorie, source, mot-clé) pour un affichage fluide.

📂 Structure simplifiée
flowly/
│
├── public/          # Frontend
├── src/             # Backend (routes, services, utils)
├── server.js
└── .env

🎓 Objectif pédagogique

Projet réalisé dans un cadre académique pour démontrer :

Utilisation d’API REST

Architecture backend modulaire

Gestion d’état frontend

Fusion et normalisation de données

Interface moderne et responsive
