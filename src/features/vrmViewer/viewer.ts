import * as THREE from "three";
import { Model } from "./model";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * three.jsを使った3Dビューワー
 *
 * setup()でcanvasを渡してから使う
 */
export class Viewer {
  public isReady: boolean;
  public model?: Model;

  private _renderer?: THREE.WebGLRenderer;
  private _clock: THREE.Clock;
  private _scene: THREE.Scene;
  private _camera?: THREE.PerspectiveCamera;
  private _cameraControls?: OrbitControls;
  private _mousePosition: THREE.Vector2 = new THREE.Vector2();

  constructor() {
    this.isReady = false;

    // scene
    const scene = new THREE.Scene();
    this._scene = scene;

    // light
    const directionalLight = new THREE.DirectionalLight(
      0xffffff,
      0.6 * Math.PI
    );
    directionalLight.position.set(1.0, 1.0, 1.0).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4 * Math.PI);
    scene.add(ambientLight);

    // animate
    this._clock = new THREE.Clock();
    this._clock.start();
  }

  public loadVrm(url: string) {
    if (this.model?.vrm) {
      this.unloadVRM();
    }

    // gltf and vrm
    this.model = new Model(this._camera || new THREE.Object3D());
    this.model.loadVRM(url).then(async () => {
      if (!this.model?.vrm) return;

      // Disable frustum culling
      this.model.vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      this._scene.add(this.model.vrm.scene);

      const vrma = await loadVRMAnimation("./idle_loop.vrma");
      if (vrma) this.model.loadAnimation(vrma);
      console.log("VRM loaded", vrma);

      // Enable idle look-at behavior
      this.model.enableIdleLookAt(true);

      // HACK: アニメーションの原点がずれているので再生後にカメラ位置を調整する
      requestAnimationFrame(() => {
        this.resetCamera();
      });
    });
  }

  public unloadVRM(): void {
    if (this.model?.vrm) {
      this._scene.remove(this.model.vrm.scene);
      this.model?.unLoadVrm();
    }
  }

  /**
   * Reactで管理しているCanvasを後から設定する
   */
  public setup(canvas: HTMLCanvasElement) {
    const parentElement = canvas.parentElement;
    const width = parentElement?.clientWidth || canvas.width;
    const height = parentElement?.clientHeight || canvas.height;
    
    // renderer
    this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
    });
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // camera
    this._camera = new THREE.PerspectiveCamera(20.0, width / height, 0.1, 20.0);
    this._camera.position.set(0, 1.3, 1.5);

    // camera controls
    this._cameraControls = new OrbitControls(
      this._camera,
      this._renderer.domElement
    );
    this._cameraControls.screenSpacePanning = true;
    
    // Disable drag and drop (rotation and panning)
    this._cameraControls.enabled = false;
    this._cameraControls.enableRotate = false;
    this._cameraControls.enablePan = false;
    
    // Disable zoom in/out
    this._cameraControls.enableZoom = false;
    
    this._cameraControls.target.set(0, 1.3, 0);
    this._cameraControls.update();

    // Add mouse tracking for look-at
    this.setupMouseTracking(canvas);

    window.addEventListener("resize", () => {
      this.resize();
    });
    
    this.isReady = true;
    this.update();
  }

  /**
   * Setup mouse tracking for look-at functionality
   */
  private setupMouseTracking(canvas: HTMLCanvasElement) {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      this._mousePosition.x = event.clientX - rect.left;
      this._mousePosition.y = event.clientY - rect.top;

      // Update VRM look-at to follow mouse
      if (this.model && this._camera) {
        this.model.lookAtScreenPosition(
          this._mousePosition.x,
          this._mousePosition.y,
          this._camera,
          2.5 // Distance for look-at target
        );
      }
    };

    const handleMouseLeave = () => {
      // When mouse leaves, look at camera instead
      if (this.model && this._camera) {
        this.model.lookAtCamera(this._camera);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
  }

  /**
   * canvasの親要素を参照してサイズを変更する
   */
  public resize() {
    if (!this._renderer) return;

    const parentElement = this._renderer.domElement.parentElement;
    if (!parentElement) return;

    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(
      parentElement.clientWidth,
      parentElement.clientHeight
    );

    if (!this._camera) return;
    this._camera.aspect =
      parentElement.clientWidth / parentElement.clientHeight;
    this._camera.updateProjectionMatrix();
  }

  /**
   * VRMのheadノードを参照してカメラ位置を調整する
   */
  public resetCamera() {
    const headNode = this.model?.vrm?.humanoid.getNormalizedBoneNode("head");

    if (headNode) {
      const headWPos = headNode.getWorldPosition(new THREE.Vector3());
      this._camera?.position.set(
        this._camera.position.x,
        headWPos.y,
        this._camera.position.z
      );
      this._cameraControls?.target.set(headWPos.x, headWPos.y, headWPos.z);
      this._cameraControls?.update();
    }
  }

  /**
   * Enable/disable look-at mouse tracking
   */
  public setMouseLookAtEnabled(enabled: boolean) {
    if (this.model) {
      this.model.setLookAtEnabled(enabled);
    }
  }

  /**
   * Make the VRM look at a specific world position
   */
  public setLookAtPosition(position: THREE.Vector3) {
    if (this.model) {
      this.model.lookAt(position);
    }
  }

  /**
   * Make the VRM look at the camera
   */
  public lookAtCamera() {
    if (this.model && this._camera) {
      this.model.lookAtCamera(this._camera);
    }
  }

  /**
   * Trigger a specific animation (like greeting when user interacts)
   */
  public async playGreetingAnimation() {
    if (!this.model) return;
    
    try {
      const greetingAnimation = await loadVRMAnimation("./VRMA_02.vrma");
      console.log("Greeting animation loaded:", this.model.vrm?.scene);
      if (greetingAnimation) {
        await this.model.playOneTimeAnimation(greetingAnimation, () => {
          console.log("Greeting animation completed, back to idle!");
          this.setMouseLookAtEnabled(true);
        });
      }
    } catch (error) {
      console.warn("Failed to load greeting animation:", error);
    }
  }

  /**
   * Play any one-time animation by filename - will automatically return to idle
   */
  public async playAnimation(filename: string, onComplete?: () => void) {
    if (!this.model) return;
    
    try {
      const animation = await loadVRMAnimation(filename);
      if (animation) {
        await this.model.playOneTimeAnimation(animation, () => {
          console.log(`Animation ${filename} completed, returned to idle!`);
          onComplete?.();
        });
      }
    } catch (error) {
      console.warn(`Failed to load animation ${filename}:`, error);
    }
  }


  /**
   * Reset VRM position to center (fix positioning issues)
   */
  public resetVRMPosition() {
    if (this.model) {
      this.model.resetPosition();
    }
  }


  public update = () => {
    requestAnimationFrame(this.update);
    const delta = this._clock.getDelta();
    
    // update vrm components
    if (this.model) {
      this.model.update(delta);
    }

    if (this._renderer && this._camera) {
      this._renderer.render(this._scene, this._camera);
    }
  };
}