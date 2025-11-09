# ⚡ Analyseur Électrotechnique - Diagramme de Fresnel

<div align="center">

![Electrical Analysis](https://img.shields.io/badge/Electrical-Analysis-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Une application web interactive pour l'analyse avancée des systèmes électriques triphasés**

[🚀 Demo Live](https://VOTRE-USERNAME.github.io/electrotechnical-analyzer/) • [📖 Documentation](#documentation) • [🛠️ Installation](#installation)

</div>

---

## 🎯 À propos

Cette application permet aux ingénieurs électriciens, étudiants et professionnels d'analyser visuellement les systèmes électriques triphasés avec une précision exceptionnelle. Elle offre une représentation interactive des diagrammes de Fresnel, une analyse harmonique complète et la décomposition en séquences électriques.

### 🎓 Contexte pédagogique
Parfait pour l'enseignement de l'électrotechnique, cette application illustre de manière interactive les concepts fondamentaux :
- Systèmes triphasés équilibrés et déséquilibrés
- Analyse harmonique et distorsion (THD)
- Composantes symétriques (séquences directe, inverse, homopolaire)
- Impact des harmoniques sur le courant de neutre

## ✨ Fonctionnalités principales

### 📊 Diagramme de Fresnel interactif
- **Visualisation temps réel** des phaseurs de courant
- **Animation fluide** avec contrôle de vitesse
- **Zoom et navigation** pour analyse détaillée
- **Affichage des magnitudes et angles** en temps réel

### 🔬 Analyse harmonique avancée
- **Configuration jusqu'à 25 harmoniques** individuellement
- **Calcul automatique du THD** (Total Harmonic Distortion)
- **Préréglages professionnels** : onde pure, carrée, redresseur 6 pulses
- **Filtrage par séquence** : triplen, positive, négative

### ⚡ Séquences électriques
- **Séquence directe** (3n+1) : H1, H4, H7, H10...
- **Séquence inverse** (3n+2) : H2, H5, H8, H11...
- **Séquence homopolaire** (3n) : H3, H6, H9, H12...
- **Visualisation séparée** de chaque séquence
- **Calcul correct du courant de neutre** (somme vectorielle)

### 🌍 Interface multilingue
- **Français** 🇫🇷
- **العربية** 🇸🇦  
- **English** 🇺🇸

### 🎛️ Contrôles avancés
- **Phases individuelles** pour démonstration du déséquilibre
- **Mode monophasé/triphasé**
- **Contrôle d'amplitude et phase** pour chaque harmonique
- **Export/Import** de configurations

## 🔧 Technologies utilisées

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.3.1 | Interface utilisateur |
| **TypeScript** | 5.5.3 | Typage statique |
| **Vite** | 5.4.2 | Build tool moderne |
| **TailwindCSS** | 3.4.1 | Styling responsive |
| **Zustand** | 5.0.8 | Gestion d'état |
| **Canvas API** | Native | Rendu graphique |
| **Lucide React** | 0.344.0 | Icônes |

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation locale
```bash
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/electrotechnical-analyzer.git
cd electrotechnical-analyzer

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour production
npm run build
```

### Déploiement GitHub Pages
```bash
# Déployer automatiquement
npm run deploy
```

## 📱 Utilisation

### 1. Configuration de base
- Sélectionnez le **mode** (monophasé/triphasé)
- Ajustez la **fréquence fondamentale** (50/60 Hz)
- Choisissez le **nombre d'harmoniques** à analyser

### 2. Configuration des harmoniques
- **Activez/désactivez** chaque harmonique
- Réglez **l'amplitude** (0-200A)
- Ajustez la **phase** (-180° à +180°)
- Utilisez les **préréglages** pour des cas typiques

### 3. Analyse des résultats
- **Diagramme de Fresnel** : visualisation des phaseurs
- **Formes d'onde** : signaux temporels
- **Métriques** : RMS, THD, valeurs crêtes
- **Séquences** : analyse par composantes symétriques

### 4. Modes d'affichage phasoriel
- **Fondamental uniquement** : H1 seulement
- **Harmonique sélectionné** : Hk spécifique
- **Résultant (Tous)** : somme de tous les harmoniques
- **Séquence directe** : harmoniques 3n+1
- **Séquence inverse** : harmoniques 3n+2
- **Séquence homopolaire** : harmoniques 3n

## 📊 Formules électrotechniques

### Séquences électriques
```
Séquence directe    : k = 3n+1  (H1, H4, H7, H10...)
Séquence inverse    : k = 3n+2  (H2, H5, H8, H11...)
Séquence homopolaire: k = 3n    (H3, H6, H9, H12...)
```

### Déphasages triphasés
```
Phase A : θ
Phase B : θ - 2π/3 × k  (sauf harmoniques triplens)
Phase C : θ + 2π/3 × k  (sauf harmoniques triplens)
```

### Courant de neutre
```
In = Ia + Ib + Ic  (somme vectorielle)
```

Pour les harmoniques triplens (multiples de 3) :
```
3 × 120° = 360° = 0°  →  Les trois phases sont en phase
→  In = 3 × Ih  (les courants s'additionnent)
```

## 🎯 Cas d'usage

### 🏫 Enseignement
- **Cours d'électrotechnique** : illustration des concepts théoriques
- **Travaux pratiques** : simulation sans matériel coûteux
- **Projets étudiants** : analyse de cas réels

### 🏭 Industrie
- **Analyse de qualité** : mesure de la distorsion harmonique
- **Diagnostic** : identification des sources de perturbations
- **Dimensionnement** : calcul du courant de neutre

### 🔬 Recherche
- **Validation de modèles** : comparaison théorie/simulation
- **Développement** : test de nouvelles configurations
- **Publication** : génération de graphiques professionnels

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. **Fork** le projet
2. Créez votre **branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Votre Nom**
- GitHub: [@votre-username](https://github.com/votre-username)
- Email: votre.email@example.com

## 🙏 Remerciements

- Communauté React pour les outils exceptionnels
- Professeurs d'électrotechnique pour l'inspiration pédagogique
- Ingénieurs électriciens pour les retours techniques

---

<div align="center">

**⚡ Fait avec passion pour l'électrotechnique ⚡**

[⬆ Retour en haut](#-analyseur-électrotechnique---diagramme-de-fresnel)

</div>
