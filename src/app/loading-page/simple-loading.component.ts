import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { NgIf, DecimalPipe } from '@angular/common';

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

  private timerId: any = null;
  private readonly STEP = 1.5;       // incrément par tick
  private readonly TICK_MS = 40;     // fréquence de mise à jour
  private readonly DOOR_ANIM_MS = 900;

  /** Initialise la progression avec un intervalle simple jusqu'à 100%. */
  ngOnInit(): void {
    // Démarre un intervalle qui incrémente la progression régulièrement.
    this.timerId = setInterval(() => {
      if (this.progress < 100) {
        this.progress = Math.min(100, this.progress + this.STEP);
      }
      if (this.progress >= 100) {
        this.stopTimer();
        this.onComplete();
      }
    }, this.TICK_MS);
  }

  /** Nettoie le timer pour éviter les fuites mémoire. */
  ngOnDestroy(): void {
    this.stopTimer();
  }

  /** Arrête l'intervalle si actif. */
  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /** Déclenche l'ouverture des portes puis émet l'événement de fermeture. */
  private onComplete(): void {
    this.opening = true;
    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, this.DOOR_ANIM_MS);
  }
}


