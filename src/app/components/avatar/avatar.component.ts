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
  SimpleChanges
} from '@angular/core';
import * as THREE from 'three';
import { Subscription } from 'rxjs';
import { AvatarMemoryMonitorService } from '../../services/avatar-memory-monitor.service';
import { LoadingProgressService } from '../../services/loading-progress.service';
import { AvatarAnimationService } from '../../services/avatar-animation.service';

// Permet de savoir si c'est la premiere init de l'avatar pour jouer une animation spécifique
let GREETING_ALREADY_PLAYED = false;

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('avatarCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() avatarClicked = new EventEmitter<void>();
  @Input() isVisible: boolean = true;

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
  private resizeHandler: (() => void) | null = null;
  private clickHandler: ((event: MouseEvent) => void) | null = null;

  // Optimisation
  private pixelRatio: number; // Cache le pixel ratio pour éviter les recalculs
  private instanceId: string; // Identifiant unique pour le monitoring
  private fallbackProgress = 0; // Pourcentage approximatif si la taille totale est inconnue

  constructor(
    private avatarMemoryMonitor: AvatarMemoryMonitorService,
    private loadingProgress: LoadingProgressService,
    private avatarAnimationService: AvatarAnimationService
  ) {
    // Limite le pixel ratio à 2 pour éviter de flinguer le GPU sur les écrans 4K
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Identifiant unique pour cet avatar (utile pour le monitoring)
    this.instanceId = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // =====================================================================
  //  CYCLE DE VIE ANGULAR
  // =====================================================================

  async ngAfterViewInit(): Promise<void> {
    // Enregistrer l'instance pour le monitoring
    this.avatarMemoryMonitor.registerAvatar(this.instanceId, this);
    
    await this.initThree();
    await this.loadModel();
    this.animate();
    this.setupClickDetection();

    // Gestion du resize
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);

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

      if (this.isVisible) {
        canvas.style.display = 'block';
        // Si la boucle d'animation a été stoppée, on la relance
        if (this.animationId === null && this.renderer && this.scene && this.camera) {
          this.animate();
        }
      } else {
        canvas.style.display = 'none';
        this.stopAnimation();
      }
    }
  }

  private stopAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  ngOnDestroy(): void {
    // Désenregistrer l'instance du monitoring
    this.avatarMemoryMonitor.unregisterAvatar(this.instanceId);
    
    // Arrêter la boucle d'animation
    this.stopAnimation();

    // Supprimer les event listeners
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }

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

  /**
   * Méthode de nettoyage forcé appelée par le service de monitoring
   * en cas de détection de fuite mémoire.
   */
  forceCleanup(): void {
    console.log(`🧹 Nettoyage forcé de l'avatar ${this.instanceId}`);
    
    // Arrêter l'animation immédiatement
    this.stopAnimation();
    
    // Forcer le garbage collection si disponible (Chrome avec flag spécial)
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    // Nettoyer les ressources
    this.cleanupResources();
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

    // Renderer optimisé
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance' // Optimisation GPU
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6c6, 7);
    sunLight.position.set(8, 10, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
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
  }

  // =====================================================================
  //  CHARGEMENT DU MODELE + ANIMATIONS
  // =====================================================================

  private async loadModel(): Promise<void> {
    // @ts-ignore
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
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
          console.log('Animations disponibles dans le .glb :', gltf.animations.map((clip: any) => clip.name));
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
      // Pas de deltaTime réel ici, mais un pas fixe pour simplifier
      this.mixer.update(1 / 90); // 60 normal 120 2x plus lent
      // this.mixer.update(1 / 120); // 
    }
    
    this.renderer.render(this.scene, this.camera);
  };

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}
