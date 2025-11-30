import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarAnimationService implements OnDestroy {
  private animationRequestsSubject = new Subject<string>();

  // Observable public exposant les demandes d'animation
  animationRequests$ = this.animationRequestsSubject.asObservable();

  /**
   * Déclenche une demande d'animation à destination de l'avatar.
   */
  requestAnimation(animationName: string): void {
    this.animationRequestsSubject.next(animationName);
  }

  /**
   * Nettoie automatiquement les abonnés lors de la destruction du service.
   */
  ngOnDestroy(): void {
    this.animationRequestsSubject.complete();
  }
}


