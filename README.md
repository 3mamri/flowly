# 📰 Flowly — News Aggregator

<p align="center">
  <img src="public/icone.png" alt="Flowly Logo" width="80">
</p>

<h2 align="center">L'information décryptée en temps réel</h2>

<p align="center">
  <img src="https://img.shields.io/badge/Projet-Scolaire-blue?style=for-the-badge&logo=googlescholar" alt="Projet Scolaire">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JS Vanilla">
</p>

---

> [!IMPORTANT]
> **CONTEXTE ACADÉMIQUE** > Ce projet démontre la mise en œuvre d'une architecture **Fullstack (Node/Express)** sans framework frontend lourd. L'accent a été mis sur la **gestion de l'asynchronisme**, la **normalisation de données hétérogènes** et l'**optimisation de l'interface utilisateur (UI/UX)**.

---

### ✨ Présentation
**Flowly** est un agrégateur d’actualités moderne conçu pour centraliser l'information mondiale. En combinant la puissance de **NewsAPI** et la flexibilité des **flux RSS**, Flowly offre une expérience de lecture fluide, bilingue et entièrement personnalisable.

---

## 🚀 Fonctionnalités Clés

### 🌍 Expérience Multilingue
* **Switch instantané** entre le Français 🇫🇷 et l'Anglais 🇬🇧.
* Filtrage intelligent des sources selon la langue sélectionnée.

### 🗂️ Organisation par Catégories
Accès rapide aux thématiques majeures : 
* `Actualités` • `Politique` • `Économie` • `Sports` • `Culture` • `Technologie`

### 🎨 Design & Ergonomie
* **Interface "Minimalist Newspaper"** avec typographie premium (*Playfair Display*).
* **Dark Mode natif** pour un confort de lecture nocturne.
* **Responsive Design** : Optimisé pour Desktop, Tablette et Mobile.

---

## 🛠️ Stack Technique

| Secteur | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Flexbox/Grid), JavaScript Vanilla |
| **Backend** | Node.js, Express.js |
| **Data** | NewsAPI, GNews, Flux RSS XML |
| **Outils** | Nodemon, Axios, Dotenv |

---

## ⚙️ Installation & Configuration

### 1. Clonage du dépôt
```bash
git clone [https://github.com/3mamri/flowly.git](https://github.com/3mamri/flowly.git)
cd flowly2. Installation des dépendances
Bash
npm install
3. Configuration de l'environnement
Créez un fichier .env à la racine :

Extrait de code
PORT=3000
NEWS_API_KEY=VOTRE_CLE_NEWSAPI
4. Lancement
Bash
npm run dev
