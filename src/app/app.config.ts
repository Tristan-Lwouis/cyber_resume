import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { MemoryMonitorService } from './services/memory-monitor.service';
import { AudioEventsService } from './services/audio-events.service';
import { AvatarMemoryMonitorService } from './services/avatar-memory-monitor.service';
import { ViewportLineService } from './services/viewport-line.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ 
      eventCoalescing: true
    }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    MemoryMonitorService,
    AudioEventsService,
    AvatarMemoryMonitorService,
    ViewportLineService
  ]
};
