import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service centralisant la progression du chargement lourd (modèle 3D, assets...).
 * Il expose un flux de pourcentage que les composants d'UI peuvent consommer pour
 * refléter l'état réel du chargement.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingProgressService {
  private readonly progressSubject = new BehaviorSubject<number>(0);
  private isDone = false;

  /**
   * Retourne un flux observable du pourcentage courant.
   */
  get progress$(): Observable<number> {
    return this.progressSubject.asObservable();
  }

  /**
   * Réinitialise manuellement la progression à 0 et rouvre un cycle de suivi.
   */
  reset(): void {
    this.isDone = false;
    this.progressSubject.next(0);
  }

  /**
   * Met à jour la progression en pourcentage tout en empêchant les retours arrière
   * ou les valeurs supérieures à 99 tant que le chargement n'est pas finalisé.
   */
  updateProgress(percent: number): void {
    if (this.isDone) {
      return;
    }
    const clamped = Math.min(99, Math.max(this.progressSubject.value, percent));
    this.progressSubject.next(clamped);
  }

  /**
   * Marque définitivement la fin du chargement et pousse 100% aux abonnés.
   */
  markCompleted(): void {
    if (this.isDone) {
      return;
    }
    this.isDone = true;
    this.progressSubject.next(100);
  }

  /**
   * Indique si le cycle de chargement est terminé ; utile pour éviter les doublons.
   */
  hasCompleted(): boolean {
    return this.isDone;
  }
}


