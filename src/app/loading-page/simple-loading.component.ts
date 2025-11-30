import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgIf, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingProgressService } from '../services/loading-progress.service';

@Component({
  selector: 'app-simple-loading',
  standalone: true,
  imports: [NgIf, DecimalPipe],
  templateUrl: './simple-loading.component.html',
  styleUrl: './simple-loading.component.scss'
})
export class SimpleLoadingComponent implements OnInit, OnDestroy {

  @Output() closed = new EventEmitter<void>();

  /** Pourcentage de progression [0..100]. Démarre à 0. */
  progress = 0;
  /** Progression normalisée [0..1] pour la variable CSS --p. */
  get progress01(): number { return Math.min(1, Math.max(0, this.progress / 100)); }

  /** Flag d'animation d'ouverture des portes. */
  opening = false;
  /** Flag de visibilité de l'overlay. */
  visible = true;

  private readonly DOOR_ANIM_MS = 900;
  private progressSub?: Subscription;
  private completedOnce = false;

  /** Injecte le service de progression partagé pour suivre le chargement réel. */
  constructor(private loadingProgress: LoadingProgressService) {}

  /** S'abonne au service de chargement pour refléter la progression réelle du modèle 3D. */
  ngOnInit(): void {
    this.progressSub = this.loadingProgress.progress$.subscribe(value => {
      this.progress = value;
      if (value >= 100 && !this.completedOnce) {
        this.completedOnce = true;
        this.onComplete();
      }
    });
  }

  /** Nettoie l'abonnement pour éviter toute fuite mémoire. */
  ngOnDestroy(): void {
    this.progressSub?.unsubscribe();
  }

  /** Déclenche l'ouverture des portes puis émet l'événement de fermeture. */
  private onComplete(): void {
    // Pour faire attendre le programme 1 seconde (de façon asynchrone, sans bloquer le thread principal) :
    // On peut utiliser setTimeout (comme ci-dessous), ou bien une fonction asynchrone avec await/Promise :
    // Exemple (ici pour information, ce n'est pas utile d'en ajouter un nouveau):
    this.opening = true;
    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, this.DOOR_ANIM_MS);
  }
}


