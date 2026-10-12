import { DestroyRef, Injectable, WritableSignal, effect, inject, signal } from '@angular/core';

/**
 * Mise en page "bureau virtuel" (fenêtres déplaçables) uniquement quand l'écran est assez grand.
 * En dessous (téléphones, tablettes en portrait, petits écrans en paysage), on bascule sur la mise en page mobile.
 */
const MOBILE_LAYOUT_QUERY = '(max-width: 1099px), (max-height: 599px)';

/** Curseur personnalisé seulement avec une vraie souris (pas sur écran tactile). */
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  readonly isMobile = signal(false);
  readonly hasFinePointer = signal(true);

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.bind(MOBILE_LAYOUT_QUERY, this.isMobile, destroyRef);
    this.bind(FINE_POINTER_QUERY, this.hasFinePointer, destroyRef);

    // Le navigateur restaurerait au rechargement un scroll qui n'a pas de sens en bureau virtuel
    history.scrollRestoration = 'manual';

    // Classes globales sur <html> pour les styles qui dépendent du mode (styles.scss)
    const root = document.documentElement;
    effect(() => {
      const mobile = this.isMobile();
      root.classList.toggle('layout-mobile', mobile);
      // Le bureau virtuel ne défile pas : on annule un éventuel scroll hérité de la vue mobile
      // (rotation d'une tablette, restauration du scroll au rechargement...)
      if (!mobile) {
        window.scrollTo(0, 0);
      }
    });
    effect(() => root.classList.toggle('custom-cursor', this.hasFinePointer()));
  }

  private bind(query: string, target: WritableSignal<boolean>, destroyRef: DestroyRef): void {
    const media = window.matchMedia(query);
    target.set(media.matches);
    const listener = (event: MediaQueryListEvent) => target.set(event.matches);
    media.addEventListener('change', listener);
    destroyRef.onDestroy(() => media.removeEventListener('change', listener));
  }
}
