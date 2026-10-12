import { Component, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';


import { EXPERIENCE_CONTENT } from './data/experiences.data';
import { FORMATION_CONTENT } from './data/formations.data';

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
import { MapModalComponent } from './components/map-modal/map-modal.component';
import { AudioEventsService } from './services/audio-events.service';
import { ViewportLineComponent } from './components/viewport-line/viewport-line.component';
import { SimpleLoadingComponent } from "./loading-page/simple-loading.component";
import { MobileLayoutComponent } from './components/mobile-layout/mobile-layout.component';
import { LayoutService } from './services/layout.service';


@Component({
  selector: 'app-root',
  imports: [
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
    MapModalComponent,
    ViewportLineComponent,
    SimpleLoadingComponent,
    MobileLayoutComponent
],

  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  
  // ========================================
  // CONSTRUCTEUR
  // ========================================
  constructor(
    private audioEventsService: AudioEventsService,
    private cdr: ChangeDetectorRef
  ) {}

  // ========================================
  // PROPRIÉTÉS GLOBALES
  // ========================================
  title = 'Cyber_Resume';
  
  // Choix de la mise en page (bureau virtuel ou mobile) et du curseur
  readonly layout = inject(LayoutService);

  // État de la modale de carte
  showMapModal: boolean = false;


  // ========================================
  // PROPRIÉTÉS DU MENU PRINCIPAL
  // ========================================
  // État centralisé de tous les menus [Experience, Formation, Competences, Skills, Loisirs, Portfolio]
  // Indices: 0=Experience, 1=Formation, 2=Competences, 3=Skills, 4=Loisirs, 5=Portfolio, 6=Deplacement
  menuStates: boolean[] = [false, false, false, false, false, false, false];
  
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
> Init système... [OK]
> Connexion : tristan.dev
> Exp. Dev   : [VALIDE]
> Profil    : [ACTIF]
> Angular   : [DETECTE]
> Ready to code.

> Routines hebdo : 
> - Apprendre & Veiller
> - Coder (Projets Perso)
> - Loading dev profile...\n");

printf("Welcome to my Web\\n");
printf("HTML / CSS.... [OK]\\n");
printf("JS / TS....... [OK]\\n");
printf("Angular....... [OK]\\n");
printf("Vue.js........ [OK]\\n");
printf("Java/Spring... [OK]\\n");
printf("Android....... [OK]\\n");
printf("C / C++ / Py.. [OK]\\n");
printf("BDD_SQL....... [OK]\\n");
printf("Python........ [OK]\\n");

printf("Connexion OK...\\n");

while (challenge) {
  learn();
  build();
  repeat();
}
`;

  // ========================================
  // CONTENUS DES COMPOSANTS PERSONAL-INFO
  // ========================================
  experienceContent: string = EXPERIENCE_CONTENT;

  formationContent: string = FORMATION_CONTENT;

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

      // Déplacement (index 6) : onMapToggle gère son propre son et l'état du menu
      if (event.index === 6) {
        this.onMapToggle();
        return;
      }

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
      // Forcer la mise à jour pour OnPush
      this.menuStates = [...this.menuStates];
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
    this.avatarClickedState = !this.avatarClickedState; // Toggle pour déclencher la détection
    
    // Jouer le son d'ouverture quand l'info-bulle s'affiche
    if (this.avatarClickedState) {
      this.audioEventsService.playOpenSound();
    } else {
      this.audioEventsService.playCloseSound();
    }
  }

  /**
   * Bascule l'affichage de la modale de carte
   */
  onMapToggle(): void {
    this.showMapModal = !this.showMapModal;
    this.menuStates[6] = this.showMapModal;
    this.menuStates = [...this.menuStates]; // Créer une nouvelle référence pour ChangeDetection
    this.audioEventsService.playToggleSound(this.showMapModal);
    this.cdr.markForCheck();
  }

  /**
   * Ferme la modale de carte
   */
  onMapClose(): void {
    this.showMapModal = false;
    this.menuStates[6] = false;
    this.menuStates = [...this.menuStates]; // Créer une nouvelle référence pour ChangeDetection
    this.audioEventsService.playCloseSound();
    this.cdr.markForCheck();
  }
}

