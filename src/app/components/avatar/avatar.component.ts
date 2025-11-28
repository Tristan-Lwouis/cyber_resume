import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as THREE from 'three';
import { AvatarMemoryMonitorService } from '../../services/avatar-memory-monitor.service';
import { LoadingProgressService } from '../../services/loading-progress.service';

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
  private mixer?: THREE.AnimationMixer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationId: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private clickHandler: ((event: MouseEvent) => void) | null = null;
  private pixelRatio: number; // Cache le pixel ratio pour éviter les recalculs
  private instanceId: string; // Identifiant unique pour le monitoring
  private fallbackProgress = 0; // Pourcentage approximatif si la taille totale est inconnue

  constructor(
    private avatarMemoryMonitor: AvatarMemoryMonitorService,
    private loadingProgress: LoadingProgressService
  ) {
    this.pixelRatio = Math.min(window.devicePixelRatio, 2); // Limite à 2 pour les performances
    this.instanceId = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async ngAfterViewInit(): Promise<void> {
    // Enregistrer l'instance pour le monitoring
    this.avatarMemoryMonitor.registerAvatar(this.instanceId, this);
    
    await this.initThree();
    await this.loadModel();
    this.animate();
    this.setupClickDetection();
    this.resizeHandler = () => this.onResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      if (this.isVisible) {
        canvas.style.display = 'block';
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

    // Nettoyage optimisé des ressources
    this.cleanupResources();
  }

  private cleanupResources(): void {
    // Nettoyer les contrôles
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Nettoyer le mixer d'animation
    if (this.mixer) {
      this.mixer.stopAllAction();
      if (this.model) {
        this.mixer.uncacheRoot(this.model);
      }
      this.mixer = undefined;
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
      this.scene = undefined as any;
    }

    // Nettoyer le renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined as any;
    }

    // Nettoyer la caméra
    if (this.camera) {
      this.camera = undefined as any;
    }

    // Nettoyer les objets utilitaires
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Méthode de nettoyage forcé appelée par le service de monitoring
   * en cas de détection de fuite mémoire
   */
  forceCleanup(): void {
    console.log(`🧹 Nettoyage forcé de l'avatar ${this.instanceId}`);
    
    // Arrêter l'animation immédiatement
    this.stopAnimation();
    
    // Forcer le garbage collection si disponible
    if (window.gc) {
      window.gc();
    }
    
    // Nettoyer les ressources
    this.cleanupResources();
  }

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

  private async initThree(): Promise<void> {
    const canvas = this.canvasRef.nativeElement;
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

    // Lumières optimisées
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6c6, 7);
    sunLight.position.set(8, 10, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048; // Réduit pour les performances (512)
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    this.scene.add(sunLight);

    // Sol optimisé
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    this.scene.add(plane);

    // Contrôles optimisés
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

        // Configuration optimisée des meshes
        this.model!.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        // Gestion des animations
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model!);
          gltf.animations.forEach((clip: any) => {
            this.mixer!.clipAction(clip).play();
          });
        }

        this.loadingProgress.markCompleted();
      },
      (event: ProgressEvent<EventTarget>) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = (event.loaded / event.total) * 100;
          this.loadingProgress.updateProgress(percent);
        } else {
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
      this.mixer.update(1 / 120); // 60 FPS fixe pour la cohérence
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
