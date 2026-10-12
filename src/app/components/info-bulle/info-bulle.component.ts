import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PROFILE_PITCH } from '../../data/profile.data';


@Component({
  selector: 'app-info-bulle',
  imports: [],
  templateUrl: './info-bulle.component.html',
  styleUrl: './info-bulle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoBulleComponent implements OnInit, OnDestroy, OnChanges {
  @Input() avatarClicked: boolean = false;
  @Input() portfolioOpen: boolean = false; // Nouvelle propriété pour détecter si le portfolio est ouvert
  
  displayedText = '';
  fullText = PROFILE_PITCH;
  currentIndex = 0;
  isTyping = false;
  isVisible = true;
  isFadingOut = false;
  private typingInterval: any;
  private hideTimer: any;
  private fadeTimer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Ne démarrer le typing que si le portfolio n'est pas ouvert
    if (!this.portfolioOpen) {
      this.startTyping();
    }
  }

  ngOnDestroy() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Détecter les changements de la propriété avatarClicked
    if (changes['avatarClicked'] && !changes['avatarClicked'].firstChange) {
      this.resetAndStartTyping();
    }
    
    // Détecter les changements de la propriété portfolioOpen
    if (changes['portfolioOpen'] && !changes['portfolioOpen'].firstChange) {
      if (this.portfolioOpen) {
        // Si le portfolio s'ouvre, masquer immédiatement l'info-bulle
        this.hideInfoBulle();
      } else {
        // Si le portfolio se ferme, redémarrer l'info-bulle
        this.resetAndStartTyping();
      }
    }
  }

  startTyping() {
    // Ne pas démarrer si le portfolio est ouvert
    if (this.portfolioOpen) {
      return;
    }
    
    this.isTyping = true;
    this.currentIndex = 0;
    this.displayedText = '';
    this.isVisible = true;
    this.isFadingOut = false;
    
    this.typingInterval = setInterval(() => {
      if (this.currentIndex < this.fullText.length) {
        this.displayedText += this.fullText[this.currentIndex];
        this.currentIndex++;
        this.cdr.markForCheck();
      } else {
        this.isTyping = false;
        clearInterval(this.typingInterval);
        this.cdr.markForCheck();
        // Démarrer le timer pour faire disparaître le composant après 5 secondes
        this.hideTimer = setTimeout(() => {
          this.fadeOut();
        }, 5000); // temps de disparition de l'info bulle
      }
    }, 20); // Vitesse de frappe (20ms entre chaque caractère)
  }

  fadeOut() {
    this.isFadingOut = true;
    this.cdr.markForCheck();
    // Attendre que la transition CSS se termine avant de masquer complètement
    this.fadeTimer = setTimeout(() => {
      this.isVisible = false;
      this.cdr.markForCheck();
    }, 300); // Durée de la transition CSS
  }

  resetAndStartTyping() {
    // Ne pas redémarrer si le portfolio est ouvert
    if (this.portfolioOpen) {
      return;
    }
    
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }
    this.startTyping();
  }

  // Nouvelle méthode pour masquer l'info-bulle quand le portfolio s'ouvre
  hideInfoBulle(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    
    this.isTyping = false;
    this.isVisible = false;
    this.isFadingOut = false;
    this.displayedText = '';
    this.currentIndex = 0;
    this.cdr.markForCheck();
  }
}
