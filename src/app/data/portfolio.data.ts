export interface PortfolioItem {
  id: string;
  title: string;
  imagePath: string;
  description: string;
  technologies: {
    label: string;
  }[];
  language: {
    label: string;
  };
  difficulty: {
    label: string;
  };
  date: {
    label: string;
  };
  seeMoreLink?: string;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
    {
      id: 'nocte-syndikate',
      title: '// Nocte Syndikate',
      imagePath: 'assets/media/images/nocte-syndikate.webp',
      description:
        `Nocte Syndikate est le site de mon agence de webdesign et de graphisme basée à Toulouse. Je l’ai conçu comme une vitrine à mon image : typographie forte, animations soignées, scroll fluide et éléments 3D, sans aucun template. Le site présente mes services (graphisme, webdesign, visibilité en ligne, développement sur mesure), une sélection de projets clients et mon process de travail, avec un formulaire de contact et une version bilingue FR / EN.`,
      technologies: [
        { label: 'Angular' },
        { label: 'Three.js' },
        { label: 'Lenis' }
      ],
      language: { label: 'Français / Anglais' },
      difficulty: { label: 'High effort' },
      date: { label: '2026' },
      seeMoreLink: 'https://nocte-syndikate.com/'
    },
    {
      id: 'e-fsf',
      title: '// E-Formation sans frontieres',
      imagePath: 'assets/media/images/e-formation-sans-frontieres.webp',
      description:
        `E-FSF est un site WordPress conçu comme une plateforme immersive mettant l’accent sur l’expérience utilisateur, l’identité graphique et le dynamisme de navigation. Il dépasse le cadre du site vitrine standard en proposant une interface animée, interactive et orientée storytelling visuel. C'est un site pour présenter l'ensemble des formations que propose e-fsf ainsi que les modalités d'inscriptions.`,
      technologies: [
        { label: 'WordPress' },
        { label: 'Three.js' },
      ],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Novembre 2025' },
      seeMoreLink: 'https://www.eformationsansfrontiere.fr/'
    },
    {
      id: 'rebel-manager',
      title: '// Rebel Manager',
      imagePath: 'assets/media/images/Rebel-Manager.webp',
      description:
        `Rebel Manager est une application de gestion inspirée de l’univers Star Wars, développée pendant ma formation de Concepteur Développeur d’Applications. Elle permet de gérer toute une flotte rebelle : création et gestion des pilotes, des chasseurs (X-Wing, Y-Wing, etc.), des missions et de leurs affectations. Le projet m’a servi de terrain de jeu pour mettre en pratique une architecture en couches (domaine, services, contrôleurs), les relations JPA/Hibernate (OneToMany, ManyToOne, ManyToMany), la persistance avec MariaDB, ainsi que l’intégration front avec Thymeleaf. L’objectif était de construire une vraie application métier complète, avec formulaires, validations, pagination, historique des missions et affichage des résultats, comme si j’étais en train de développer un outil interne pour le commandement de l’Alliance Rebelle.`,
      technologies: [
        { label: 'Spring Boot' },
        { label: 'Thymeleaf' },
        { label: 'MariaDB' }
      ],
      language: { label: 'Français' },
      difficulty: { label: 'High effort' },
      date: { label: 'Novembre 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis'
    },
    {
      id: 'nocte-grafika',
      title: '// Nocte Grafika',
      imagePath: 'assets/media/images/nocte-grafika.webp',
      description: `Nocte Grafika est mon espace créatif personnel, une sorte d’atelier numérique où je rassemble tout ce que je conçois en design graphique et visuel. J’y ai laissé libre cours à mes idées pour lui donner un design parfois un peu osé, à l’image de ma façon de créer. J’ai voulu créer ce site comme mon carnet perso : on y trouve aussi bien mes projets aboutis que mes expérimentations, mes essais, mes envies. C’est un lieu où je peux montrer non seulement le résultat final, mais aussi le chemin parcouru, les idées testées, parfois abandonnées, parfois transformées.`,
      technologies: [{ label: 'Angular' }],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Aout 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis/Nocte-Grafika'
    },
    {
      id: 'sk8-blog',
      title: '// SK8 Blog',
      imagePath: 'assets/media/images/SK8.webp',
      description:
        `SK8 est une application web de type blog, développée en Jakarta EE autour de la culture skate. L’objectif du projet était de concevoir une application complète côté serveur, avec gestion des articles, des utilisateurs et des interactions de base. Le projet met en œuvre une architecture MVC claire, avec séparation des responsabilités entre les servlets (logique métier), les JSP (vues) et les entités persistantes. J’y ai implémenté la gestion des formulaires, la persistance en base de données, la navigation entre les pages et les opérations CRUD (création, lecture, modification, suppression des articles). Ce projet m’a permis de comprendre concrètement le fonctionnement d’une application Java web côté serveur, loin des frameworks "magiques", et de manipuler directement les mécanismes fondamentaux du web dynamique.`,
      technologies: [
        { label: 'Jakarta EE' },
        { label: 'Servlets' },
        { label: 'JSP' },
        { label: 'MySQL' }
      ],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Octobre 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis'
    },    
    {
      id: 'cyber-resume',
      title: '// Cyber Resume',
      imagePath: 'assets/media/images/cyber-resume.webp',
      description: `Un site web portfolio moderne avec un design cyberpunk et des animations fluides. Développé avec Angular et TypeScript, Je me suis laissé carte blanche sur ce projet pour développer mes compétences en front-end et en design d'interface utilisateur.`,
      technologies: [{ label: 'Angular' }, { label: 'TypeScript' }],
      language: { label: 'Français' },
      difficulty: { label: 'High effort' },
      date: { label: 'Aout 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis/Cyber_Resume'
    },
    {
      id: 'sphere-survie',
      title: '// Sphere Survie',
      imagePath: 'assets/media/images/Sphere-Survie.webp',
      description: `Blog sur l'autonomie et la resilience. Application de gestion de stock [VBA] avec fonctionnalités avancées : catégorisation, priorités, rappels, filtres intelligents.`,
      technologies: [{ label: 'WIX' }, { label: 'HTML' }, { label: 'CSS' }, { label : 'Javascript' }],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Janvier 2021' },
      seeMoreLink: '#'
    },
    {
      id: 'protac2a-ecommerce-app',
      title: '// PROTAC-2A E-commerce App',
      imagePath: 'assets/media/images/protac2a.webp',
      description: `Application e-commerce de surplus militaire complète avec gestion des produits, panier d'achat et système de paiement. Création avec un CMS. Gestion des commandes, des clients et du stocks. Gestion du SEO et des réseaux sociaux.`,
      technologies: [{ label: 'WIX' }, { label: 'HTML' }, { label: 'CSS' }],
      language: { label: 'Français' },
      difficulty: { label: 'Low effort' },
        date: { label: 'Juillet 2020' },
        seeMoreLink: '#'
    }
];
