import { Component, Input, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
 
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop'; //Drag and Drop
import { ViewportLineDirective } from '../../directives/viewport-line.directive';
import { WindowManagerService } from '../../services/window-manager.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-personal-info',
  imports: [DragDropModule, ViewportLineDirective],
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
  @Input() tabTitle: string = 'EXPER1ENCE';
  @Input() componentId: string = 'experience'; // ID unique du composant
  /**
   * Pourcentage de la largeur de l'écran pour calculer la distance du point intermédiaire de la ligne.
   * Cette valeur détermine à quelle distance du composant le point intermédiaire sera placé.
   * Par défaut : 12% de la largeur de l'écran.
   * Exemple : distancePercentage = 15 signifie que le point intermédiaire sera à 15% de window.innerWidth du composant.
   */
  @Input() distancePercentage: number = 12;
  @Input() content: string = '';

  @ViewChild(ViewportLineDirective) viewportLineDirective!: ViewportLineDirective;
  
  // EventEmitter pour communiquer avec le composant parent
  @Output() closeComponent = new EventEmitter<void>();
  // Demande d'ouverture en plein écran
  @Output() expand = new EventEmitter<void>();

  // Propriétés pour la gestion des fenêtres
  private subscription: Subscription = new Subscription();
  public windowZIndex: number = 1000;

  constructor(
    private elementRef: ElementRef,
    private windowManagerService: WindowManagerService,
    private cdr: ChangeDetectorRef
  ) {}

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
  onExpandClick(event: Event): void {
    event.stopPropagation();
    this.expand.emit();
  }

  onWindowClick(): void {
    this.windowZIndex = this.windowManagerService.bringToFront(this.componentId);
    this.cdr.markForCheck();
  }
}
