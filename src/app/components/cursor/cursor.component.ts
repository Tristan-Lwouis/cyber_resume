import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';

import { AudioEventsService } from '../../services/audio-events.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cursor',
  standalone: true,
  imports: [],
  templateUrl: './cursor.component.html',
  styleUrls: ['./cursor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CursorComponent implements OnInit, OnDestroy {
  @ViewChild('cursorRoot', { static: true }) cursorRoot!: ElementRef<HTMLDivElement>;
  @ViewChild('cross', { static: true }) cross!: ElementRef<HTMLDivElement>;
  @ViewChild('coords', { static: true }) coords!: ElementRef<HTMLSpanElement>;
  @ViewChild('pointerCircle', { static: true }) pointerCircle!: ElementRef<HTMLDivElement>;

  // Propriétés audio
  private openSound: HTMLAudioElement;
  private closeSound: HTMLAudioElement;
  private audioSubscription?: Subscription;

  private mouseMoveListener!: (e: MouseEvent) => void;
  private mouseDownListener!: () => void;
  private mouseUpListener!: () => void;

  constructor(private audioEventsService: AudioEventsService, private ngZone: NgZone) {
    // Initialiser les éléments audio
    this.openSound = new Audio('assets/media/soundFX/open.mp3');
    this.closeSound = new Audio('assets/media/soundFX/close.mp3');
    
    // Précharger les sons
    this.openSound.load();
    this.closeSound.load();
  }

  // Event listeners enlevés du décorateur pour les attacher manuellement en dehors de la zone Angular

  private isClickableElement(element: HTMLElement): boolean {
    if (!element || !element.closest) return false;
    
    // Utiliser API native du navigateur (extrêmement performant) au lieu de boucler manuellement
    const clickableSelector = 'a, button, input, textarea, select, label, [role="button"], [tabindex], [onclick], .clickable, .menuItem, .contact-info, #contact, #linkedin';
    
    if (element.closest(clickableSelector)) {
      return true;
    }
    
    // Vérification de repli (uniquement pour les styles inline, sans utiliser getComputedStyle qui détruit les perfs)
    let curr: HTMLElement | null = element;
    while (curr) {
      if (curr.style && (curr.style.cursor === 'pointer' || curr.style.cursor === 'hand')) {
        return true;
      }
      curr = curr.parentElement;
    }
    
    return false;
  }

  /**
   * Joue le son d'ouverture
   */
  public playOpenSound(): void {
    this.openSound.currentTime = 0; // Remettre à zéro pour pouvoir rejouer
    this.openSound.play().catch(error => {
      console.warn('Erreur lors de la lecture du son d\'ouverture:', error);
    });
  }

  /**
   * Joue le son de fermeture
   */
  public playCloseSound(): void {
    this.closeSound.currentTime = 0; // Remettre à zéro pour pouvoir rejouer
    this.closeSound.play().catch(error => {
      console.warn('Erreur lors de la lecture du son de fermeture:', error);
    });
  }

  /**
   * Joue un son selon l'état (ouvert/fermé)
   */
  public playToggleSound(isOpening: boolean): void {
    if (isOpening) {
      this.playOpenSound();
    } else {
      this.playCloseSound();
    }
  }

  ngOnInit(): void {
    // S'abonner aux événements audio
    this.audioSubscription = this.audioEventsService.audioEvents$.subscribe(event => {
      if (event === 'open') {
        this.playOpenSound();
      } else if (event === 'close') {
        this.playCloseSound();
      }
    });

    let rAFScheduled = false;
    let latestEvent: MouseEvent | null = null;

    this.mouseMoveListener = (event: MouseEvent) => {
      latestEvent = event;
      if (!rAFScheduled) {
        rAFScheduled = true;
        requestAnimationFrame(() => {
          if (!latestEvent) return;
          const e = latestEvent;
          
          // Met à jour la position directement sur le DOM
          if (this.cursorRoot) {
            this.cursorRoot.nativeElement.style.left = e.clientX + 'px';
            this.cursorRoot.nativeElement.style.top = e.clientY + 'px';
          }
          if (this.coords) {
            this.coords.nativeElement.textContent = `${e.clientX}, ${e.clientY}`;
          }
          
          const target = e.target as HTMLElement;
          const isPointer = this.isClickableElement(target);
          if (this.pointerCircle) {
            if (isPointer) {
              this.pointerCircle.nativeElement.classList.add('visible');
            } else {
              this.pointerCircle.nativeElement.classList.remove('visible');
            }
          }
          rAFScheduled = false;
        });
      }
    };

    this.mouseDownListener = () => {
      if (this.cross) {
        this.cross.nativeElement.classList.add('clicked');
      }
    };

    this.mouseUpListener = () => {
      if (this.cross) {
        this.cross.nativeElement.classList.remove('clicked');
      }
    };

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.mouseMoveListener);
      document.addEventListener('mousedown', this.mouseDownListener);
      document.addEventListener('mouseup', this.mouseUpListener);
    });
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites mémoire
    this.audioSubscription?.unsubscribe();
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mousedown', this.mouseDownListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
  }
}
