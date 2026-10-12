import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CyberMapComponent } from '../cyber-map/cyber-map.component';

@Component({
  selector: 'app-map-modal',
  standalone: true,
  imports: [CyberMapComponent],
  templateUrl: './map-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './map-modal.component.scss'
})
export class MapModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
