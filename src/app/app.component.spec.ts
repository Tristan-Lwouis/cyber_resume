import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('crée l\'application', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('affiche le nom en mise en page bureau virtuel', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TRISTAN REGNIER');
  });

  it('ouvre une fenêtre depuis le menu puis la ferme depuis la vue plein écran', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;

    app.onMenuToggle({ index: 0, isActive: true });
    expect(app.showExperience).toBe(true);

    app.openFullscreen('experience');
    expect(app.fullscreenView).toBe('experience');

    // "Fermer" dans la vue plein écran ferme aussi la fenêtre d'origine
    app.closeFullscreenAndWindow('experience');
    expect(app.fullscreenView).toBeNull();
    expect(app.showExperience).toBe(false);
  });

  it('Skills et Loisirs sont exclusifs', () => {
    const app = TestBed.createComponent(AppComponent).componentInstance;

    app.onMenuToggle({ index: 3, isActive: true });
    app.onMenuToggle({ index: 4, isActive: true });

    expect(app.showSkills).toBe(false);
    expect(app.showLoisirs).toBe(true);
  });
});
