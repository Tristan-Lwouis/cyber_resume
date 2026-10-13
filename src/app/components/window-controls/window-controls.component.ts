import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Boutons de contrôle d'une fenêtre (agrandir / réduire + fermer), encastrés dans la
 * "baie" noire dessinée au bout de la barre d'onglets de chaque cadre SVG.
 * Le composant hôte positionne la baie via les variables CSS --bay-left / --bay-top /
 * --bay-width / --bay-height (en cqw, pour suivre l'échelle du SVG).
 */
@Component({
  selector: 'app-window-controls',
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WindowControlsComponent {
  /** true dans la vue plein écran : le premier bouton sert alors à réduire */
  @Input() expanded = false;
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
