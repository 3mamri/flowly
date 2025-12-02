# 📰 Flowly : Agrégateur d'Actualités

Flowly est un agrégateur d’actualités moderne, rapide et personnalisable. Il combine **NewsAPI** et une sélection de **flux RSS** pour fournir un fil d’actualité complet, filtrable et dynamique. Le projet est construit avec **Node.js (Express)** côté backend et un frontend **HTML/CSS/JavaScript pur**, compatible avec PhpStorm.

---

## ✨ Fonctionnalités

### 🗂️ Agrégation

* **Sources Multiples Maximisées** : Récupère automatiquement toutes les sources disponibles via NewsAPI.
* **Support RSS** : Ajout de flux RSS externes selon la langue.
* **Filtrage linguistique** : Français et Anglais.

### 🔎 Filtrage Dynamique

* **Sélection Multi-Média** : Choix d’un ou plusieurs médias, ou aucun.
* **Filtre par mot-clé** : Affine les résultats instantanément.

### 🛠️ Personnalisation

* **Changement de langue dynamique** : Basculer FR ↔ EN change instantanément le flux.
* **Dark Mode** fluide.
* **Historique de lecture** et possibilité de cacher certaines sources.
* **Simulation d’un résumé IA** pour chaque article.

---

## 🌍 Récupération des Médias NewsAPI (FR/EN – France)

Flowly récupère uniquement les médias en **français ou anglais** et **basés en France**, en appelant l’endpoint suivant :

```
https://newsapi.org/v2/top-headlines/sources?language=fr,en&country=fr&apiKey=4dce789306e145cf9742b48fc50bf366
```

Exemple `.env` :

```
NEWS_API_KEY=4dce789306e145cf9742b48fc50bf366
```

---

## 🛠️ Installation

### 1. Prérequis

* **Node.js **
* **Une clé API NewsAPI**
* **PhpStorm**

### 2. Installation des dépendances

```bash
npm install
```

### 3. Configuration

Créez un fichier `.env` :

```
NEWS_API_KEY=4dce789306e145cf9742b48fc50bf366
```

### 4. Lancer le serveur

En mode développement :

```bash
npm run dev
```

Le serveur démarre sur :
**[http://localhost:3000](http://localhost:3000)**

En cas d’erreur `EADDRINUSE`, libérez le port 3000.

---

## 🔧 Fonctionnement Interne

### 1. Chargement des données

* Le frontend envoie la langue sélectionnée (FR/EN) au backend.
* Le backend récupère :

    * Les gros titres de NewsAPI pour cette langue.
    * Les flux RSS associés.

### 2. Filtrage (fetchNews.js)

Ordre d’application :

1. **Sources masquées** → exclues.
2. **Filtrage par média** (multi-sélection).
3. **Filtre par mot-clé**.

Ce fonctionnement garantit un affichage fluide et optimisé.

---