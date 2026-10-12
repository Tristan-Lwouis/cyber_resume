import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { EXPERIENCES } from '../../data/experiences.data';
import { FORMATIONS } from '../../data/formations.data';
import { COMPETENCES_DATA, SECONDARY_COMPETENCES_DATA } from '../../data/competences.data';
import { LOISIRS_DATA, Loisir, SKILLS_DATA } from '../../data/loisirs-skills.data';
import { TimelineEntry } from '../../data/timeline.model';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import { AudioEventsService } from '../../services/audio-events.service';

export type FullscreenView = 'experience' | 'formation' | 'competences' | 'skills';

const TITLES: Record<FullscreenView, string> = {
  experience: 'EXPER1ENCE',
  formation: 'F0RMATIONS',
  competences: 'C0MP3TENCES',
  skills: 'SK1LLS & L0IS1RS',
};

/**
 * Vue plein écran d'une fenêtre du bureau virtuel, pour lire confortablement son contenu :
 * timeline pour le parcours (expériences, formations), grilles de cards pour le reste.
 */
@Component({
  selector: 'app-fullscreen-view',
  imports: [NgTemplateOutlet],
  templateUrl: './fullscreen-view.component.html',
  styleUrl: './fullscreen-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenViewComponent implements AfterViewInit {
  @Input({ required: true }) view!: FullscreenView;
  @Output() close = new EventEmitter<void>();

  @ViewChild('closeButton', { static: true }) closeButton!: ElementRef<HTMLButtonElement>;

  private readonly avatarAnimationService = inject(AvatarAnimationService);
  private readonly audioEventsService = inject(AudioEventsService);

  readonly experiences = EXPERIENCES;
  readonly formations = FORMATIONS;
  readonly devCompetences = COMPETENCES_DATA;
  readonly toolCompetences = SECONDARY_COMPETENCES_DATA;
  readonly skills = SKILLS_DATA;
  readonly loisirs = LOISIRS_DATA;

  readonly competenceTab = signal<'dev' | 'tools'>('dev');

  get title(): string {
    return TITLES[this.view];
  }

  // La police code-barres (Code 39) ne connaît que lettres, chiffres et espaces
  get barcodeText(): string {
    return this.title.replace(/[^A-Z0-9 ]/g, '');
  }

  ngAfterViewInit(): void {
    // Accessibilité : le focus part dans la fenêtre ouverte
    this.closeButton.nativeElement.focus({ preventScroll: true });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  /**
   * Répartit le parcours en deux colonnes (entrées paires à gauche, impaires à droite)
   * pour la timeline en quinconce : l'ordre de lecture reste chronologique en zigzag.
   */
  splitColumns(entries: TimelineEntry[]): TimelineEntry[][] {
    return [
      entries.filter((_, index) => index % 2 === 0),
      entries.filter((_, index) => index % 2 === 1),
    ];
  }

  setCompetenceTab(tab: 'dev' | 'tools'): void {
    if (this.competenceTab() !== tab) {
      this.competenceTab.set(tab);
      this.audioEventsService.playOpenSound();
    }
  }

  /**
   * Un loisir referme la vue pour laisser voir l'avatar jouer l'animation correspondante.
   */
  playLoisir(loisir: Loisir): void {
    this.avatarAnimationService.requestAnimation(...loisir.animations);
    this.close.emit();
  }
}
