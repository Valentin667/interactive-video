// GLView.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap';

class GLView {
  constructor(mountRef, videoRef) {
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.mountRef = mountRef;
    this.videoRef = videoRef;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.modelRef = null;
    this.marioKartRef = null;
    this.spiderRef = null;
    this.videoTexture = null;
    this.ambientLight = null;
    this.directionalLight = null;
    this.plane = null;
    this.isLoading = true;
    this.paused = true;
    this.videoAspectRatio = 1;
    this.video = null;
    this.modelVisible = false;
    this.objects3D = [];
    this.planeAt25s = null;
    this.init()
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.mountRef.current.appendChild(this.renderer.domElement);

    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('click', this.onMouseClick.bind(this));

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

  setupVideo(videoUrl) {
    const video = document.getElementById("video");
  this.video = video;

  if (videoUrl) {
    video.src = videoUrl;
  }
  
  video.crossOrigin = 'anonymous';
  video.loop = false;
  video.muted = false;
  video.volume = 1;
  video.load();

  // Attendre que les métadonnées de la vidéo soient chargées
  video.addEventListener("loadedmetadata", () => {
    // Mettre à jour la texture vidéo
    this.plane.material.uniforms.uTexture.value = this.videoTexture;
    this.plane.material.uniforms.uVideoSize.value.set(video.videoWidth, video.videoHeight);
    
    // Démarrer la vidéo
    video.play().catch((error) => {
      console.error("Erreur de démarrage automatique :", error);
    });
  });

  // Créer une texture vidéo à partir de l'élément vidéo
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
      },
      depthTest: false
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
      '/models/fifa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, -4, 3);
        model.rotation.y = -Math.PI / 2;
        this.scene.add(model);
        this.modelRef = model;
        model.name = "fifa"
        this.isLoading = false;

        // model.traverse((ob) => {
        //     if (ob.isMesh) {
        //         ob.name = "fifa"
        //     }
        // })

        this.modelRef.visible = false;
        this.createTimeline();
        this.objects3D.push(this.modelRef);
      },
      (xhr) => { /* Log de progression */ },
      (error) => { console.error('Erreur lors du chargement du modèle', error); }
    );
    
    loader.load(
        '/models/mario_kart.glb',
        (gltf) => {
          const model = gltf.scene;
          model.position.set(-4, 0, 3);
          model.rotation.y = -Math.PI / 2;
          this.scene.add(model);
          this.marioKartRef = model;
          this.isLoading = false;
          model.name = "mario"

          this.marioKartRef.visible = false;
          this.createTimeline();
          this.objects3D.push(this.marioKartRef);
        },
        (xhr) => { /* Log de progression */ },
        (error) => { console.error('Erreur lors du chargement du modèle', error); }
    );

    loader.load(
        '/models/spiderspider.glb',
        (gltf) => {
          const model = gltf.scene;
          model.position.set(4, 0, 3);
          model.rotation.y = -Math.PI / 2;
          this.scene.add(model);
          this.spiderRef = model;
          this.isLoading = false;
          model.name = "spider"

          this.spiderRef.visible = false;
          this.createTimeline();
          this.objects3D.push(this.spiderRef);
        },
        (xhr) => { /* Log de progression */ },
        (error) => { console.error('Erreur lors du chargement du modèle', error); }
    );
}

