<div align="center">

# ⚡ EMIRA — Electro Maintenance Intervention Rapide

**Site vitrine professionnel pour une société de maintenance électrique industrielle**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 À propos

EMIRA SARL est une société tunisienne spécialisée dans la **maintenance électrique industrielle** depuis 1987. Ce projet est le site web vitrine de l'entreprise, développé avec React et Vite.

### Fonctionnalités

- 🏠 **Page d'accueil** — Hero animé, compteurs statistiques, aperçu des services, ticker clients
- 🏢 **À propos** — Historique (timeline), équipe dirigeante, certifications & agréments
- ⚙️ **Services** — 12 services détaillés avec icônes et descriptions
- 🤝 **Références** — 35+ clients publics, 10+ catégories privées, couverture nationale (15 gouvernorats)
- 📧 **Contact** — Formulaire avec envoi d'email (EmailJS), sélection de services via popup, carte Google Maps

---

## 🛠️ Stack Technique

| Technologie | Rôle |
|---|---|
| **React 19** | Framework UI |
| **Vite 6** | Build tool & dev server |
| **React Router DOM** | Navigation SPA |
| **React Icons** | Bibliothèque d'icônes |
| **Framer Motion** | Animations |
| **EmailJS** | Envoi d'emails depuis le frontend |
| **CSS Vanilla** | Styling avec variables CSS |

---

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/fekher12wx/EMIRA.git
cd EMIRA

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur `http://localhost:5173`

---

## 📁 Structure du Projet

```
EMIRA/
├── public/
│   └── logo.png                # Logo EMIRA
├── src/
│   ├── components/
│   │   ├── Navbar.jsx/css      # Navigation responsive
│   │   ├── Footer.jsx/css      # Pied de page multi-colonnes
│   │   └── ScrollReveal.jsx    # Animations au scroll
│   ├── pages/
│   │   ├── Home.jsx/css        # Page d'accueil
│   │   ├── About.jsx/css       # À propos & historique
│   │   ├── Services.jsx/css    # Services détaillés
│   │   ├── Clients.jsx/css     # Références clients
│   │   └── Contact.jsx/css     # Formulaire de contact
│   ├── App.jsx                 # Routeur principal
│   ├── main.jsx                # Point d'entrée
│   └── index.css               # Design system global
└── index.html                  # HTML principal
```

---

## 🎨 Design System

| Variable | Valeur | Usage |
|---|---|---|
| `--navy` | `#1a2744` | Couleur principale |
| `--red` | `#dc2626` | Couleur d'accent |
| `--white` | `#ffffff` | Arrière-plans |
| Font Heading | **Outfit** | Titres |
| Font Body | **Inter** | Texte courant |

---

## 📧 Configuration EmailJS

Le formulaire de contact utilise [EmailJS](https://www.emailjs.com/) pour envoyer les emails. Pour configurer :

1. Créer un compte gratuit sur [emailjs.com](https://www.emailjs.com/)
2. Ajouter un service email (Gmail, Outlook, etc.)
3. Créer un template HTML
4. Mettre à jour les constantes dans `src/pages/Contact.jsx` :

```js
const EMAILJS_SERVICE_ID  = 'votre_service_id'
const EMAILJS_TEMPLATE_ID = 'votre_template_id'
const EMAILJS_PUBLIC_KEY   = 'votre_public_key'
```

---

## 📦 Scripts Disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |

---

## 🏢 Informations Entreprise

- **Raison sociale** : EMIRA SARL
- **Fondée en** : 1987
- **Agrément** : B2/C3 — Ministère de l'Équipement et de l'Habitat
- **Contrat cadre** : STEG, Tunisie Télécom, ONAS, ONT
- **Adresse** : Route de Sousse Km6, Mégrine 2033, Tunisie
- **Urgences** : 20 832 832 / 50 832 259

---

<div align="center">

**Développé avec ❤️ pour EMIRA**

*Quelque soit votre problème, nous avons la solution !*

</div>
# EMIRA
