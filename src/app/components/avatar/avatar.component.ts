import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  NgZone,
  ChangeDetectionStrategy
} from '@angular/core';
import * as THREE from 'three';
import { Subscription } from 'rxjs';
import { LoadingProgressService } from '../../services/loading-progress.service';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

// Permet de savoir si c'est la premiere init de l'avatar pour jouer une animation spécifique
let GREETING_ALREADY_PLAYED = false;

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact' }
})
export class AvatarComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() avatarClicked = new EventEmitter<void>();
  @Input() isVisible: boolean = true;
  /**
   * Mode mobile : rendu moins coûteux, rotation horizontale uniquement
   * et défilement vertical de la page possible par-dessus le canvas.
   */
  @Input() compact: boolean = false;

  // === Paramètres principaux de la scène ===
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: any;
  private model: THREE.Group | undefined;

  // Mixer d'animations + actions
  private mixer?: THREE.AnimationMixer;
  private animationActions = new Map<string, THREE.AnimationAction>();

  // Nom de l'animation actuellement jouée
  private currentAnimationName: string | null = null;

  // Nom de l'animation idle / par défaut (boucle infinie)
  private defaultAnimationName: string | null = null;

  // File d'attente d'animations à jouer à la suite
  // Exemple : ['idle-to-sit', 'sit-to-type', 'type']
  private animationQueue: string[] = [];

  // Subscription aux requêtes d'animation venant du service
  private animationRequestSub?: Subscription;

  // Outils pour le raycasting (détection clic sur le modèle)
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Gestion de la boucle d'animation et des listeners
  private animationId: number | null = null;
  private resizeObserver?: ResizeObserver;
  private visibilityObserver?: IntersectionObserver;
  private inViewport = true; // La boucle de rendu est coupée quand le canvas sort de l'écran
  private clickHandler: ((event: MouseEvent) => void) | null = null;

  // Optimisation
  private pixelRatio = 1; // Cache le pixel ratio pour éviter les recalculs
  private fallbackProgress = 0; // Pourcentage approximatif si la taille totale est inconnue
  private clock = new THREE.Clock(); // Horloge pour le temps d'animation réel
  private frameCount = 0; // Compteur de frames pour le throttling des ombres

  constructor(
    private loadingProgress: LoadingProgressService,
    private avatarAnimationService: AvatarAnimationService,
    private ngZone: NgZone
  ) {}

  // =====================================================================
  //  CYCLE DE VIE ANGULAR
  // =====================================================================

  async ngAfterViewInit(): Promise<void> {
    // Limite le pixel ratio pour éviter de flinguer le GPU (4K, téléphones à très haute densité)
    this.pixelRatio = Math.min(window.devicePixelRatio, this.compact ? 1.5 : 2);

    try {
      await this.initThree();
    } catch (error) {
      // WebGL indisponible (vieux navigateur, accélération graphique désactivée...) :
      // on se passe de l'avatar plutôt que de bloquer l'écran de chargement indéfiniment
      console.warn('Avatar 3D désactivé : WebGL indisponible.', error);
      this.canvasRef.nativeElement.style.display = 'none';
      this.loadingProgress.markCompleted();
      return;
    }
    await this.loadModel();
    this.updateRenderLoop();
    this.setupClickDetection();

    const canvas = this.canvasRef.nativeElement;
    this.ngZone.runOutsideAngular(() => {
      // Suit la taille réelle du canvas (fenêtre redimensionnée, rotation, conteneur mobile...)
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(canvas);

      // Inutile de calculer des frames quand l'avatar n'est pas à l'écran (scroll sur mobile)
      this.visibilityObserver = new IntersectionObserver(([entry]) => {
        this.inViewport = entry.isIntersecting;
        this.updateRenderLoop();
      });
      this.visibilityObserver.observe(canvas);
    });

    // Souscription aux demandes d'animation venant du service
    // -> Même API, il peut toujours envoyer un seul nom d'animation
    this.animationRequestSub = this.avatarAnimationService.animationRequests$.subscribe(
      (animationName: string[]) => {
        this.playAnimation(...animationName);
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;

      canvas.style.display = this.isVisible ? 'block' : 'none';
      this.updateRenderLoop();
    }
  }

  /**
   * Démarre ou coupe la boucle de rendu selon la visibilité de l'avatar.
   */
  private updateRenderLoop(): void {
    const shouldRun = this.isVisible && this.inViewport && !!this.renderer && !!this.scene && !!this.camera;
    if (shouldRun && this.animationId === null) {
      this.clock.getDelta(); // Évite un saut d'animation après une pause
      this.ngZone.runOutsideAngular(() => this.animate());
    } else if (!shouldRun) {
      this.stopAnimation();
    }
  }

  private stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  ngOnDestroy(): void {
    // Arrêter la boucle d'animation
    this.stopAnimation();

    // Supprimer les event listeners
    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();

    if (this.clickHandler && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      canvas.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    if (this.animationRequestSub) {
      this.animationRequestSub.unsubscribe();
      this.animationRequestSub = undefined;
    }

    // Nettoyage optimisé des ressources 3D
    this.cleanupResources();
  }

  // =====================================================================
  //  NETTOYAGE / GESTION MEMOIRE
  // =====================================================================

  private cleanupResources(): void {
    // Nettoyer les contrôles
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Nettoyer le mixer d'animation
    if (this.mixer) {
      this.mixer.removeEventListener('finished', this.onAnimationFinished);
      this.mixer.stopAllAction();
      if (this.model) {
        this.mixer.uncacheRoot(this.model);
      }
      this.mixer = undefined;
      this.animationActions.clear();
      this.currentAnimationName = null;
      this.defaultAnimationName = null;
      this.animationQueue = [];
    }

    // Nettoyer le modèle 3D
    if (this.model) {
      this.model.traverse((child: any) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      this.model = undefined;
    }

    // Nettoyer la scène
    if (this.scene) {
      this.scene.clear();
      // @ts-ignore
      this.scene = undefined;
    }

    // Nettoyer le renderer
    if (this.renderer) {
      this.renderer.dispose();
      // @ts-ignore
      this.renderer = undefined;
    }

    // Nettoyer la caméra
    if (this.camera) {
      // @ts-ignore
      this.camera = undefined;
    }

    // Réinitialiser les utilitaires
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  // =====================================================================
  //  INTERACTION : CLIC SUR LE MODELE
  // =====================================================================

  private setupClickDetection(): void {
    const canvas = this.canvasRef.nativeElement;
    
    this.clickHandler = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.model) {
        const intersects = this.raycaster.intersectObjects(this.model.children, true);
        
        if (intersects.length > 0) {
          this.avatarClicked.emit();
        }
      }
    };
    
    canvas.addEventListener('click', this.clickHandler);
  }

  // =====================================================================
  //  INITIALISATION THREE.JS
  // =====================================================================

  private async initThree(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;

    // Scène
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Caméra optimisée
    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0.5, 1.5, 2.1);
    this.fitCameraToAspect();

    // Renderer optimisé
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance', // Optimisation GPU
      precision: 'highp',
      stencil: false // Économise le buffer stencil si non utilisé
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false; // On gère manuellement pour gagner des FPS

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6c6, 7);
    sunLight.position.set(8, 10, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512;
    sunLight.shadow.mapSize.height = 512;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30; // Réduit pour concentrer la résolution
    // Ajuster la zone d'ombre à l'avatar
    sunLight.shadow.camera.left = -5;
    sunLight.shadow.camera.right = 5;
    sunLight.shadow.camera.top = 5;
    sunLight.shadow.camera.bottom = -5;
    this.scene.add(sunLight);

    // Sol pour les ombres
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // Contrôles Orbit
    // @ts-ignore
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1, 0);
    
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
    
    this.controls.minDistance = 2.1;
    this.controls.maxDistance = 2.1;
    this.controls.maxPolarAngle = Math.PI / 2;

    if (this.compact) {
      // Sur mobile : on garde la rotation horizontale au doigt, mais un glissement vertical fait défiler la page
      this.renderer.domElement.style.touchAction = 'pan-y';
      this.controls.update();
      const polarAngle = this.controls.getPolarAngle();
      this.controls.minPolarAngle = polarAngle;
      this.controls.maxPolarAngle = polarAngle;
    }
  }

  // =====================================================================
  //  CHARGEMENT DU MODELE + ANIMATIONS
  // =====================================================================

  private async loadModel(): Promise<void> {
    const [{ GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
      // @ts-ignore
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      // @ts-ignore
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
    ]);
    const loader = new GLTFLoader();
    // Le modèle est compressé (EXT_meshopt_compression + textures WebP)
    loader.setMeshoptDecoder(MeshoptDecoder);
    this.loadingProgress.updateProgress(5);
    
    loader.load(
      'assets/3D/model.glb',
      (gltf: any) => {
        this.model = gltf.scene;
        this.scene.add(this.model!);
        
        if (this.model) {
          this.model.rotation.set(0, Math.PI / 9, 0);
        }

        // Configuration des meshes
        this.model!.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        // Gestion des animations
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model!);
          this.mixer.addEventListener('finished', this.onAnimationFinished);
          this.setupAnimations(gltf.animations);
        }

        this.loadingProgress.markCompleted();
      },
      (event: ProgressEvent<EventTarget>) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = (event.loaded / event.total) * 100;
          this.loadingProgress.updateProgress(percent);
        } else {
          // Fallback si la taille totale est inconnue
          this.fallbackProgress = Math.min(95, this.fallbackProgress + 1.5);
          this.loadingProgress.updateProgress(this.fallbackProgress);
        }
      },
      (error: any) => {
        console.error('Erreur lors du chargement du modèle 3D :', error);
        this.loadingProgress.markCompleted();
      }
    );
  }

  /**
   * Configure les animations importées et sélectionne une animation par défaut.
   */
  private setupAnimations(clips: THREE.AnimationClip[]): void {
    if (!this.mixer || !this.model) {
      return;
    }
  
    // Réinitialise proprement la map d'actions
    this.animationActions.clear();
  
    // 1. Création de toutes les AnimationAction à partir des clips
    clips.forEach((clip: THREE.AnimationClip, index: number) => {
      const clipName = clip.name && clip.name.trim().length > 0
        ? clip.name
        : `clip-${index}`;
  
      const action = this.mixer!.clipAction(clip);
      action.enabled = true;
  
      // Idle en boucle infinie, le reste en "once"
      if (clipName === 'Animation') {
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.clampWhenFinished = false;
      } else {
        action.setLoop(THREE.LoopOnce, 0);
        action.clampWhenFinished = true;
      }
  
      this.animationActions.set(clipName, action);
    });
  
    // 2. Détermination de l'animation idle par défaut
    let idleName: string | null = null;
  
    if (this.animationActions.has('Animation')) {
      idleName = 'Animation';
    } else {
      const first = this.animationActions.keys().next();
      idleName = first.done ? null : first.value;
    }
  
    if (!idleName) {
      return; // aucune animation exploitable
    }
  
    this.defaultAnimationName = idleName;
  
    // 3. Au tout premier chargement : jouer "coucou" si dispo, sinon idle direct
    if (!GREETING_ALREADY_PLAYED && this.animationActions.has('salute')) {
      GREETING_ALREADY_PLAYED = true;
      this.playClip('salute');
    } else {
      this.playClip(this.defaultAnimationName);
    }
  }
  

  // =====================================================================
  //  GESTION DES ANIMATIONS (SIMPLE + SEQUENCES)
  // =====================================================================

  /**
   * Joue un clip d'animation unique, avec fondu depuis l'animation en cours.
   * Ne gère PAS de file d'attente, juste un switch propre entre deux animations.
   */
  private playClip(animationName: string): void {
    if (!this.mixer) {
      console.warn('Animation mixer non initialisé, impossible de lancer une animation.');
      return;
    }

    const nextAction = this.animationActions.get(animationName);

    if (!nextAction) {
      console.warn(`Animation "${animationName}" introuvable.`);
      return;
    }

    // Si on demande déjà l'animation actuellement jouée, on ne fait rien
    if (this.currentAnimationName === animationName) {
      return;
    }

    // On fade-out l'animation actuelle si elle existe
    if (this.currentAnimationName) {
      const currentAction = this.animationActions.get(this.currentAnimationName);
      currentAction?.fadeOut(0.3);
    }

    // On lance la nouvelle avec un léger fondu
    nextAction.reset().fadeIn(0.3).play();
    this.currentAnimationName = animationName;
  }

  /**
   * Joue une ou plusieurs animations à la suite, dans l'ordre donné.
   * Exemple :
   *   playAnimation('idle-to-sit', 'sit-to-type', 'type')
   */
  public playAnimation(...animationNames: string[]): void {
    if (!this.mixer) {
      console.warn('Animation mixer non initialisé, impossible de lancer une animation.');
      return;
    }

    if (!animationNames || animationNames.length === 0) {
      return;
    }

    // On remplace la file d'attente actuelle par la nouvelle séquence
    // (si tu veux cumuler les séquences, tu peux faire un push au lieu d'un replace)
    this.animationQueue = animationNames.slice();

    // On démarre la première animation de la séquence
    this.playNextInQueue();
  }

  /**
   * Joue l'animation suivante dans la file d'attente.
   * - Si la file est vide → revient à l'animation idle par défaut.
   */
  private playNextInQueue(): void {
    if (!this.mixer) {
      return;
    }

    const nextName = this.animationQueue.shift();

    // Plus rien dans la file → on revient à l'idle si défini
    if (!nextName) {
      if (this.defaultAnimationName && this.currentAnimationName !== this.defaultAnimationName) {
        this.playClip(this.defaultAnimationName);
      }
      return;
    }

    // On joue le prochain clip de la séquence
    this.playClip(nextName);
  }

  /**
   * Réagit à la fin d'une animation :
   * - Si une séquence est en cours (queue non vide) → joue la suivante
   * - Sinon → revient à l'animation idle par défaut (si différente)
   */
  private onAnimationFinished = (event: THREE.Event & { action: THREE.AnimationAction }): void => {
    const finishedAction = event.action;

    // Retrouver le nom de l'animation qui vient de se terminer
    const animationEntry = Array.from(this.animationActions.entries())
      .find(([, action]) => action === finishedAction);

    if (!animationEntry) {
      return;
    }

    const [finishedName] = animationEntry;

    // S'il reste des animations dans la file d'attente, on enchaîne
    if (this.animationQueue.length > 0) {
      this.playNextInQueue();
      return;
    }

    // Sinon, on revient à l'animation idle (si définie et différente)
    if (this.defaultAnimationName && finishedName !== this.defaultAnimationName) {
      this.playClip(this.defaultAnimationName);
    }
  };

  // =====================================================================
  //  BOUCLE D'ANIMATION + RESIZE
  // =====================================================================

  private animate = (): void => {
    // Vérifier si le composant est toujours valide avant de continuer
    if (!this.renderer || !this.scene || !this.camera) {
      return;
    }
    
    this.animationId = requestAnimationFrame(this.animate);
    
    if (this.controls) {
      this.controls.update();
    }
    
    if (this.mixer) {
      // Utilisation du temps réel écoulé
      const delta = this.clock.getDelta();
      this.mixer.update(Math.min(delta, 0.1));
    }

    // Mise à jour des ombres seulement 1 frame sur 2 pour doubler l'efficacité du shadow mapping
    this.frameCount++;
    if (this.frameCount % 2 === 0) {
      this.renderer.shadowMap.needsUpdate = true;
    }
    
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Dans un cadre très vertical (colonne mobile / tablette), le champ horizontal devient trop étroit
   * et l'avatar est rogné : on recule la caméra (zoom < 1) proportionnellement.
   */
  private fitCameraToAspect(): void {
    const MIN_COMFORTABLE_ASPECT = 0.65;
    this.camera.zoom = Math.min(1, Math.pow(this.camera.aspect / MIN_COMFORTABLE_ASPECT, 0.6));
    this.camera.updateProjectionMatrix();
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!this.camera || !this.renderer || width === 0 || height === 0) {
      return; // Canvas masqué ou composant en cours de destruction
    }

    this.camera.aspect = width / height;
    this.fitCameraToAspect();
    this.renderer.setSize(width, height, false);
  }
}
