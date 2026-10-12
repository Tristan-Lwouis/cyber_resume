import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

@Component({
  selector: 'app-user-informations',
  imports: [],
  templateUrl: './user-informations.component.html',
  styleUrl: './user-informations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationsComponent implements OnInit, OnDestroy {
  @Output() openMap = new EventEmitter<void>();
  phoneNumber: string = '';
  email: string = '';
  // Niveau = âge, recalculé à partir de la date de naissance (01/10/1999)
  readonly level: number = this.computeAge(new Date(1999, 9, 1));
  private colorChangeObserver: MutationObserver | null = null;

  constructor(private avatarAnimationService: AvatarAnimationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.decodeContactInfo();
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

  private decodeContactInfo() {
    // Méthode d'obfuscation
    const key = 'Cyber2077';
    const encodedPhone = this.rot13('06.81.12.60.81');
    const encodedEmail = this.rot13('regniertristan@gmail.com');
    
    this.phoneNumber = this.rot13(encodedPhone);
    this.email = this.rot13(encodedEmail);
  }

  // Méthode pour décoder les informations de contact
  private rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, function(char) {
      const charCode = char.charCodeAt(0);
      const shifted = charCode + 13;
      const max = char <= 'Z' ? 90 : 122;
      return String.fromCharCode(shifted <= max ? shifted : shifted - 26);
    });
  }

  private computeAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
    if (birthdayNotReached) {
      age--;
    }
    return age;
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

