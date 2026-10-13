import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Boutons de contrôle d'une fenêtre (agrandir / réduire + fermer).
 * Dans les fenêtres, ils se posent sur la "baie" noire dessinée dans le SVG du cadre
 * (variables CSS --bay-left / --bay-top / --bay-width / --bay-height, en cqw).
 * Avec [framed], le composant dessine lui-même sa baie (vue plein écran, sans cadre SVG).
 */
@Component({
  selector: 'app-window-controls',
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.framed]': 'framed' }
})
export class WindowControlsComponent {
  /** true dans la vue plein écran : le premier bouton sert alors à réduire */
  @Input() expanded = false;
  /** Dessine la baie noire en CSS (quand il n'y a pas de cadre SVG pour la porter) */
  @Input() framed = false;
  @Output() toggleSize = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onToggleSize(event: Event): void {
    event.stopPropagation(); // Ne pas déclencher le "bring to front" / drag de la fenêtre
    this.toggleSize.emit();
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.close.emit();
  }
}
