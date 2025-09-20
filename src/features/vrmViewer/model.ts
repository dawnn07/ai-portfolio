import * as THREE from "three";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMAnimation } from "../../lib/VRMAnimation/VRMAnimation";
import { VRMLookAtSmootherLoaderPlugin } from "@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  // public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;
  private _lookAtTarget: THREE.Object3D;
  private _currentLookAtTarget?: THREE.Vector3;
  private _lookAtSpeed: number = 2.0;
  private _isLookAtEnabled: boolean = true;
  private _isFirstLoad: boolean = true;
  private _introAnimationAction?: THREE.AnimationAction;
  private _idleAnimationAction?: THREE.AnimationAction;
  private _originalPosition: THREE.Vector3;
  // private _lipSync?: LipSync;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    
    // Create look-at target object
    this._lookAtTarget = new THREE.Object3D();
    this._lookAtTarget.position.set(0, 0, -1); // Default forward direction
    this._lookAtTargetParent.add(this._lookAtTarget);

     // Store original VRM position for position reset
    this._originalPosition = new THREE.Vector3(0, 0, 0);
    
    // this._lipSync = new LipSync(new AudioContext());
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    );

    const gltf = await loader.loadAsync(url);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = "VRMRoot";

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    // Store the original position after VRM setup
    this._originalPosition.copy(vrm.scene.position);
    console.log("Original VRM position stored:", this._originalPosition);

    // Set up look-at target for VRM
    if (vrm.lookAt) {
      vrm.lookAt.target = this._lookAtTarget;
    }

    // this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(vrmAnimation: VRMAnimation, isIntro: boolean = false): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip = vrmAnimation.createAnimationClip(vrm);
    const action = mixer.clipAction(clip);

    
    // Store original position to restore later
    const originalPosition = vrm.scene.position.clone();
    
    if (isIntro) {
      // Store intro animation reference
      this._introAnimationAction = action;
      
      // Configure intro animation
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      
      // Listen for animation completion
      const onFinished = () => {
        mixer.removeEventListener('finished', onFinished);
        
        // Reset position before transitioning to idle
        vrm.scene.position.copy(originalPosition);
        
        this.onIntroAnimationComplete();
      };
      mixer.addEventListener('finished', onFinished);
      
      action.play();
    } else {
      // Store idle animation reference
      this._idleAnimationAction = action;
      
      // Ensure position is reset when starting idle
      vrm.scene.position.copy(originalPosition);
      
      action.play();
    }
  }

  /**
   * Load and play intro animation on first load
   */
  public async loadIntroAnimation(url: string): Promise<void> {
    if (!this._isFirstLoad) return;
    
    try {
      const { loadVRMAnimation } = await import("@/lib/VRMAnimation/loadVRMAnimation");
      const introAnimation = await loadVRMAnimation(url);
      if (introAnimation) {
        await this.loadAnimation(introAnimation, true);
        console.log("Intro animation loaded and playing");
      }
    } catch (error) {
      console.warn("Failed to load intro animation:", error);
      // Fallback to idle animation if intro fails
      this.onIntroAnimationComplete();
    }
  }

  /**
   * Called when intro animation completes
   */
  private onIntroAnimationComplete(): void {
    console.log("Intro animation completed");
    this._isFirstLoad = false;
    
    // Load and start idle animation after intro
    this.loadIdleAnimation();
    
    // Enable idle look-at behavior after intro
    this.enableIdleLookAt(true);
    
    // Trigger any post-intro callbacks
    this.onIntroComplete?.();
  }

  /**
   * Load and start idle animation
   */
  private async loadIdleAnimation(): Promise<void> {
    try {
      const idleAnimation = await loadVRMAnimation("./idle_loop.vrma");
      if (idleAnimation) {
        await this.loadAnimation(idleAnimation, false); // false = not intro
        console.log("Idle animation loaded and started");
      }
    } catch (error) {
      console.warn("Failed to load idle animation:", error);
    }
  }

  /**
   * Callback for when intro animation is complete
   * Can be set externally to trigger additional behaviors
   */
  public onIntroComplete?: () => void;

  /**
   * Play a one-time animation (like greeting, wave, etc.)
   */
  public async playOneTimeAnimation(vrmAnimation: VRMAnimation, onComplete?: () => void): Promise<void> {
    const { vrm, mixer } = this;
    if (vrm == null || mixer == null) {
      throw new Error("You have to load VRM first");
    }

    const clip = vrmAnimation.createAnimationClip(vrm);
    const action = mixer.clipAction(clip);
    
    // Fade out current animations smoothly
    if (this._idleAnimationAction && this._idleAnimationAction.isRunning()) {
      this._idleAnimationAction.fadeOut(0.3);
    }
    
    // Configure one-time animation
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset();
    action.fadeIn(0.3);
    
    // Listen for completion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onFinished = (event: any) => {
      // Make sure this event is for our specific action
      if (event.action === action) {
        mixer.removeEventListener('finished', onFinished);
        
        // Fade out the completed animation
        action.fadeOut(0.3);
        
        // Return to idle animation
        this.returnToIdle();
        
        // Call user callback
        onComplete?.();
      }
    };
    mixer.addEventListener('finished', onFinished);
    
    action.play();
  }


  /**
   * Return to idle animation state
   */
  private returnToIdle(): void {
    if (this.vrm) {
      // Reset position to original before starting idle
      this.vrm.scene.position.copy(this._originalPosition);
      console.log("Reset VRM position to:", this._originalPosition);
    }

    if (this._idleAnimationAction) {
      // Reset and restart idle animation
      this._idleAnimationAction.reset();
      this._idleAnimationAction.fadeIn(0.3);
      this._idleAnimationAction.play();
      console.log("Returned to idle animation");
    } else {
      // If no idle animation is loaded, try to load it
      console.log("No idle animation found, attempting to load...");
      this.loadIdleAnimation();
    }
  }

  /**
   * Set the look-at target position in world coordinates
   */
  public setLookAtTarget(position: THREE.Vector3): void {
    if (!this._isLookAtEnabled) return;
    
    this._currentLookAtTarget = position.clone();
  }

  /**
   * Look at a specific world position
   */
  public lookAt(position: THREE.Vector3): void {
    this.setLookAtTarget(position);
  }

  /**
   * Look at the camera
   */
  public lookAtCamera(camera: THREE.Camera): void {
    if (camera.position) {
      this.lookAt(camera.position);
    }
  }

  /**
   * Look at mouse/pointer position on screen
   */
  public lookAtScreenPosition(
    x: number, 
    y: number, 
    camera: THREE.Camera, 
    distance: number = 2.0
  ): void {
    if (!camera) return;
    
    const mouse = new THREE.Vector2();
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera as THREE.PerspectiveCamera);
    
    const targetPosition = raycaster.ray.origin
      .clone()
      .add(raycaster.ray.direction.multiplyScalar(distance));
    
    this.lookAt(targetPosition);
  }

  /**
   * Enable or disable look-at functionality
   */
  public setLookAtEnabled(enabled: boolean): void {
    this._isLookAtEnabled = enabled;
    if (!enabled) {
      // Reset to default forward direction
      this._lookAtTarget.position.set(0, 0, -1);
    }
  }

  /**
   * Set look-at animation speed
   */
  public setLookAtSpeed(speed: number): void {
    this._lookAtSpeed = Math.max(0.1, speed);
  }

  /**
   * Smoothly animate look-at to random positions (for idle behavior)
   */
  public enableIdleLookAt(enabled: boolean = true): void {
    if (enabled) {
      // Simple idle look-at behavior - look around occasionally
      setInterval(() => {
        if (this._isLookAtEnabled && !this._currentLookAtTarget) {
          const randomX = (Math.random() - 0.5) * 2;
          const randomY = (Math.random() - 0.5) * 1 + 0.2; // Slightly upward bias
          const randomZ = -1 - Math.random() * 2; // Forward direction with variation
          
          this.setLookAtTarget(new THREE.Vector3(randomX, randomY, randomZ));
          
          // Clear the target after a moment to allow for natural movement
          setTimeout(() => {
            this._currentLookAtTarget = undefined;
          }, 2000 + Math.random() * 3000);
        }
      }, 3000 + Math.random() * 5000);
    }
  }

  /**
   * Manually reset VRM position to center
   */
  public resetPosition(): void {
    if (this.vrm) {
      this.vrm.scene.position.copy(this._originalPosition);
      console.log("Manually reset VRM position");
    }
  }



  /**
   * 音声を再生し、リップシンクを行う
   */
  // public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
  //   this.emoteController?.playEmotion(screenplay.expression);
  //   await new Promise((resolve) => {
  //     this._lipSync?.playFromArrayBuffer(buffer, () => {
  //       resolve(true);
  //     });
  //   });
  // }

  public update(delta: number): void {
    // Update look-at target smoothly
    if (this._currentLookAtTarget && this._isLookAtEnabled) {
      const currentPos = this._lookAtTarget.position;
      const targetPos = this._currentLookAtTarget;
      
      // Smooth interpolation towards target
      const lerpFactor = Math.min(1.0, delta * this._lookAtSpeed);
      currentPos.lerp(targetPos, lerpFactor);
      
      // Clear target when close enough
      if (currentPos.distanceTo(targetPos) < 0.01) {
        this._currentLookAtTarget = undefined;
      }
    }

    // if (this._lipSync) {
    //   const { volume } = this._lipSync.update();
    //   this.emoteController?.lipSync("aa", volume);
    // }

    // this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
  }
}