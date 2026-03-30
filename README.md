🏴‍☠️ OnePiecedle - One Piece Guessing Game

<!-- Badges Scolaires et Techniques -->

Un jeu web interactif inspiré de Wordle et Loldle, basé sur l'univers de One Piece. Devinez le personnage mystère chaque jour grâce aux indices dynamiques !

🧠 Concept & Gameplay

Un personnage secret est sélectionné chaque jour. À chaque proposition, le jeu compare les attributs et affiche des indices visuels :

Couleur

Signification

🟩 Vert

Correspondance parfaite (Correct)

🟧 Orange

Correspondance partielle

🟥 Rouge

Aucune correspondance (Incorrect)

🎯 Attributs comparés

👤 Personnage : Nom et Image.

🚻 Genre : Homme / Femme.

🏴‍☠️ Affiliation : Équipage ou organisation.

🍇 Fruit du Démon : Paramecia, Logia, Zoan ou Aucun.

✨ Haki : Maîtrise confirmée (Oui / Non).

💰 Prime : Comparaison avec flèches (↑ ou ↓).

📏 Taille : Comparaison avec flèches (↑ ou ↓).

🌍 Origine : Mer ou île de provenance.

📖 Premier Arc : Arc de la première apparition.

📁 Structure du Projet

src/
├── api/
│   └── onePieceService.js   # Gestion des appels API et normalisation
├── components/
│   └── Game/
│       ├── DailyGame.vue    # Logique principale du jeu
│       ├── GuessInput.vue   # Autocomplétion
│       └── GuessTable.vue   # Affichage des indices
├── data/
│   └── characters.js        # Base de données locale
├── styles.css               # Design "Flashy" et animations
├── App.vue                  # Composant racine
└── main.js                  # Initialisation Vue


🔧 Installation & Lancement

# Cloner le dépôt
git clone [https://github.com/3mamri/OneD.git](https://github.com/3mamri/OneD.git)

# Accéder au dossier
cd OneD

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev


👨‍💻 Auteur

🔗 GitHub : 3mamri

🏁 Licence

Projet académique

Ce projet est réalisé dans le cadre d'un apprentissage scolaire du développement Web moderne avec Vue.js 3.
