import { Component, ViewChild, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop'; //Drag and Drop
import { AudioEventsService } from '../../services/audio-events.service';
import { ViewportLineDirective } from '../../directives/viewport-line.directive';
import { WindowManagerService } from '../../services/window-manager.service';
import { Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Interface pour définir la structure d'un langage
interface Language {
  id: string;
  name: string;
  icon: string;
  progressWidth: number; // Largeur de la barre de progression (0-100)
  skills: string[]; // Liste des compétences
}

@Component({
  selector: 'app-competances',
  imports: [CommonModule, DragDropModule, ViewportLineDirective],
  templateUrl: './competances.component.html',
  styleUrl: './competances.component.scss'
})
export class CompetancesComponent implements OnInit, OnDestroy {
  /**
   * Pourcentage de la largeur de l'écran pour calculer la distance du point intermédiaire de la ligne.
   * Cette valeur détermine à quelle distance du composant le point intermédiaire sera placé.
   * Par défaut : 12% de la largeur de l'écran.
   * Exemple : distancePercentage = 15 signifie que le point intermédiaire sera à 15% de window.innerWidth du composant.
   */
  @Input() distancePercentage: number = 12;
  
  // Données des langages - facilement modifiables et extensibles
  languages: Language[] = [
    { //ANGULAR + TS
      id: 'angular-typescript',
      name: 'ANGULAR',
      icon: 'assets/media/icons/LANG_Angular.svg',
      progressWidth: 70, // 70% de largeur
      skills: [
        'Composants et modules',
        'Data binding et directives',
        'Services et dépendances',
        'RxJS et Observables',
        'Routing et navigation'
      ]
    },
    { //JAVASCRIPT
      id: 'javascript',
      name: 'JAVASCRIPT + TYPESCRIPT',
      icon: 'assets/media/icons/LANG_logo-javascript.svg',
      progressWidth: 60, // 85% de largeur
      skills: [
        'Programmation modulaire',
        'Gestion des structures',
        'Programmation asynchrone',
        'Manipulation du DOM',
        'Frameworks modernes'
      ]
    },
    { //JAVA
      id: 'java',
      name: 'JAVA SE',
      icon: 'assets/media/icons/LANG_logo-java-coffee-cup.svg',
      progressWidth: 65,
      skills: [
        'Programmation orientée objet',
        'Gestion des collections',
        'Exceptions et gestion d’erreurs',
        'Interfaces et classes abstraites',
        'Multithreading'
      ]
    },
    { // SPRING BOOT
      id: 'springboot',
      name: 'SPRING BOOT',
      icon: 'assets/media/icons/LANG_logo-spring-boot.svg',
      // icon: 'assets/media/icons/LANG_spring-boot.svg',
      progressWidth: 70,
      skills: [
        'Création de controllers REST & MVC',
        'Architecture en couches (Controller / Service / Repository)',
        'JPA / Hibernate & mapping relationnel',
        'Intégration Thymeleaf (views dynamiques)',
        'Connexion à une base MariaDB',
        'Gestion des entités et relations complexes',
      ]
    },    
    { //J2EE
      id: 'j2ee',
      name: 'J2EE - Jakarta',
      icon: 'assets/media/icons/LANG_logo-java-coffee-cup.svg',
      progressWidth: 55,
      skills: [
        'Servlets et JSP',
        'JDBC et gestion des bases de données',
        'EJB (Enterprise Java Beans)',
        'Développement d’applications web',
        'Déploiement sur serveurs Tomcat/Glassfish'
      ]
    },
    // { //HTML
    //   id: 'html',
    //   name: 'HTML',
    //   icon: 'assets/media/icons/LANG_html-5.svg',
    //   progressWidth: 90, // 90% de largeur
    //   skills: [
    //     'Structure sémantique',
    //     'Accessibilité web',
    //     'Formulaires et validation'
    //   ]
    // },
    // { //CSS
    //   id: 'css',
    //   name: 'CSS',
    //   icon: 'assets/media/icons/LANG_css.svg',
    //   progressWidth: 75, // 75% de largeur
    //   skills: [
    //     'Layout Flexbox/Grid',
    //     'Animations et transitions',
    //     'Responsive design',
    //     'Préprocesseurs (Sass)'
    //   ]
    // },
    { //PYTHON
      id: 'python',
      name: 'PYTHON',
      icon: 'assets/media/icons/LANG_python.svg',
      progressWidth: 70,
      skills: [
        'Programmation orientée objet',
        'Analyse de données',
        'Automatisation'
      ]
    },
    { //ANDROID
      id: 'android',
      name: 'ANDROID',
      icon: 'assets/media/icons/LANG_android-os.svg',
      progressWidth: 55,
      skills: [
        'Activités et fragments',
        'Cycle de vie des applications',
        'Layouts et UI',
        'Gestion des permissions',
        'Appels API et stockage local'
      ]
    },
    { //UML
      id: 'uml',
      name: 'UML',
      icon: 'assets/media/icons/LANG_UML.svg',
      progressWidth: 65,
      skills: [
        'Diagrammes de classes',
        'Diagrammes de séquence',
        'Cas d’utilisation',
        'Modélisation objet',
        'Analyse fonctionnelle'
      ]
    },
    { //C++
      id: 'cpp',
      name: 'C++',
      icon: 'assets/media/icons/LANG_C++.svg',
      progressWidth: 45,
      skills: [
        'Gestion de la mémoire',
        'Programmation orientée objet',
        'Templates et génériques',
        'Structures de données',
        'Programmation bas niveau'
      ]
    },
    { //C
      id: 'c',
      name: 'C',
      icon: 'assets/media/icons/LANG_C.svg',
      progressWidth: 50,
      skills: [
        'Pointeurs et mémoire',
        'Structures et tableaux',
        'Gestion des fichiers',
        'Compilation et Makefile',
        'Programmation système'
      ]
    },
    { //GIT
      id: 'git',
      name: 'GIT',
      icon: 'assets/media/icons/LANG_git.svg',
      progressWidth: 70,
      skills: [
        'Gestion de versions',
        'Branches et merges',
        'Rebase et cherry-pick',
        'Gestion des conflits',
        'Collaboration via GitHub/GitLab'
      ]
    },
  ];

  // Objet pour stocker la rotation de chaque flèche
  arrowRotation: { [key: string]: number } = {};
  
  // Objet pour stocker l'état de chaque langage
  open: { [key: string]: boolean } = {};
  
  // Propriété pour la hauteur du path SVG
  pathHeight: number = 330;

  @ViewChild(ViewportLineDirective) viewportLineDirective!: ViewportLineDirective;
  
  // EventEmitter pour communiquer avec le composant parent
  @Output() closeComponent = new EventEmitter<void>();

  // Propriétés pour la gestion des fenêtres
  private readonly windowId = 'competances-window';
  private subscription: Subscription = new Subscription();
  public windowZIndex: number = 1000;

  constructor(
    private audioEventsService: AudioEventsService,
    private windowManagerService: WindowManagerService
  ) {
    // Initialiser les états pour chaque langage
    this.languages.forEach(lang => {
      this.arrowRotation[lang.id] = 0;
      this.open[lang.id] = false;
    });
  }

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

  // Méthode appelée quand on clique sur la flèche
  rotateArrow(language: string) {
    // Ajoute 90 degrés à la rotation actuelle
    this.arrowRotation[language] += 90;
    
    // Optionnel : garder la rotation entre 0 et 360 degrés
    if (this.arrowRotation[language] > 90) {
      this.arrowRotation[language] = 0;
      this.open[language] = false;
      // Jouer le son de fermeture
      this.audioEventsService.playCloseSound();
      // console.log("close")
    } else {
      this.open[language] = true;
      // Jouer le son d'ouverture
      this.audioEventsService.playOpenSound();
      // console.log("open")
    }
    
    // Calculer la hauteur en fonction de l'état de toutes les flèches
    this.updatePathHeight();
  }

  // Méthode pour mettre à jour la hauteur du path
  updatePathHeight() {
    // Si au moins une flèche est ouverte, garder la hauteur à 600 sinon 330
    const hasAnyOpen = Object.values(this.open).some(isOpen => isOpen);
    this.pathHeight = hasAnyOpen ? 600 : 330;
  }

  // Méthode pour générer le path SVG avec la hauteur dynamique
  getPathD(): string {
    return `M12.0713 ${this.pathHeight}V3H214.521L261.938 40.7647H578V${this.pathHeight}H12.0713Z`;
  }

  // Méthode pour calculer la largeur de la barre de progression
  getProgressBarWidth(language: Language): string {
    return `${language.progressWidth}%`;
  }

  // Méthode pour calculer la hauteur du foreignObject des langages
  getLanguagesContainerHeight(): string {
    // Vérifier si au moins une flèche est ouverte
    const hasAnyOpen = Object.values(this.open).some(isOpen => isOpen);
    
    // Si aucune flèche n'est ouverte, hauteur = 43%
    // Sinon, hauteur = 87% pour laisser de la place aux descriptions
    return hasAnyOpen ? '87%' : '43%';
  }

  // Méthode pour optimiser les performances de la boucle *ngFor
  trackByLanguage(index: number, language: Language): string {
    return language.id;
  }

  /**
   * Méthode appelée lors du déplacement du composant
   * Utilise la directive pour mettre à jour la ligne
   */
  onDragMoved(event: CdkDragMove): void {
    if (this.viewportLineDirective) {
      this.viewportLineDirective.onDragMoved(event);
    }
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur le bouton "X"
   * Émet un événement pour fermer le composant
   */
  onCloseClick(): void {
    this.closeComponent.emit();
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur la fenêtre
   * Fait passer la fenêtre au premier plan
   */
  onWindowClick(): void {
    this.windowZIndex = this.windowManagerService.bringToFront(this.windowId);
  }
}