onVideoTimeUpdate() {
    // Si la vidéo atteint 25 secondes, afficher le plane
    if (this.video.currentTime >= 25 && !this.planeAt25s) {
      this.showPlaneAt25s();
    }
  }
  
  showPlaneAt25s() {
    // Créez un autre "plane" qui sera visible lorsque la vidéo atteint 25 secondes
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      transparent: true,
    });
  
    this.planeAt25s = new THREE.Mesh(planeGeometry, planeMaterial);
    this.planeAt25s.position.set(0, 0, -5);
    this.scene.add(this.planeAt25s);

    console.log("Le plane a été affiché à 25 secondes.");
  
    // Ajouter un gestionnaire de clic pour changer la vidéo quand on clique sur le "plane"
    this.planeAt25s.addEventListener("click", this.onPlaneClick.bind(this));
  }
  
  onPlaneClick() {
    // Lorsque l'on clique sur le "plane", changer la vidéo
    const newVideoUrl = "/videos/video-screen-mario.mp4"; // Exemple de nouvelle vidéo
    this.setupVideo(newVideoUrl); // Recharger la vidéo avec la nouvelle URL
  
    // Enlever le plane une fois que la vidéo a changé
    if (this.planeAt25s) {
      this.scene.remove(this.planeAt25s);
      this.planeAt25s = null;
    }
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.getIntersections();

    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
  }

  onMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    this.raycaster.setFromCamera(this.mouse, this.camera);
  
    const intersects = this.getIntersections();
  
    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.objects3D.forEach(object => {
        gsap.killTweensOf(object.position);

        gsap.to(object.position, {
          duration: 1,
          y: -10,
          ease: "power2.inOut",
          onComplete: () => {
            object.visible = false;
          }
        });
      });
      console.log("Objet cliqué:", object.name, object.parent?.name);
    //   this.setupVideo("/videos/video-screen-fifa.mp4");
      
      if (object.parent.name === this.modelRef.name) {
        this.setupVideo("/videos/video-screen-fifa.mp4");
      } else if (object.parent.name === this.marioKartRef.name) {
        this.setupVideo("/videos/video-screen-mario.mp4");
      } else if (object.parent.name === this.spiderRef.name) {
        this.setupVideo("/videos/video-screen-spider.mp4");
      }
    }
  }
  
  getIntersections() {
    return this.raycaster.intersectObjects(this.objects3D, true);
  }

  createTimeline() {
    if (!this.modelRef || !this.marioKartRef || !this.spiderRef) return;

    this.timeline = gsap.timeline({ paused: true });
    this.timeline.to(this.modelRef.position, {
        duration: 0.5,
        y: 0,  // Position finale
        ease: 'power2.inOut',
        onComplete: () => {
          this.floatObject(this.modelRef);  // Lancer le flottement après l'animation
        }
      });    

      this.timeline.to(this.marioKartRef.position, {
        duration: 0.5,
        x: -1.6,  // Position finale
        ease: 'power2.inOut',
        onComplete: () => {
          this.floatObject(this.marioKartRef);  // Lancer le flottement après l'animation
        }
      });

      this.timeline.to(this.spiderRef.position, {
        duration: 0.5,
        x: 1.6,  // Position finale
        ease: 'power2.inOut',
        onComplete: () => {
          this.floatObject(this.spiderRef);  // Lancer le flottement après l'animation
        }
      });
    }

  floatObject(object) {
    // Animer la position de l'objet pour qu'il flotte sur l'axe Y
    gsap.to(object.position, {
      y: "+=0.1", // Flottement léger
      duration: 1,
      repeat: -1,  // Répéter indéfiniment
      yoyo: true,  // Faire l'oscillation (rebondir)
      ease: "sine.inOut",  // Utilisation d'un easing sinusoïdal pour l'effet flottant
    });
  }

  animate = (time) => {
    if (this.paused) return;

    //   if (this.plane) {
    //     this.plane.material.uniforms.uTime.value = time * 0.001;
    //   }

    //   if (this.videoRef.current.currentTime >= 10 && !this.modelVisible) {
    //     this.modelVisible = true;
    //     this.modelRef.visible = true;
    //     this.timeline.play();
    //   }
    //   if (this.video) {
    //     console.log(this.video.currentTime)
    //   }

      if (this.video.currentTime >= 26 && !this.modelVisible) {
        this.modelVisible = true;
        this.modelRef.visible = true;
        this.marioKartRef.visible = true;
        this.spiderRef.visible = true;
        this.timeline.play();
      }

      this.videoTexture.needsUpdate = true;

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
