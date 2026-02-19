<h1 align="center">📰 Flowly</h1>

📰 Flowly — Agrégateur d’Actualités

Flowly est un agrégateur d’actualités moderne développé avec Node.js (Express) et HTML/CSS/JavaScript vanilla.
Il combine NewsAPI et plusieurs flux RSS pour proposer un fil d’actualité dynamique, filtrable et bilingue.

✨ Fonctionnalités

🌍 Support Français / Anglais

🗂️ Catégories : Actualités, Politique, Économie, Sports, Culture

🔎 Filtrage par média et par mot-clé

🔄 Fusion de données multi-sources (NewsAPI + RSS)

🧹 Suppression des doublons

🌙 Dark Mode

🔗 Sources cliquables

⚠️ Gestion propre des erreurs et des données manquantes

⚙️ Installation
1. Installer les dépendances
npm install

2. Créer un fichier .env
NEWS_API_KEY=VOTRE_CLE_API
GNEWS_API_KEY=VOTRE_CLE_API

3. Lancer le serveur
npm run dev


Accès :
👉 http://localhost:3000

🧠 Fonctionnement

Le frontend envoie la langue et la catégorie sélectionnées au backend.
Le backend :

récupère les articles via NewsAPI

complète avec des flux RSS

normalise et fusionne les données

renvoie un format unique au frontend

Le filtrage final (catégorie, source, mot-clé) est appliqué côté client pour un affichage fluide.
