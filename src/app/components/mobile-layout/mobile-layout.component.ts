import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  computed,
  inject,
  signal
} from '@angular/core';

import { AvatarComponent } from '../avatar/avatar.component';
import { RollingScriptComponent } from '../rolling-script/rolling-script.component';
import { CyberMapComponent } from '../cyber-map/cyber-map.component';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import { AudioEventsService } from '../../services/audio-events.service';
import { EXPERIENCE_CONTENT } from '../../data/experiences.data';
import { FORMATION_CONTENT } from '../../data/formations.data';
import { COMPETENCES_DATA, SECONDARY_COMPETENCES_DATA } from '../../data/competences.data';
import { LOISIRS_DATA, SKILLS_DATA } from '../../data/loisirs-skills.data';
import { PORTFOLIO_ITEMS } from '../../data/portfolio.data';
import { PROFILE_CONTACT, PROFILE_PITCH, computeLevel } from '../../data/profile.data';

interface MobileSection {
  id: string;
  label: string;
}

/**
 * Mise en page mobile / tablette : une page qui défile, avec l'avatar 3D en tête
 * (ou fixé à gauche sur tablette) et toutes les sections du CV rendues en HTML lisible.
 * Les contenus viennent des mêmes fichiers de données que la version bureau.
 */
@Component({
  selector: 'app-mobile-layout',
  imports: [AvatarComponent, RollingScriptComponent, CyberMapComponent],
  templateUrl: './mobile-layout.component.html',
  styleUrl: './mobile-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileLayoutComponent implements AfterViewInit, OnDestroy {
  @Input() rollingCode = '';

  @ViewChild('nav', { static: true }) nav!: ElementRef<HTMLElement>;
  @ViewChildren('section') sectionRefs!: QueryList<ElementRef<HTMLElement>>;

  private readonly avatarAnimationService = inject(AvatarAnimationService);
  private readonly audioEventsService = inject(AudioEventsService);
  private sectionObserver?: IntersectionObserver;

  readonly sections: MobileSection[] = [
    { id: 'experience', label: 'EXPER1ENCE' },
    { id: 'formation', label: 'F0RMATIONS' },
    { id: 'competences', label: 'C0MP3TENCES' },
    { id: 'skills', label: 'SK1LLS' },
    { id: 'loisirs', label: 'L0IS1RS' },
    { id: 'portfolio', label: 'P0RTFOL10' },
    { id: 'deplacement', label: 'DÉPLAC3M3NT' },
  ];

  readonly pitch = PROFILE_PITCH;
  readonly contact = PROFILE_CONTACT;
  readonly level = computeLevel();
  readonly experienceContent = EXPERIENCE_CONTENT;
  readonly formationContent = FORMATION_CONTENT;
  readonly skills = SKILLS_DATA;
  readonly loisirs = LOISIRS_DATA;
  readonly portfolioItems = PORTFOLIO_ITEMS;

  readonly activeSection = signal('experience');
  readonly competenceTab = signal<'dev' | 'tools'>('dev');
  readonly currentCompetences = computed(() =>
    this.competenceTab() === 'dev' ? COMPETENCES_DATA : SECONDARY_COMPETENCES_DATA
  );

  ngAfterViewInit(): void {
    // Met en surbrillance l'onglet de la section au centre de l'écran
    this.sectionObserver = new IntersectionObserver(
      entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) {
          this.activeSection.set(visible.target.id);
          this.revealNavLink(visible.target.id);
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    this.sectionRefs.forEach(ref => this.sectionObserver!.observe(ref.nativeElement));
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  /**
   * Fait défiler horizontalement la barre de navigation pour garder l'onglet actif visible.
   */
  private revealNavLink(sectionId: string): void {
    const nav = this.nav.nativeElement;
    const link = nav.querySelector<HTMLElement>(`a[href="#${sectionId}"]`);
    if (link) {
      nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  }

  scrollTo(sectionId: string, event?: Event): void {
    event?.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setCompetenceTab(tab: 'dev' | 'tools'): void {
    if (this.competenceTab() !== tab) {
      this.competenceTab.set(tab);
      this.audioEventsService.playOpenSound();
    }
  }

  onAvatarClicked(): void {
    this.audioEventsService.playOpenSound();
    this.avatarAnimationService.requestAnimation('salute');
  }

}
