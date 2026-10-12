import { Component, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { WindowManagerService } from '../../services/window-manager.service';
import { Subscription } from 'rxjs';

import { PortfolioItem, PORTFOLIO_ITEMS } from '../../data/portfolio.data';

@Component({
  selector: 'app-portfolio',
  imports: [],
  templateUrl: './portfolio.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit, OnDestroy {
  // Événement pour fermer le portfolio
  @Output() closePortfolio = new EventEmitter<void>();
  
  // Ligne ajoutée au hasard - propriété pour la couleur du thème
  themeColor: string = '#00ff88';

  // Propriétés pour la gestion des fenêtres
  private readonly windowId = 'portfolio-window';
  private subscription: Subscription = new Subscription();
  public windowZIndex: number = 1000;
  
  // Tableau des projets portfolio
  portfolioItems: PortfolioItem[] = PORTFOLIO_ITEMS;

  constructor(private windowManagerService: WindowManagerService) {}

  /**
   * Initialise le composant et enregistre la fenêtre dans le gestionnaire
   */
  ngOnInit(): void {
    // Enregistrer la fenêtre dans le gestionnaire
    this.windowZIndex = this.windowManagerService.registerWindow(this.windowId);
    
    // S'abonner aux changements de fenêtre active
    this.subscription.add(
      this.windowManagerService.getActiveWindowObservable().subscribe(activeWindowId => {
        if (activeWindowId === this.windowId) {
          this.windowZIndex = this.windowManagerService.getWindowZIndex(this.windowId);
        }
      })
    );
  }

  /**
   * Nettoie les ressources lors de la destruction du composant
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.windowManagerService.unregisterWindow(this.windowId);
  }

  // Méthode pour ajouter un nouveau projet
  addPortfolioItem(item: PortfolioItem): void {
    this.portfolioItems.push(item);
  }

  // Méthode pour supprimer un projet
  removePortfolioItem(id: string): void {
    this.portfolioItems = this.portfolioItems.filter(item => item.id !== id);
  }

  // Méthode pour obtenir un projet par ID
  getPortfolioItem(id: string): PortfolioItem | undefined {
    return this.portfolioItems.find(item => item.id === id);
  }

  // Méthode pour optimiser le rendu de la liste avec trackBy
  trackByItemId(index: number, item: PortfolioItem): string {
    return item.id;
  }

  // Exemple d'ajout d'un nouveau projet
  addExampleProject(): void {
    const newProject: PortfolioItem = {
      id: 'mon-nouveau-projet', //Ne pas mettre d'espace dans l'id
      title: '// Mon Nouveau Projet',
      imagePath: 'assets/media/images/nocte-grafika.png', // Utilise la même image pour l'exemple
      description: 'Description de mon nouveau projet portfolio',
      technologies: [
        { label: 'React' },
        { label: 'TypeScript' }
      ],
      language: { label: 'Anglais' },
      difficulty: { label: 'Moyen' },
      date: { label: 'Décembre 2024' },
      seeMoreLink: 'https://github.com/mon-projet'
    };
    
    this.addPortfolioItem(newProject);
  }

  // Méthode pour fermer le portfolio
  onCloseClick(): void {
    this.closePortfolio.emit();
  }

  /**
   * Méthode pour gérer le clic sur le bouton "See more"
   * Ouvre le lien du projet dans un nouvel onglet
   */
  onSeeMoreClick(item: PortfolioItem): void {
    if (item.seeMoreLink && item.seeMoreLink !== '#') {
      window.open(item.seeMoreLink, '_blank', 'noopener,noreferrer');
    } else {
      console.log('Lien non disponible pour le projet:', item.title);
    }
  }

  /**
   * Méthode appelée quand l'utilisateur clique sur la fenêtre
   * Fait passer la fenêtre au premier plan
   */
  onWindowClick(): void {
    this.windowZIndex = this.windowManagerService.bringToFront(this.windowId);
  }
}
