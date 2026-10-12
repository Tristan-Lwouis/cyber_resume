import { Component, OnInit, OnDestroy, Output, EventEmitter, PLATFORM_ID, Inject, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-modal',
  standalone: true,
  imports: [],
  templateUrl: './map-modal.component.html',
  styleUrl: './map-modal.component.scss'
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  
  private map: any;
  private readonly defaultLocation: L.LatLngExpression = [43.6047, 1.4442]; // Toulouse

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Initialisation de la carte
    this.map = L.map('map', {
      center: this.defaultLocation,
      zoom: 11,
      zoomControl: false, // On désactive pour garder un look épuré (ou on le déplace)
      attributionControl: true
    });

    // Couche de tuiles (CartoDB Dark Matter)
    // Parfait pour le look Cyberpunk : fond noir et routes discrètes
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(this.map);

    // Ajout du cercle de rayon d'action (30km)
    L.circle(this.defaultLocation, {
      radius: 30000,
      color: '#ede62c', // Primary yellow
      weight: 2,
      opacity: 0.8,
      fillColor: '#ede62c',
      fillOpacity: 0.1,
      dashArray: '10, 10', // Style pointillé pour le côté "radar"
      className: 'radar-circle'
    }).addTo(this.map);


    // Ajout du marqueur personnalisé "Video Game Style"
    const cyberIcon = L.divIcon({
      className: 'cyber-marker-container',
      html: '<div class="cyber-marker"><div class="inner-dot"></div></div>',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker(this.defaultLocation, { icon: cyberIcon })
      .addTo(this.map)
      
    // Ajouter le contrôle de zoom en bas à droite
    // L.control.zoom({
    //   position: 'bottomright'
    // }).addTo(this.map);

    // Force Leaflet à recalculer la taille de son conteneur (très important dans un foreignObject ou une modale)
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  onClose(): void {
    this.close.emit();
  }
}

