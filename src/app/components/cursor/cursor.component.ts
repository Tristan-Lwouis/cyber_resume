import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';

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

  private mouseMoveListener!: (e: MouseEvent) => void;
  private mouseDownListener!: () => void;
  private mouseUpListener!: () => void;

  constructor(private ngZone: NgZone) {}

  // Event listeners enlevés du décorateur pour les attacher manuellement en dehors de la zone Angular

  private isClickableElement(element: HTMLElement): boolean {
    if (!element || !element.closest) return false;

    // Utiliser API native du navigateur (extrêmement performant) au lieu de boucler manuellement
    const clickableSelector = 'a, button, input, textarea, select, label, summary, [role="button"], [tabindex], [onclick], .clickable, .menuItem, .contact-info, #contact, #linkedin';

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

  ngOnInit(): void {
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
            this.cursorRoot.nativeElement.classList.add('ready');
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
    document.removeEventListener('mousemove', this.mouseMoveListener);
    document.removeEventListener('mousedown', this.mouseDownListener);
    document.removeEventListener('mouseup', this.mouseUpListener);
  }
}
