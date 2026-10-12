import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { ViewportLineService, ViewportLineData } from '../../services/viewport-line.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-viewport-line',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Lignes dynamiques du service -->
    <svg class="viewport-lines-container">
      <!-- Lignes avec points intermédiaires (deux segments) -->
      @for (line of activeLinesWithIntermediate; track trackByLineId($index, line)) {
        <line
          [attr.x1]="line.startX"
          [attr.y1]="line.startY"
          [attr.x2]="line.intermediateX"
          [attr.y2]="line.intermediateY"
          [attr.stroke]="line.color || 'black'"
          stroke-width="5"
          [attr.data-component-id]="line.id + '-segment1'">
        </line>
      }
      @for (line of activeLinesWithIntermediate; track trackByLineId($index, line)) {
        <line
          [attr.x1]="line.intermediateX"
          [attr.y1]="line.intermediateY"
          [attr.x2]="line.endX"
          [attr.y2]="line.endY"
          [attr.stroke]="line.color || 'black'"
          stroke-width="5"
          [attr.data-component-id]="line.id + '-segment2'">
        </line>
      }
    
      <!-- Lignes simples (sans points intermédiaires) -->
      @for (line of activeLinesSimple; track trackByLineId($index, line)) {
        <line
          [attr.x1]="line.startX"
          [attr.y1]="line.startY"
          [attr.x2]="line.endX"
          [attr.y2]="line.endY"
          [attr.stroke]="line.color || 'black'"
          stroke-width="5"
          [attr.data-component-id]="line.id">
        </line>
      }
    </svg>
    `,
  styles: [`
    .viewport-lines-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1;
      pointer-events: none;
    }
    
    .viewport-lines-container line {
      transition: all 0.1s ease;
    }
  `]
})
export class ViewportLineComponent implements OnInit, OnDestroy {
  activeLines: ViewportLineData[] = [];
  activeLinesWithIntermediate: ViewportLineData[] = [];
  activeLinesSimple: ViewportLineData[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private viewportLineService: ViewportLineService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription.add(
      this.viewportLineService.lines$.subscribe(linesMap => {
        this.activeLines = Array.from(linesMap.values()).filter(line => line.isActive);
        
        // Séparer les lignes avec et sans points intermédiaires
        this.activeLinesWithIntermediate = this.activeLines.filter(line => 
          line.intermediateX !== undefined && line.intermediateY !== undefined
        );
        this.activeLinesSimple = this.activeLines.filter(line => 
          line.intermediateX === undefined || line.intermediateY === undefined
        );
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByLineId(index: number, line: ViewportLineData): string {
    return line.id;
  }
}
