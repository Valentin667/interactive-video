// GLView.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';

class GLView {
  constructor(mountRef, videoRef) {
    this.mountRef = mountRef;
    this.videoRef = videoRef;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.modelRef = null;
    this.videoTexture = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.plane = null;
    this.isLoading = true;
    this.paused = true;
    this.videoAspectRatio = 1;
    this.video = null
    this.init()
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mountRef.current.appendChild(this.renderer.domElement);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 10, 7.5);
    this.scene.add(this.directionalLight);

    // Vidéo
    this.setupVideo();
    // this.setupVideo(document.createElement("video"))
    this.setupPlane();
    this.loadModel();
    this.createTimeline();
    window.addEventListener("resize", this.resize);
    this.resize()

    // Camera
    this.camera.position.z = 5;

    // Animation
    this.animate();
  }

  setupVideo() {
    const video = document.getElementById('video');
    this.video = video
    video.src = '/videos/video-intro.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.load();

    video.addEventListener("loadedmetadata", () => {
    this.plane.material.uniforms.uTexture.value = this.videoTexture
    this.plane.material.uniforms.uVideoSize.value.set(video.videoWidth, video.videoHeight)
    video.play().catch((error) => {
        console.error("Erreur de démarrage automatique :", error);
      });
    });

    this.videoTexture = new THREE.VideoTexture(video);
    this.videoTexture.minFilter = THREE.LinearFilter;
    this.videoTexture.magFilter = THREE.LinearFilter;
    this.videoTexture.format = THREE.RGBAFormat;
  }

  setupPlane() {
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const vertexShader = `
         uniform vec2 uFrequency;
            uniform float uTime;
            uniform vec2 uScreenSize;
            uniform vec2 uVideoSize;

            varying vec2 vUv;
            varying float vElevation;

            void main(){
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);

                float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.05;
                elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.05;

                modelPosition.z += elevation;

                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectedPosition = projectionMatrix * viewPosition;

                vec4 pos = vec4(position, 1.0);


                float containRatio = min(
                    uScreenSize.x / uVideoSize.x,
                    uScreenSize.y / uVideoSize.y
                );

                float coverRatio = max(
                    uScreenSize.x / uVideoSize.x,
                    uScreenSize.y / uVideoSize.y
                );

                float ratio = mix(coverRatio, containRatio, floor(clamp(uScreenSize.x / 400.0, 0.0, 1.0)));

                vec2 size = uVideoSize * ratio;
                size = size / uScreenSize;
                //size = clamp(size, vec2(0.0), vec2(0.8));
                pos.xy *= size.xy;
                
                gl_Position = pos;

                vUv = uv;
                vElevation = elevation;
            }
    `;
    const fragmentShader = `
        uniform vec3 uColor;
            uniform sampler2D uTexture;

            varying vec2 vUv;
            varying float vElevation;

            void main(){
                vec4 textureColor = texture2D(uTexture, vUv);
                textureColor.rgb *= vElevation * 2.0 + 0.5;
                gl_FragColor = textureColor;
            }
    `;

    const planeMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0.0 },
        uColor: { value: new THREE.Color(0x00ff88) },
        uTexture: { value: null },
        uScreenSize: { value: new THREE.Vector2() },
        uVideoSize: { value: new THREE.Vector2() }
      }
    });

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.position.set(0, 0, -5);
    this.scene.add(this.plane);
  }

  updateCurrentTime(currentTime) {
    this.currentTime = currentTime;
  }

  loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      '/models/fifa_texture_jaquette.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.z = 3;
        model.rotation.y = -Math.PI / 2;
        this.scene.add(model);
        this.modelRef = model;
        this.isLoading = false;

        this.modelRef.visible = false;
        this.createTimeline();
      },
      (xhr) => {
        // Log de progression
      },
      (error) => {
        console.error('Erreur lors du chargement du modèle', error);
      }
    );
  }

  createTimeline() {
    if (!this.modelRef) return;

    this.timeline = gsap.timeline({ paused: true });
    this.timeline.to(this.modelRef.position, {
        duration: 2,
        z: 0, // Déplace l'objet à sa position finale
        ease: 'power2.inOut',
      });
  }

  animate = (time) => {
    if (this.paused) return;

      if (this.plane) {
        this.plane.material.uniforms.uTime.value = time * 0.001;
      }

    //   if (this.videoRef.current.currentTime >= 10 && !this.modelVisible) {
    //     this.modelVisible = true;
    //     this.modelRef.visible = true;
    //     this.timeline.play();
    //   }
      if (this.video) {
        console.log(this.video.currentTime)
      }

      this.videoTexture.needsUpdate = true;

      if (this.modelRef) {
        this.modelRef.rotation.y += 0.01;
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate);
  }

  resize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.plane.material.uniforms.uScreenSize.value.set(window.innerWidth, window.innerHeight)
  }

  start() {
    if (!this.paused) return
    this.paused = false
    this.animate()
  }

  stop() {
    if (this.paused) return
    this.paused = true
  }

  dispose() {
    this.mountRef.current.removeChild(this.renderer.domElement);
  }
}

export default GLView;
