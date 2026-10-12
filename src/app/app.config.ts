import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { AudioEventsService } from './services/audio-events.service';
import { ViewportLineService } from './services/viewport-line.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({
      eventCoalescing: true
    }),
    AudioEventsService,
    ViewportLineService
  ]
};
