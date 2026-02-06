📰 Flowly — Agrégateur d’Actualités Moderne

Flowly est un agrégateur d’actualités rapide, léger et personnalisable combinant NewsAPI et des flux RSS pour fournir un fil d’information complet, filtrable en temps réel.

Stack technique :

Backend → Node.js 

Frontend → HTML / CSS 

IDE recommandé → PhpStorm

✨ Fonctionnalités
🗂️ Agrégation intelligente

Sources NewsAPI automatiques

Ajout de flux RSS externes

Support FR 🇫🇷 / EN 🇬🇧

🔎 Filtrage dynamique

Multi-sélection de médias

Recherche par mot-clé instantanée

Masquage de sources

Tri fluide côté client

🎨 Personnalisation

Dark Mode

Changement de langue à chaud

Historique de lecture

Résumé IA simulé pour chaque article

⚙️ Installation
1️⃣ Prérequis

Node.js 18+

Clé NewsAPI

2️⃣ Cloner le projet
git clone https://github.com/3mamri/flowly.git
cd flowly

3️⃣ Installer les dépendances
npm install

4️⃣ Configuration

Créer .env :

NEWS_API_KEY=YOUR_API_KEY_HERE

5️⃣ Lancer

Dev :

npm run dev


Prod :

npm start


👉 http://localhost:3000

🧠 Architecture du projet
flowly/
│
├── public/        → Frontend
├── src/
│   ├── routes/    → API routes
│   ├── services/  → NewsAPI + RSS logic
│   ├── utils/     → helpers (dedupe, normalize…)
│
├── server.js      → Express server
├── .env
├── .gitignore

🔄 Flux interne

Frontend → sélection langue

Backend →

NewsAPI

RSS

Normalisation + déduplication

Filtrage client (sources → médias → mots-clés)

🚀 Améliorations futures (roadmap)

Auth utilisateurs

Favoris persistants (DB)

Résumés IA réels (OpenAI API)

PWA / offline mode

Docker

🛡️ Bonnes pratiques

Le repo ignore :

node_modules/
.env
.idea/
dist/


Installation après clone :

npm install

👨‍💻 Auteur

Projet développé par Amirouche Mamri
