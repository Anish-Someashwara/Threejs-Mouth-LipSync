import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Scripts Imports
import MaterialEnvTest from "./MaterialEnvTest";



export class ThreeEnvSetup {
	static instance = null;

	constructor(canvas) {
		if (ThreeEnvSetup.instance) {
			return ThreeEnvSetup.instance;
		}
		ThreeEnvSetup.instance = this;

		this.clock = new THREE.Clock();
		this.canvas = canvas;
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x3a3d3b);
        
		this.setupCamera();
		this.setupRenderer();
		this.setupControls();
		this.setupLights();

		// this.axesHelper = new THREE.AxesHelper(100);
		// this.scene.add(this.axesHelper);
		// this.setupBaseWireframeMesh();


		// Class Objects
		this.MaterialEnvTestIns = new MaterialEnvTest(this);


		window.addEventListener("resize", () => this.resize());
		this.resize();
		this.update();
	}


	setupCamera() {
		this.camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000,
		);
		this.camera.position.set(0, 0, 7);
		// this.camera.lookAt(new THREE.Vector3(0, 0, 0));
	}


	setupRenderer() {
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
		});
		this.updateRendererProperties();
	}

	setupControls() {
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true
		this.controls.minDistance = 5
		this.controls.maxDistance = 10
		this.controls.enablePan = false
		this.controls.maxPolarAngle = Math.PI / 2 - 0.05
		this.controls.update();
	}

	setupLights() {
		// Ambient Light
		this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
		this.scene.add(this.ambientLight);

		// Directional Light
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.scene.add(this.directionalLight);
	}

	setupBaseWireframeMesh() {
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100, 10, 10),
			new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }),
		);
		plane.rotation.x = (Math.PI / 180) * 90;
		this.scene.add(plane);
	}

	resize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.updateRendererProperties();
	}

	updateRendererProperties() {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.render(this.scene, this.camera);
	}

	update() {
		let mixerUpdateDelta = this.clock.getDelta();

		if (this.controls) this.controls.update();
		if(this.MaterialEnvTestIns) this.MaterialEnvTestIns.update(mixerUpdateDelta);
		this.renderer.render(this.scene, this.camera);
		window.requestAnimationFrame(() => {
			this.update();
		});
	}
}

