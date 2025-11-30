import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WindowManagerService } from '../../services/window-manager.service';
import { Subscription } from 'rxjs';

// Interface pour définir la structure d'un projet portfolio
interface PortfolioItem {
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

@Component({
  selector: 'app-portfolio',
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit, OnDestroy {
  // Événement pour fermer le portfolio
  @Output() closePortfolio = new EventEmitter<void>();
  
  // Ligne ajoutée au hasard - propriété pour la couleur du thème
  themeColor: string = '#00ff88';

  // Propriétés pour la gestion des fenêtres
  private readonly windowId = 'portfolio-window';
  private subscription: Subscription = new Subscription();
  public windowZIndex: number = 1000;
  
  // Tableau des projets portfolio
  portfolioItems: PortfolioItem[] = [
      {
      id: 'e-fsf',
      title: '// E-Formation sans frontieres',
      imagePath: 'assets/media/images/e-formation-sans-frontieres.png',
      description:
        'E-FSF est un site WordPress conçu comme une plateforme immersive mettant l’accent sur l’expérience utilisateur, l’identité graphique et le dynamisme de navigation. Il dépasse le cadre du site vitrine standard en proposant une interface animée, interactive et orientée storytelling visuel. C\'est un site pour présenter l\'ensemble des formations que propose e-fsf ainsi que les modalités d\'inscriptions.',
      technologies: [
        { label: 'WordPress' },
        { label: 'TreeJS' },
      ],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Novembre 2025' },
      seeMoreLink: 'https://www.eformationsansfrontiere.fr/'
    },
    {
      id: 'rebel-manager',
      title: '// Rebel Manager',
      imagePath: 'assets/media/images/Rebel-Manager.png',
      description:
        'Rebel Manager est une application de gestion inspirée de l’univers Star Wars, développée pendant ma formation de Concepteur Développeur d’Applications. Elle permet de gérer toute une flotte rebelle : création et gestion des pilotes, des chasseurs (X-Wing, Y-Wing, etc.), des missions et de leurs affectations. Le projet m’a servi de terrain de jeu pour mettre en pratique une architecture en couches (domaine, services, contrôleurs), les relations JPA/Hibernate (OneToMany, ManyToOne, ManyToMany), la persistance avec MariaDB, ainsi que l’intégration front avec Thymeleaf. L’objectif était de construire une vraie application métier complète, avec formulaires, validations, pagination, historique des missions et affichage des résultats, comme si j’étais en train de développer un outil interne pour le commandement de l’Alliance Rebelle.',
      technologies: [
        { label: 'Spring Boot' },
        { label: 'Thymeleaf' },
        { label: 'MariaDB' }
      ],
      language: { label: 'Français' },
      difficulty: { label: 'High effort' },
      date: { label: 'Novembre 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis' //TODO : Mettre le lien vers le repo github 
    },
    {
      id: 'nocte-grafika',
      title: '// Nocte Grafika',
      imagePath: 'assets/media/images/nocte-grafika.png',
      description: 'Nocte Grafika est mon espace créatif personnel, une sorte d’atelier numérique où je rassemble tout ce que je conçois en design graphique et visuel. J’y ai laissé libre cours à mes idées pour lui donner un design parfois un peu osé, à l’image de ma façon de créer. J’ai voulu créer ce site comme mon carnet perso : on y trouve aussi bien mes projets aboutis que mes expérimentations, mes essais, mes envies. C’est un lieu où je peux montrer non seulement le résultat final, mais aussi le chemin parcouru, les idées testées, parfois abandonnées, parfois transformées.',
      technologies: [{ label: 'Angular' }],
      language: { label: 'Francais' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Aout 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis/Nocte-Grafika'
    },
    {
      id: 'sk8-blog',
      title: '// SK8 Blog',
      imagePath: 'assets/media/images/SK8.png',
      description:
        'SK8 est une application web de type blog, développée en Jakarta EE autour de la culture skate. L’objectif du projet était de concevoir une application complète côté serveur, avec gestion des articles, des utilisateurs et des interactions de base. Le projet met en œuvre une architecture MVC claire, avec séparation des responsabilités entre les servlets (logique métier), les JSP (vues) et les entités persistantes. J’y ai implémenté la gestion des formulaires, la persistance en base de données, la navigation entre les pages et les opérations CRUD (création, lecture, modification, suppression des articles). Ce projet m’a permis de comprendre concrètement le fonctionnement d’une application Java web côté serveur, loin des frameworks "magiques", et de manipuler directement les mécanismes fondamentaux du web dynamique.',
      technologies: [
        { label: 'Jakarta EE' },
        { label: 'Servlets' },
        { label: 'JSP' },
        { label: 'MySQL' }
      ],
      language: { label: 'Français' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Octobre 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis' // remplace par le repo exact si tu veux
    },    
    {
      id: 'cyber-resume',
      title: '// Cyber Resume',
      imagePath: 'assets/media/images/cyber-resume.png',
      description: 'Un site web portfolio moderne avec un design cyberpunk et des animations fluides. Développé avec Angular et TypeScript, Je me suis laissé carte blanche sur ce projet pour développer mes compétences en front-end et en design d\'interface utilisateur.',
      technologies: [{ label: 'Angular' }, { label: 'TypeScript' }],
      language: { label: 'Francais' },
      difficulty: { label: 'High effort' },
      date: { label: 'Aout 2025' },
      seeMoreLink: 'https://github.com/Tristan-Lwouis/Cyber_Resume'
    },
    {
      id: 'sphere-survie',
      title: '// Sphere Survie',
      imagePath: 'assets/media/images/Sphere-Survie.png',
      description: 'Blog sur l\'autonomie et la resilience. Application de gestion de stock [VBA] avec fonctionnalités avancées : catégorisation, priorités, rappels, filtres intelligents.',
      technologies: [{ label: 'WIX' }, { label: 'HTML' }, { label: 'CSS' }, { label : 'Javascript' }],
      language: { label: 'Francais' },
      difficulty: { label: 'Medium effort' },
      date: { label: 'Janvier 2021' },
      seeMoreLink: '#'
    },
    {
      id: 'protac2a-ecommerce-app',
      title: '// PROTAC-2A E-commerce App',
      imagePath: 'assets/media/images/protac2a.png',
      description: 'Application e-commerce de surplus militaire complète avec gestion des produits, panier d\'achat et système de paiement. Création avec un CMS. Gestion des commandes, des clients et du stocks. Gestion du SEO et des réseaux sociaux.',
      technologies: [{ label: 'WIX' }, { label: 'HTML' }, { label: 'CSS' }],
      language: { label: 'Francais' },
      difficulty: { label: 'Low effort' },
        date: { label: 'Juillet 2020' },
        seeMoreLink: '#'
    },
    // {
    //   id: 'weather-app',
    //   title: '// Weather App',
    //   imagePath: 'assets/media/images/nocte-grafika.png',
    //   description: 'Application météo avec prévisions en temps réel, géolocalisation et alertes personnalisées. Interface élégante avec animations météorologiques et données détaillées sur 7 jours.',
    //   technologies: [{ label: 'JavaScript' }, { label: 'API REST' }],
    //   language: { label: 'Anglais' },
    //   difficulty: { label: 'Facile' },
    //   date: { label: 'Septembre 2024' },
    //   seeMoreLink: '#'
    // },
    // {
    //   id: 'social-network',
    //   title: '// Social Network',
    //   imagePath: 'assets/media/images/nocte-grafika.png',
    //   description: 'Réseau social avec messagerie instantanée, partage de photos et système de notifications en temps réel. Architecture scalable avec microservices et base de données distribuée.',
    //   technologies: [{ label: 'React' }, { label: 'MongoDB' }, { label: 'Socket.io' }],
    //   language: { label: 'Francais' },
    //   difficulty: { label: 'Très Difficile' },
    //   date: { label: 'Août 2024' },
    //   seeMoreLink: '#'
    // }

  ];

  constructor(private windowManagerService: WindowManagerService) {}

  /**
   * Initialise le composant et enregistre la fenêtre dans le gestionnaire
   */
  ngOnInit(): void {
    // Enregistrer la fenêtre dans le gestionnaire
    this.windowZIndex = this.windowManagerService.registerWindow(this.windowId);
    
    // S'abonner aux changements de fenêtre active
    this.subscription.add(
      this.windowManagerService.getActiveWindowObservable().subscribe(activeWindowId => {
        if (activeWindowId === this.windowId) {
          this.windowZIndex = this.windowManagerService.getWindowZIndex(this.windowId);
        }
      })
    );
  }

  /**
   * Nettoie les ressources lors de la destruction du composant
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.windowManagerService.unregisterWindow(this.windowId);
  }

  // Méthode pour ajouter un nouveau projet
  addPortfolioItem(item: PortfolioItem): void {
    this.portfolioItems.push(item);
  }

  // Méthode pour supprimer un projet
  removePortfolioItem(id: string): void {
    this.portfolioItems = this.portfolioItems.filter(item => item.id !== id);
  }

  // Méthode pour obtenir un projet par ID
  getPortfolioItem(id: string): PortfolioItem | undefined {
    return this.portfolioItems.find(item => item.id === id);
  }

  // Méthode pour optimiser le rendu de la liste avec trackBy
  trackByItemId(index: number, item: PortfolioItem): string {
    return item.id;
  }

  // Exemple d'ajout d'un nouveau projet
  addExampleProject(): void {
    const newProject: PortfolioItem = {
      id: 'mon-nouveau-projet', //Ne pas mettre d'espace dans l'id
      title: '// Mon Nouveau Projet',
      imagePath: 'assets/media/images/nocte-grafika.png', // Utilise la même image pour l'exemple
      description: 'Description de mon nouveau projet portfolio',
      technologies: [
        { label: 'React' },
        { label: 'TypeScript' }
      ],
      language: { label: 'Anglais' },
      difficulty: { label: 'Moyen' },
      date: { label: 'Décembre 2024' },
      seeMoreLink: 'https://github.com/mon-projet'
    };
    
    this.addPortfolioItem(newProject);
  }

  // Méthode pour fermer le portfolio
  onCloseClick(): void {
    this.closePortfolio.emit();
  }

  /**
   * Méthode pour gérer le clic sur le bouton "See more"
   * Ouvre le lien du projet dans un nouvel onglet
   */
  onSeeMoreClick(item: PortfolioItem): void {
    if (item.seeMoreLink && item.seeMoreLink !== '#') {
      window.open(item.seeMoreLink, '_blank', 'noopener,noreferrer');
    } else {
      console.log('Lien non disponible pour le projet:', item.title);
    }
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur la fenêtre
   * Fait passer la fenêtre au premier plan
   */
  onWindowClick(): void {
    this.windowZIndex = this.windowManagerService.bringToFront(this.windowId);
  }
}
