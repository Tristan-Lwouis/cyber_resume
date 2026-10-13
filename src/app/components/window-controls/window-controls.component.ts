import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Boutons de contrôle d'une fenêtre (agrandir / réduire + fermer).
 * Dans les fenêtres, ils se posent sur la "baie" noire dessinée dans le SVG du cadre
 * (variables CSS --bay-left / --bay-top / --bay-width / --bay-height, en cqw).
 * Avec [onLight] (vue plein écran, sans barre noire), les boutons passent en noir sur fond jaune.
 */
@Component({
  selector: 'app-window-controls',
  templateUrl: './window-controls.component.html',
  styleUrl: './window-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.on-light]': 'onLight' }
})
export class WindowControlsComponent {
  /** true dans la vue plein écran : le premier bouton sert alors à réduire */
  @Input() expanded = false;
  /** Boutons noirs, posés directement sur un fond jaune (pas de baie noire) */
  @Input() onLight = false;
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
