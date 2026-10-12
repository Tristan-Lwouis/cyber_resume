import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';

/**
 * Carte Leaflet stylisée (rayon de déplacement autour de Toulouse + modes de travail acceptés).
 * Utilisée dans la modale desktop et directement dans la page sur mobile.
 */
@Component({
  selector: 'app-cyber-map',
  templateUrl: './cyber-map.component.html',
  styleUrl: './cyber-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CyberMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private resizeObserver?: ResizeObserver;
  private readonly defaultLocation: L.LatLngExpression = [43.6047, 1.4442]; // Toulouse

  ngAfterViewInit(): void {
    this.initMap();

    // Leaflet doit recalculer sa taille quand son conteneur change (modale, foreignObject, rotation mobile...)
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private initMap(): void {
    const map = L.map(this.mapElement.nativeElement, {
      center: this.defaultLocation,
      zoom: 11,
      zoomControl: false, // Look épuré : la carte est un visuel, pas un outil de navigation
      attributionControl: true
    });
    this.map = map;

    // Couche de tuiles Stadia Maps (Alidade Smooth Dark) : fond sombre et routes discrètes.
    // Gratuit sans clé API : l'authentification se fait par domaine (à déclarer sur stadiamaps.com).
    const darkLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; Stadia Maps &copy; OpenMapTiles &copy; OpenStreetMap'
    }).addTo(map);

    // Repli sur OpenStreetMap si Stadia refuse les tuiles (domaine non déclaré, quota...)
    darkLayer.once('tileerror', () => {
      map.removeLayer(darkLayer);
      // Les tuiles OSM sont claires : une classe dédiée applique un filtre pour garder le look sombre
      map.getContainer().classList.add('osm-fallback');
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
    });

    // Cercle du rayon d'action (30 km)
    L.circle(this.defaultLocation, {
      radius: 30000,
      color: '#ede62c', // Primary yellow
      weight: 2,
      opacity: 0.8,
      fillColor: '#ede62c',
      fillOpacity: 0.1,
      dashArray: '10, 10', // Style pointillé pour le côté "radar"
      className: 'radar-circle'
    }).addTo(map);

    // Marqueur personnalisé "Video Game Style"
    const cyberIcon = L.divIcon({
      className: 'cyber-marker-container',
      html: '<div class="cyber-marker"><div class="inner-dot"></div></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
    L.marker(this.defaultLocation, { icon: cyberIcon }).addTo(map);
  }
}
