import { Component, OnDestroy, ChangeDetectorRef, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

// Importer les composants nécessaires pour l'application
import { LoisirSkillsComponent } from './components/loisir-skills/loisir-skills.component';
import { InfoBulleComponent } from "./components/info-bulle/info-bulle.component";
import { RollingScriptComponent } from "./components/rolling-script/rolling-script.component";
import { DecoComponent } from "./components/deco/deco.component";
import { AvatarComponent } from "./components/avatar/avatar.component";
import { PersonalInfoComponent } from "./components/personal-info/personal-info.component";
import { CursorComponent } from './components/cursor/cursor.component';
import { MenuComponent } from './components/menu/menu.component';
import { UserInformationsComponent } from './components/user-informations/user-informations.component';
import { CompetancesComponent } from './components/competances/competances.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { MemoryMonitorService } from './services/memory-monitor.service';
import { AudioEventsService } from './services/audio-events.service';
import { ViewportLineComponent } from './components/viewport-line/viewport-line.component';
import { SimpleLoadingComponent } from "./loading-page/simple-loading.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgIf,
    LoisirSkillsComponent,
    InfoBulleComponent,
    RollingScriptComponent,
    DecoComponent,
    AvatarComponent,
    PersonalInfoComponent,
    CursorComponent,
    MenuComponent,
    UserInformationsComponent,
    CompetancesComponent,
    PortfolioComponent,
    ViewportLineComponent,
    SimpleLoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  
  // ========================================
  // CONSTRUCTEUR
  // ========================================
  constructor(
    private memoryMonitor: MemoryMonitorService,
    private audioEventsService: AudioEventsService,
    private cdr: ChangeDetectorRef
  ) {}

  // ========================================
  // PROPRIÉTÉS GLOBALES
  // ========================================
  title = 'Cyber_Resume';
  
  // Détection mobile
  isMobile: boolean = false;
  showMobileMessage: boolean = false;

  // ========================================
  // PROPRIÉTÉS DU MENU PRINCIPAL
  // ========================================
  // État centralisé de tous les menus [Experience, Formation, Competences, Skills, Loisirs, Portfolio]
  // Indices: 0=Experience, 1=Formation, 2=Competences, 3=Skills, 4=Loisirs, 5=Portfolio
  menuStates: boolean[] = [false, false, false, false, false, false];
  
  // Gestion du z-index pour l'effet d'onglet entre Skills et Loisirs
  skillsZIndex: number = 2;
  loisirsZIndex: number = 1;

  // ========================================
  // PROPRIÉTÉS DE L'AVATAR
  // ========================================
  showAvatar: boolean = true;
  wasAvatarHidden: boolean = false;
  avatarClickedState: boolean = false;

  // ========================================
  // PROPRIÉTÉS DU ROLLING SCRIPT
  // ========================================
  monCode: string = ` 
> Initialisation du système...
> Scan des ports...
> Connexion à www.tristan.dev réussie.
> Lecture des logs...
> [OK] Expérience confirmée : développement
> [OK] Reconversion en développement : validée
> [OK] Framework Angular détecté
> Ready to code.

> Routines hebdo détectées : 
> - Apprentissage (cours, veille tech)
> - Codage projet perso

printf("Chargement du profil développeur...\n");
printf("Bienvenue dans le portfolio de Tristan.\n");
printf("Chargement des compétences : HTML... OK\n");
printf("Chargement des compétences : CSS... OK\n");
printf("Chargement des compétences : JavaScript... OK\n");
printf("Chargement des compétences : Angular... EN COURS\n");
printf("Chargement des compétences : JAVA... OK\n");
printf("Chargement des compétences : JSE && J2E... OK\n");
printf("Chargement des compétences : ANDROID... OK\n");
printf("Connexion établie.\n");

while (challenge) {
  learn();
  build();
  repeat();
}
`;

  // ========================================
  // CONTENUS DES COMPOSANTS PERSONAL-INFO
  // ========================================
  experienceContent: string = `
   <h2>2025 - Aujourd’hui · Concepteur Développeur d’Applications (stagiaire)</h2>
    <p>
      Formation  au métier de concepteur développeur full-stack avec la réalisation de nombreux projets tutorés. 
      Approfondissement des <strong>principes de la Programmation Orientée Objet</strong> (Java, C++, C#) et mise en pratique 
      sur des projets Back-End (API, bases de données, sécurité) et Front-End (Angular, React). 
      Utilisation des <strong>méthodes AGILE</strong> pour gérer le cycle de vie des projets, avec des sprints, 
      revues de code et travail collaboratif.
    </p>

    <h2>2020 - 2025 · Dessinateur Projeteur</h2>
    <p>
      Conception et gestion de projets techniques, de l’idée initiale jusqu’aux plans détaillés. 
      Maîtrise des outils de <strong>CAO 2D & 3D</strong> (AutoCAD, Revit, Inventor) et réalisation de plans 
      pour des projets industriels et ferroviaires. Coordination avec les équipes de terrain et adaptation aux contraintes 
      techniques et réglementaires.
    </p>

    <h2>2019 - Aujourd'hui · Développeur Web & Graphiste (auto-entrepreneur)</h2>
    <p>
      Création de sites internet ergonomiques et sur mesure via <strong>CMS</strong>. 
      Mise en place de systèmes de gestion de stock, optimisation du référencement (<strong>SEO</strong>) et 
      développement d’une <strong>identité numérique complète</strong> pour mes clients : charte graphique, webmarketing, 
      gestion des réseaux sociaux. Expérience entrepreneuriale qui m’a permis de développer autonomie, rigueur 
      et relation client.
    </p>

    <h2>2023 - Aujourd’hui · Graphiste</h2>
    <p>
      Réalisation de supports visuels pour print et digital : <strong>logos, affiches, flyers, contenus réseaux sociaux</strong>. 
      Participation à l’organisation et à la <strong>planification d’événements</strong> en gérant la communication visuelle, 
      la coordination des intervenants et la cohérence graphique des projets.
    </p>

    <h2>Janvier 2025 · Dakar avec Team Red Bull</h2>
    <p>
      Intégré au <strong>crew Desert Wings</strong> en Arabie Saoudite pour l’édition 2025 du Dakar. 
      Gestion de la logistique et de la communication interne/externe dans un <strong>environnement 100% anglophone</strong>. 
      Travail en équipe sous forte pression, coordination de personnes et adaptation à un contexte 
      international et exigeant.
    </p>

    <h2>2019-2020 · Assistant Chef de Chantier</h2>
    <p>
      Expérience en stage, alternance puis intérim chez <strong>Colas Sud-Ouest</strong> en tant qu’assistant chef de chantier VRD. 
      Suivi de chantiers, gestion des plannings et des équipes, contrôle qualité et respect des normes de sécurité. 
      Une expérience qui m’a permis d’acquérir <strong>rigueur, réactivité et capacité à gérer des imprévus</strong>.
    </p>
  `;

  formationContent: string = `
    <h2>2025 → Formation Développeur Full Stack (LDNR) NIVEAU 6 - BAC+3/4</h2>
    <p>
      Formation intensive de 1 an préparant au métier de <strong>concepteur développeur d'applications</strong>, alliant théorie et pratique à travers des projets tutorés et un stage en entreprise. 
      Le cursus couvre l’<strong>algorithmique</strong>, le développement en <strong>C et C++</strong>, ainsi que la programmation <strong>Java (JSE, J2EE)</strong> et ses frameworks, incluant une initiation au développement mobile sur <strong>Android</strong>. 
      La formation aborde également le <strong>développement web</strong> (HTML5, CSS3, JavaScript, Angular), la conception et l’utilisation de <strong>bases de données</strong>, les <strong>design patterns</strong> et la modélisation via <strong>UML</strong> pour la programmation orientée objet. 
      S’ajoutent des modules de <strong>gestion de projet</strong> et de méthodologies agiles, une introduction à la <strong>sécurité informatique</strong>, ainsi qu’au <strong>déploiement d’applications</strong>.
    he
    </p>

    <h2>2020 → DUT + Licence Infrastructure et reseaux - BAC+3</h2>
    <p>
      Formation technique spécialisée en <strong>conception mécanique</strong> et le <strong>Génie Civil</strong>. 
      Approfondissement des outils de <strong>CAO/DAO</strong>, réalisation de calculs de résistance des matériaux et mise en application 
      de la <strong>gestion de projet</strong> appliquée au secteur industriel. Développement de la communication technique à travers 
      la production de dossiers complets et de présentations adaptées aux différents interlocuteurs (ingénieurs, clients, production).
    </p>

    <h2>2018 → Baccalauréat STI2D (Sciences et Technologies de l’Industrie et du Développement Durable)</h2>
    <p>
      Formation pluridisciplinaire en sciences et technologies industrielles avec une spécialisation en <strong>Architecture et Construction</strong>. 
      Approfondissement des notions de <strong>conception architecturale</strong>, de <strong>modélisation numérique 2D/3D</strong> et de <strong>gestion de projet</strong>. 
      Étude des matériaux, de l’efficacité énergétique et de la durabilité dans le cadre de projets de construction. 
      Développement d’une approche alliant <strong>créativité, technique et respect des contraintes environnementales</strong>.
    </p>
  `;

  // ========================================
  // GETTERS POUR L'AFFICHAGE DES COMPOSANTS
  // ========================================
  get showExperience(): boolean { return this.menuStates[0]; }  // Index 0
  get showFormation(): boolean { return this.menuStates[1]; }   // Index 1
  get showCompetences(): boolean { return this.menuStates[2]; } // Index 2
  get showSkills(): boolean { return this.menuStates[3]; }      // Index 3
  get showLoisirs(): boolean { return this.menuStates[4]; }     // Index 4
  get showPortfolio(): boolean { return this.menuStates[5]; }   // Index 5
 
  // Getter pour afficher le loisir-skills (visible si Skills OU Loisirs est actif)
  get showUserInfoCard(): boolean { 
    return this.menuStates[3] || this.menuStates[4]; // Skills OU Loisirs
  }

  // ========================================
  // MÉTHODES DU MENU PRINCIPAL
  // ========================================
  /**
   * Méthode pour gérer les événements du menu principal
   * Distribue les événements selon le type d'onglet et joue les sons appropriés
   */
  onMenuToggle(event: {index: number, isActive: boolean}): void {
    if (event.index >= 0 && event.index < this.menuStates.length) {
      
      // Jouer le son approprié selon l'action
      this.audioEventsService.playToggleSound(event.isActive);
      
      // Logique spéciale pour Portfolio (index 5)
      if (event.index === 5) {
        this.handlePortfolioToggle(event.isActive);
      }
      // Logique spéciale pour Skills (index 3) et Loisirs (index 4)
      else if (event.index === 3 || event.index === 4) {
        this.handleSkillsLoisirsToggle(event.index, event.isActive);
      } else {
        // Comportement normal pour les autres onglets
        this.menuStates[event.index] = event.isActive;
      }
    }
  }

  /**
   * Méthode pour gérer le toggle exclusif entre Skills et Loisirs
   * Gère l'état mutuellement exclusif des onglets et les z-index pour l'effet de superposition
   */
  private handleSkillsLoisirsToggle(index: number, isActive: boolean): void {
    if (isActive) {
      // Activer l'onglet cliqué et désactiver l'autre
      this.menuStates[3] = (index === 3); // Skills (index 3)
      this.menuStates[4] = (index === 4); // Loisirs (index 4)
      
      // Gérer le z-index
      if (index === 3) { // Skills actif
        this.skillsZIndex = 2;
        this.loisirsZIndex = 1;
      } else if (index === 4) { // Loisirs actif
        this.skillsZIndex = 1;
        this.loisirsZIndex = 2;
      }
    } else {
      // Désactiver les deux onglets
      this.menuStates[3] = false;
      this.menuStates[4] = false;
      // Les z-index restent inchangés car le composant sera caché
    }
  }

  /**
   * Méthode pour gérer les événements des onglets du composant loisir-skills
   * Gère le basculement entre les onglets Skills et Loisirs avec les sons appropriés
   */
  onTabToggle(event: {tab: 'skills' | 'loisirs', isActive: boolean}): void {
    if (event.tab === 'skills') {
      // Activer Skills et désactiver Loisirs
      this.audioEventsService.playToggleSound(true);
      this.handleSkillsLoisirsToggle(3, true); // Skills (index 3)
      // Forcer la mise à jour du menu en créant une nouvelle référence
      this.menuStates = [...this.menuStates];
    } else if (event.tab === 'loisirs') {
      // Activer Loisirs et désactiver Skills
      this.audioEventsService.playToggleSound(true);
      this.handleSkillsLoisirsToggle(4, true); // Loisirs (index 4)
      // Forcer la mise à jour du menu en créant une nouvelle référence
      this.menuStates = [...this.menuStates];
    }
  }

  // ========================================
  // MÉTHODES DU PORTFOLIO
  // ========================================
  /**
   * Méthode pour gérer le toggle du Portfolio
   * Active/désactive le portfolio en masquant l'avatar et l'info-bulle
   * Les autres composants restent fermés quand le portfolio se ferme
   */
  private handlePortfolioToggle(isActive: boolean): void {
    if (isActive) {
      // Activer Portfolio et désactiver tous les autres
      this.menuStates[0] = false; // Experience
      this.menuStates[1] = false; // Formation
      this.menuStates[2] = false; // Competences
      this.menuStates[3] = false; // Skills
      this.menuStates[4] = false; // Loisirs
      this.menuStates[5] = true; // Portfolio
      this.wasAvatarHidden = true; // Masquer l'avatar
      this.showAvatar = false; // Masquer l'avatar
      this.avatarClickedState = false; // Masquer l'info-bulle
    } else {
      // Désactiver Portfolio uniquement, les autres composants restent fermés
      this.menuStates[5] = false; // Portfolio
      
      // Réinitialiser le flag AVANT de réafficher l'avatar pour permettre l'animation
      this.wasAvatarHidden = false;
      // Réafficher l'avatar avec animation
      this.showAvatar = true;
    }
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur le bouton close du portfolio
   * Ferme le portfolio et réaffiche l'avatar
   */
  onPortfolioClose(): void {
    // Jouer le son de fermeture
    this.audioEventsService.playCloseSound();
    
    // Fermer le portfolio en utilisant la même logique que handlePortfolioToggle(false)
    this.handlePortfolioToggle(false);
    
    // Forcer la mise à jour du menu en créant une nouvelle référence
    this.menuStates = [...this.menuStates];
  }

  // ========================================
  // MÉTHODES DE FERMETURE DES COMPOSANTS
  // ========================================
  /**
   * Méthode appelée quand l'utilisateur clique sur le bouton "X" d'un composant
   * Ferme le composant spécifié et joue le son de fermeture
   */
  onComponentClose(componentIndex: number): void {
    // Jouer le son de fermeture
    this.audioEventsService.playCloseSound();
    
    // Fermer le composant spécifié
    if (componentIndex >= 0 && componentIndex < this.menuStates.length) {
      this.menuStates[componentIndex] = false;
      
      // Forcer la mise à jour du menu en créant une nouvelle référence
      this.menuStates = [...this.menuStates];
    }
  }

  /**
   * Méthodes spécifiques pour chaque composant
   */
  onExperienceClose(): void {
    this.onComponentClose(0); // Index 0 = Experience
  }

  onFormationClose(): void {
    this.onComponentClose(1); // Index 1 = Formation
  }

  onCompetencesClose(): void {
    this.onComponentClose(2); // Index 2 = Competences
  }

  onSkillsLoisirsClose(): void {
    // Pour Skills/Loisirs, fermer les deux onglets (index 3 et 4)
    this.menuStates[3] = false; // Skills
    this.menuStates[4] = false; // Loisirs
    this.audioEventsService.playCloseSound();
    
    // Forcer la mise à jour du menu
    this.menuStates = [...this.menuStates];
  }

  // ========================================
  // MÉTHODES DE L'AVATAR
  // ========================================
  /**
   * Méthode appelée quand l'avatar est cliqué
   * Bascule l'état de l'info-bulle et joue les sons appropriés
   */
  onAvatarClicked(): void {
    console.log('Avatar cliqué - Communication avec info-bulle');
    this.avatarClickedState = !this.avatarClickedState; // Toggle pour déclencher la détection
    
    // Jouer le son d'ouverture quand l'info-bulle s'affiche
    if (this.avatarClickedState) {
      this.audioEventsService.playOpenSound();
    } else {
      this.audioEventsService.playCloseSound();
    }
  }

  // ========================================
  // MÉTHODES UTILITAIRES
  // ========================================
  /**
   * Méthode pour forcer la mise à jour de l'état du menu
   * Permet de synchroniser l'état du menu avec les onglets (méthode préparée pour usage futur)
   */
  private updateMenuState(): void {
    // Cette méthode sera appelée après chaque changement d'état pour s'assurer
    // que le menu reflète l'état actuel
    // Le menu se mettra automatiquement à jour grâce au binding [menuStates]="menuStates"
  }

  // ========================================
  // MÉTHODES DE DÉTECTION MOBILE
  // ========================================
  /**
   * Méthode pour détecter si l'appareil est mobile
   */
  private detectMobile(): void {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Détection plus précise des appareils mobiles
    const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    
    // Vérifier si c'est un vrai téléphone (pas tablette) ET en mode portrait
    const isPhonePortrait = isMobileDevice && !isTablet && window.innerWidth <= 480 && window.innerHeight > window.innerWidth;
    
    // Ou si c'est un écran très petit (largeur <= 480px) en mode portrait
    const isSmallPortrait = window.innerWidth <= 480 && window.innerHeight > window.innerWidth;
    
    this.isMobile = isPhonePortrait || isSmallPortrait;
    this.showMobileMessage = this.isMobile;
  }

  /**
   * Listener pour détecter les changements de taille d'écran
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.detectMobile();
  }

  // ========================================
  // LIFECYCLE
  // ========================================
  /**
   * Méthode appelée lors de l'initialisation du composant
   * Détecte si l'appareil est mobile
   */
  ngOnInit(): void {
    this.detectMobile();
  }

  /**
   * Méthode appelée lors de la destruction du composant
   * Arrête le monitoring de la mémoire pour éviter les fuites
   */
  ngOnDestroy(): void {
    this.memoryMonitor.stopMonitoring();
  }


}
