import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WindowControlsComponent } from '../window-controls/window-controls.component';
import { CommonModule } from '@angular/common'; // OBLIGATOIRE pour ngStyle
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop'; //Drag and Drop
import { ViewportLineDirective } from '../../directives/viewport-line.directive';
import { WindowManagerService } from '../../services/window-manager.service';
import { AudioEventsService } from '../../services/audio-events.service';
import { Subscription } from 'rxjs';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import { Loisir, LOISIRS_DATA, Skill, SKILLS_DATA } from '../../data/loisirs-skills.data';

@Component({
  selector: 'app-loisir-skills',
  //standalone: true, // ?? A quoi ca sert ?
  imports: [CommonModule, DragDropModule, ViewportLineDirective, WindowControlsComponent],
  templateUrl: './loisir-skills.component.html',
  styleUrl: './loisir-skills.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoisirSkillsComponent implements OnInit, OnDestroy {
    @Input() title: string = '';
    @Input() titleClass: string = '';
    @Input() skillsZIndex: number = 1;
    @Input() loisirsZIndex: number = 2;
    /**
     * Pourcentage de la largeur de l'écran pour calculer la distance du point intermédiaire de la ligne.
     * Cette valeur détermine à quelle distance du composant le point intermédiaire sera placé.
     * Par défaut : 12% de la largeur de l'écran.
     * Exemple : distancePercentage = 15 signifie que le point intermédiaire sera à 15% de window.innerWidth du composant.
     */
    @Input() distancePercentage: number = 12;
    
    // ID unique pour la directive viewport-line
    componentId: string = 'loisir-skills';
    
    @Output() tabToggle = new EventEmitter<{tab: 'skills' | 'loisirs', isActive: boolean}>();
    @Output() closeComponent = new EventEmitter<void>();
  // Demande d'ouverture en plein écran
  @Output() expand = new EventEmitter<void>();

    @ViewChild(ViewportLineDirective) viewportLineDirective!: ViewportLineDirective;

    // Propriétés pour la gestion des fenêtres
    private subscription: Subscription = new Subscription();
    public windowZIndex: number = 1000;

    skillsData: Skill[] = SKILLS_DATA;
    loisirsData: Loisir[] = LOISIRS_DATA;

    constructor(
      private elementRef: ElementRef,
      private windowManagerService: WindowManagerService,
      private avatarAnimationService: AvatarAnimationService,
      private audioEventsService: AudioEventsService,
      private cdr: ChangeDetectorRef
    ) {}

  /**
   * Initialise le composant et enregistre la fenêtre dans le gestionnaire
   */
  ngOnInit(): void {
    // Enregistrer la fenêtre dans le gestionnaire
    this.windowZIndex = this.windowManagerService.registerWindow(this.componentId);
    
    // S'abonner aux changements de fenêtre active
    this.subscription.add(
      this.windowManagerService.getActiveWindowObservable().subscribe(activeWindowId => {
        if (activeWindowId === this.componentId) {
          this.windowZIndex = this.windowManagerService.getWindowZIndex(this.componentId);
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
    this.windowManagerService.unregisterWindow(this.componentId);
  }

  showFirstTab() {
    // Émettre l'événement pour activer/désactiver l'onglet Loisirs
    this.tabToggle.emit({tab: 'loisirs', isActive: true});
  }

  showSecondTab() {
    // Émettre l'événement pour activer/désactiver l'onglet Skills
    this.tabToggle.emit({tab: 'skills', isActive: true});
  }

  /**
   * Récupère la couleur de la ligne depuis la variable CSS --background-color
   */
  private getLineColor(): string {
    const computedStyle = getComputedStyle(this.elementRef.nativeElement);
    return computedStyle.getPropertyValue('--background-color') || 'black';
  }

  /**
   * Méthode appelée lors du déplacement du composant
   * Utilise la directive pour mettre à jour la ligne
   */
  onDragMoved(event: CdkDragMove): void {
    if (this.viewportLineDirective) {
      // Mettre à jour la couleur de la ligne avec la valeur CSS actuelle
      this.viewportLineDirective.setLineColor(this.getLineColor());
      this.viewportLineDirective.onDragMoved(event);
    }
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur la fenêtre
   * Fait passer la fenêtre au premier plan
   */
  onWindowClick(): void {
    this.windowZIndex = this.windowManagerService.bringToFront(this.componentId);
    this.cdr.markForCheck();
  }

  /**
   * Déclenche l'animation souhaitée sur l'avatar depuis cette fenêtre.
   */
  onClickAnimation(...animationNames: string[]): void {
    this.audioEventsService.playOpenSound();
    this.avatarAnimationService.requestAnimation(...animationNames);
  }

  onClickAnimationArray(animationNames: string[]): void {
    this.audioEventsService.playOpenSound();
    this.avatarAnimationService.requestAnimation(...animationNames);
  }
}
