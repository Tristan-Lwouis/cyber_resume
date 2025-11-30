import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarAnimationService implements OnDestroy {

  // Maintenant le service peut envoyer une SEQUENCE entière
  private animationRequestsSubject = new Subject<string[]>();

  // Observable public exposant les demandes d’animation (sous forme de liste)
  animationRequests$ = this.animationRequestsSubject.asObservable();

  /**
   * Demande la lecture d'une ou plusieurs animations.
   * 
   * Exemples :
   *   requestAnimation('idle')
   *   requestAnimation('idle-to-sit', 'sit-to-type', 'type')
   */
  requestAnimation(...animationNames: string[]): void {
    if (!animationNames || animationNames.length === 0) {
      return;
    }

    this.animationRequestsSubject.next(animationNames);
  }

  /**
   * Nettoyage du service
   */
  ngOnDestroy(): void {
    this.animationRequestsSubject.complete();
  }
}
