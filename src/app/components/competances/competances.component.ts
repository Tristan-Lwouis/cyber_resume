import { Component, ViewChild, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { nextStripesId } from '../window-controls/stripes';
import { WindowControlsComponent } from '../window-controls/window-controls.component';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop'; //Drag and Drop
import { AudioEventsService } from '../../services/audio-events.service';
import { ViewportLineDirective } from '../../directives/viewport-line.directive';
import { WindowManagerService } from '../../services/window-manager.service';
import { Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { Language, COMPETENCES_DATA, SECONDARY_COMPETENCES_DATA } from '../../data/competences.data';

@Component({
  selector: 'app-competances',
  imports: [CommonModule, DragDropModule, ViewportLineDirective, WindowControlsComponent],
  templateUrl: './competances.component.html',
  styleUrl: './competances.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetancesComponent implements OnInit, OnDestroy {
  // Identifiant unique du motif rayé de la barre de déplacement
  readonly stripesId = nextStripesId();

  /**
   * Pourcentage de la largeur de l'écran pour calculer la distance du point intermédiaire de la ligne.
   * Cette valeur détermine à quelle distance du composant le point intermédiaire sera placé.
   * Par défaut : 12% de la largeur de l'écran.
   * Exemple : distancePercentage = 15 signifie que le point intermédiaire sera à 15% de window.innerWidth du composant.
   */
  @Input() distancePercentage: number = 12;

  // Z-indexes pour les SVGs
  devZIndex: number = 2;
  toolsZIndex: number = 1;

  // Onglet actif
  activeTab: 'dev' | 'tools' = 'dev';

  // Getter pour récupérer les langages en fonction de l'onglet actif
  get currentLanguages(): Language[] {
    return this.activeTab === 'dev' ? COMPETENCES_DATA : SECONDARY_COMPETENCES_DATA;
  }

  // Objet pour stocker la rotation de chaque flèche
  arrowRotation: { [key: string]: number } = {};
  
  // Objet pour stocker l'état de chaque langage
  open: { [key: string]: boolean } = {};
  
  // Propriété pour la hauteur du path SVG
  pathHeight: number = 370;

  @ViewChild(ViewportLineDirective) viewportLineDirective!: ViewportLineDirective;
  
  // EventEmitter pour communiquer avec le composant parent
  @Output() closeComponent = new EventEmitter<void>();
  // Demande d'ouverture en plein écran
  @Output() expand = new EventEmitter<void>();

  // Propriétés pour la gestion des fenêtres
  private readonly windowId = 'competances-window';
  private subscription: Subscription = new Subscription();
  public windowZIndex: number = 1000;

  constructor(
    private audioEventsService: AudioEventsService,
    private windowManagerService: WindowManagerService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialiser les états pour chaque langage
    this.initLanguageStates();
  }

  // Initialise l'état open/rotation pour tous les langages possibles
  initLanguageStates() {
    [...COMPETENCES_DATA, ...SECONDARY_COMPETENCES_DATA].forEach(lang => {
      if (this.arrowRotation[lang.id] === undefined) {
        this.arrowRotation[lang.id] = 0;
        this.open[lang.id] = false;
      }
    });
  }

  // Change l'onglet actif
  setTab(tab: 'dev' | 'tools') {
    if (this.activeTab !== tab) {
      this.activeTab = tab;

      this.audioEventsService.playOpenSound();
      
      if (tab === 'dev') {
        this.devZIndex = 2;
        this.toolsZIndex = 1;
      } else {
        this.devZIndex = 1;
        this.toolsZIndex = 2;
      }

      // Optionnel : fermer toutes les listes
      Object.keys(this.open).forEach(key => {
        this.open[key] = false;
        this.arrowRotation[key] = 0;
      });
      
      this.updatePathHeight();
      this.cdr.markForCheck();
    }
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
          this.cdr.markForCheck();
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
    } else {
      this.open[language] = true;
      // Jouer le son d'ouverture
      this.audioEventsService.playOpenSound();
    }
    
    // Calculer la hauteur en fonction de l'état de toutes les flèches
    this.updatePathHeight();
  }

  // Méthode pour mettre à jour la hauteur du path
  updatePathHeight() {
    // Si au moins une flèche est ouverte, garder la hauteur à 600 sinon 330
    const hasAnyOpen = Object.values(this.open).some(isOpen => isOpen);
    this.pathHeight = hasAnyOpen ? 760 : 370;
  }

  // <svg width="599" height="692" viewBox="0 0 599 692" fill="none" xmlns="http://www.w3.org/2000/svg">
  //   <path d="M2.5 689.5V2.5H228.5L264 44.5H596.5V689.5H2.5Z" fill="#EDE52B" stroke="black" stroke-width="5"/>
  // </svg>

  // Méthode pour générer le path SVG avec la hauteur dynamique
  getDevPathD(): string {
    return `M2.5 ${this.pathHeight}V2.5H228.5L264 44.5H596.5V${this.pathHeight}H2.5Z`;
  }

  getToolsPathD(): string {
    return `M596.5 ${this.pathHeight}H2.5V44.5002H211.5L249 2.50015L448.5 2.5L506 44.5L596.5 44.5002V${this.pathHeight}Z`;
  }

  // ViewBox dynamique qui s'adapte à la hauteur ! (avec 10px de marge pour le tracé)
  getViewBox(): string {
    return `0 0 599 ${this.pathHeight + 10}`;
  }

  // Méthode pour calculer la largeur de la barre de progression
  getProgressBarWidth(language: Language): string {
    return `${language.progressWidth}%`;
  }

  // Méthode pour calculer la hauteur du foreignObject des langages
  getLanguagesContainerHeight(): number {
    // Vu que la ViewBox est dynamique, on peut repasser en valeur absolue 
    // qui s'adapte parfaitement à l'intérieur du SVG. 
    // Le haut du foreignObject est à y="60", donc on soustrait une marge (ex: 80 ou 90).
    return this.pathHeight - 70;
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
    this.cdr.markForCheck();
  }
}
