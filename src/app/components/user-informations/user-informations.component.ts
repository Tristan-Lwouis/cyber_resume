import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AvatarAnimationService } from '../../services/avatar-animation.service';
import { PROFILE_CONTACT, computeLevel } from '../../data/profile.data';

@Component({
  selector: 'app-user-informations',
  imports: [],
  templateUrl: './user-informations.component.html',
  styleUrl: './user-informations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationsComponent implements OnInit, OnDestroy {
  @Output() openMap = new EventEmitter<void>();
  readonly phoneNumber = PROFILE_CONTACT.phone;
  readonly email = PROFILE_CONTACT.email;
  readonly links = PROFILE_CONTACT.links;
  // Niveau = âge, recalculé à partir de la date de naissance
  readonly level = computeLevel();
  private colorChangeObserver: MutationObserver | null = null;

  constructor(private avatarAnimationService: AvatarAnimationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setupColorChangeListener();
  }

  ngOnDestroy() {
    if (this.colorChangeObserver) {
      this.colorChangeObserver.disconnect();
    }
  }

  private setupColorChangeListener() {
    // Observer les changements de style sur l'élément document.documentElement
    this.colorChangeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          // Force la détection de changement pour Angular
          this.onColorChange();
        }
      });
    });

    // Observer les changements de style sur l'élément racine
    this.colorChangeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
  }

  private onColorChange() {
    // Méthode appelée quand les couleurs changent
    this.cdr.markForCheck();
  }

  // Méthode pour obtenir la couleur primaire actuelle
  getPrimaryColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  }
  
  // Méthode pour obtenir la couleur de fond actuelle
  getBackgroundColor(): string {
    return getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();
  }

  /**
   * Déclenche l'animation souhaitée sur l'avatar
   */
  playAvatarAnimation(animationName: string): void {
    this.avatarAnimationService.requestAnimation(animationName);
  }

  /**
   * Émet l'événement pour ouvrir la carte
   */
  triggerMap(): void {
    this.openMap.emit();
  }

}

