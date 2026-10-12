import { Component, Output, EventEmitter, ChangeDetectionStrategy, HostListener } from '@angular/core';
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

  @HostListener('document:keydown.escape')
  onClose(): void {
    this.close.emit();
  }
}
