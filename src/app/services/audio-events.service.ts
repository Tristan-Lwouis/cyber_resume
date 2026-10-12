import { Injectable } from '@angular/core';

export type AudioEventType = 'open' | 'close';

/**
 * Service centralisant les effets sonores de l'interface (ouverture / fermeture des fenêtres).
 * Les fichiers audio ne sont créés qu'au premier son joué, pour ne rien télécharger inutilement.
 */
@Injectable({
  providedIn: 'root'
})
export class AudioEventsService {
  private readonly sounds = new Map<AudioEventType, HTMLAudioElement>();

  /**
   * Joue le son d'ouverture
   */
  playOpenSound(): void {
    this.play('open');
  }

  /**
   * Joue le son de fermeture
   */
  playCloseSound(): void {
    this.play('close');
  }

  /**
   * Joue le son approprié selon l'état
   */
  playToggleSound(isOpening: boolean): void {
    this.play(isOpening ? 'open' : 'close');
  }

  private play(type: AudioEventType): void {
    let sound = this.sounds.get(type);
    if (!sound) {
      sound = new Audio(`assets/media/soundFX/${type}.mp3`);
      this.sounds.set(type, sound);
    }
    sound.currentTime = 0; // Remettre à zéro pour pouvoir rejouer immédiatement
    // Le navigateur peut refuser la lecture avant la première interaction : on ignore silencieusement
    sound.play().catch(() => {});
  }
}
