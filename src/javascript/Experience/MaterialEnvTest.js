import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

// Custom Scripts
import Loaders from "./Loaders";

const LIP_POSE = {
	// A: "aPose", //
	// B: "botJawClosed", //
	// C: "botJawClosed",
	// D: "botJawClosed",
	// E: "ePose", //
	// F: "ePose",
	// G: "ePose",
	// H: "ePose",
	// I: "iPose", //
	// J: "iPose",
	// K: "smile",
	// L: "iPose",
	// M: "botJawClosed", //
	// N: "botJawClosed",
	// O: "oPose", //
	// P: "botJawClosed", //
	// Q: "botJawClosed",
	// R: "botJawClosed",
	// S: "smile",
	// T: "smile",
	// U: "uPose", //
	// V: "uPose",
	// W: "uPose",
	// X: "uPose",
	// Y: "uPose",
	// Z: "uPose",

	A: "viseme_PP",
	B: "viseme_kk",
	C: "viseme_I",
	D: "viseme_AA",
	E: "viseme_O",
	F: "viseme_U",
	G: "viseme_FF",
	H: "viseme_TH",
	X: "viseme_PP",
};

export default class MaterialEnvTest {
	constructor(ThreeEnvironment) {
		const { scene, camera, controls } = ThreeEnvironment;
		this.scene = scene;
		this.camera = camera;
		this.controls = controls;
		this.loaders = new Loaders(ThreeEnvironment);
		this.clock = new THREE.Clock();
		this.animations = [];
		this.allResourcesLoaded = false;
		this.lastAudioTime = 0.0;
		// this.createPlane();
		this.loadAndSetupResources().then((res) => console.log(res));
	}

	async loadAndSetupResources() {
		await this.addModel();
		await this.addAudioSystem();
		await this.loadLipSyncData();
		this.addGUIControls();
		this.allResourcesLoaded = true;
		return Promise.resolve("All Resources loaded!");
	}

	async addModel() {
		let model = await this.loaders.loadGltfByUrl("/models/manInShorts.glb");
		model = model.scene;

		this.scene.add(model);
		// model.rotation.y = -Math.PI/2
		// model.scale.set(0.1,0.1,0.1)
		// model.position.y = -3;

		model.scale.set(10, 10, 10);
		model.position.y = -16;
		console.log(model);

		// this.animationMixer = new THREE.AnimationMixer( model );
		// this.head = model.getObjectByName( 'polySurface1Shape' );
		this.head = model.getObjectByName("Wolf3D_Head");
		this.teeth = model.getObjectByName("Wolf3D_Teeth");
		this.inf = this.head.morphTargetInfluences;

		this.head.morphTargetInfluences[
			this.head.morphTargetDictionary["viseme_I"]
		  ] = 1;
		  this.teeth.morphTargetInfluences[
			this.teeth.morphTargetDictionary["viseme_I"]
		  ] = 1;

		console.log(this.head.morphTargetDictionary);
		console.log("Model Setup Done!");
		return Promise.resolve("Model Setup Done!");
	}

	async addAudioSystem() {
		const buffer = await this.loaders.loadAudioByURL(
			"/Audios/Bot-Intro.mp3"
		);
		this.listener = new THREE.AudioListener();
		this.camera.add(this.listener);
		this.audio = new THREE.Audio(this.listener);
		this.audio.setLoop(false);
		this.audio.setBuffer(buffer);
		this.audio.setVolume(0.5); // Adjust volume as needed
		this.audio.play();

		console.log("Audio Setup Done!");
		return Promise.resolve("Audio Setup Done!");
	}

	async loadLipSyncData() {
		const data = await this.loaders.loadFileByURL("/json/BotIntro.json");
		this.lipSyncJson = JSON.parse(data);
		console.log("LipSync Data Setup Done!");
		return Promise.resolve("LipSync Data Setup Done!");
	}

	addGUIControls() {
		const gui = new GUI();
		for ( const [ key, value ] of Object.entries( this.head.morphTargetDictionary ) ) {
			gui.add( this.inf, value, 0, 1, 0.01 )
			.name( key.replace( 'blendShape1.', '' ) )
			.listen( this.inf );
		}

		// this.controls = {
		// 	play: true,
		// 	selectedAudio: "Bot-Intro", // Placeholder for selected audio file
		// };
		// const options = {
		// 	BotIntro: "Bot-Intro",
		// 	BotIntro2: "Bot-Intro1",
		// };

		// // Add controls to Dat.GUI
		// gui.add(this.controls, "play")
		// 	.name("Play")
		// 	.onChange((value) => {
		// 		if (this.controls.play) this.audio.play();
		// 		else this.audio.pause();
		// 		this.playLipSyncAnimation();
		// 	});
		// const audioDropdown = gui
		// 	.add(this.controls, "selectedAudio", options)
		// 	.name("Select Audio");

		// audioDropdown.onChange(async (selectedAudio) => {
		// 	console.log(`Selected New Audio! ${selectedAudio}`);
		// 	const buffer = await this.loaders.loadAudioByURL(
		// 		`/Audios/${selectedAudio}.mp3`
		// 	);

		// 	if (this.audio.isPlaying) this.audio.stop();
		// 	this.audio.setBuffer(buffer);
		// 	if (this.controls.play) this.audio.play();
		// });
		gui.open();
	}

	createPlane() {
		const WIDTH = 80;
		const LENGTH = 80;

		const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 255, 255);
		const material = new THREE.MeshStandardMaterial({
			color: 0x858383,
			wireframe: false,
		});

		const floor = new THREE.Mesh(geometry, material);
		floor.rotation.x = -Math.PI / 2;
		this.scene.add(floor);
	}

	playLipSyncAnimation() {
		// console.log(this.audio)

		const context = this.audio.context; // Get the audio context from the audio object
		const currentAudioTime = context.currentTime; // Get the current time of the audio playback
		// console.log(currentAudioTime)
		// console.log(this.lipSyncJson.mouthCues.length)

		Object.keys(LIP_POSE).forEach((value) => {
			this.head.morphTargetInfluences[
				this.head.morphTargetDictionary[value]
			] = 0;
			this.teeth.morphTargetInfluences[
				this.teeth.morphTargetDictionary[value]
			] = 0;
		});

		const result = this.findObjectByTimestamp(
			this.lipSyncJson.mouthCues,
			currentAudioTime
		);
		
		if (result) {
			console.log(result)
			this.head.morphTargetInfluences[
				this.head.morphTargetDictionary[LIP_POSE[result.value]]
			] = 1;
			this.teeth.morphTargetInfluences[
				this.teeth.morphTargetDictionary[LIP_POSE[result.value]]
			] = 1;
		}
	}

	playNormalAnimation(i) {
		console.log("h")
			const mouthCue = this.lipSyncJson.mouthCues[i];
			
			this.head.morphTargetInfluences[
				this.head.morphTargetDictionary[
					LIP_POSE[mouthCue.value]
				]
			] = THREE.MathUtils.lerp(
				this.head.morphTargetInfluences[
					this.head.morphTargetDictionary[
						LIP_POSE[mouthCue.value]
					]
				],
				1,
				0.5
			);
			this.teeth.morphTargetInfluences[
				this.head.morphTargetDictionary[
					LIP_POSE[mouthCue.value]
				]
			] = THREE.MathUtils.lerp(
				this.teeth.morphTargetInfluences[
					this.head.morphTargetDictionary[
						LIP_POSE[mouthCue.value]
					]
				],
				1,
				0.5
			);
			
	}

	// Binary Search
	// Inside playLipSyncAnimation function
	// playLipSyncAnimation() {
	// 	const context = this.audio.context;
	// 	const currentAudioTime = context.currentTime;
	// 	console.log(currentAudioTime)
	// 	// Check if the audio timestamp has changed
	// 	if (currentAudioTime !== this.lastAudioTime) {
	// 		console.log("hiiiiiiiiii")
	// 		Object.keys(LIP_POSE).forEach((value) => {
	// 			const morphIndex = this.head.morphTargetDictionary[value];
	// 			const targetValue = LIP_POSE[value] === undefined ? 0 : 1; // Assuming 0 or 1 influence
	// 			const currentInfluence = this.head.morphTargetInfluences[morphIndex];
	// 			const targetInfluence = currentInfluence === targetValue ? targetValue : 0;

	// 			// Apply linear interpolation for smoother transitions
	// 			this.head.morphTargetInfluences[morphIndex] = THREE.MathUtils.lerp(
	// 				currentInfluence,
	// 				targetInfluence,
	// 				0.1 // Adjust smoothing factor as needed
	// 			);

	// 			this.teeth.morphTargetInfluences[morphIndex] = this.head.morphTargetInfluences[morphIndex];
	// 		});

	// 		this.lastAudioTime = currentAudioTime;
	// 	}
	// }

	findObjectByTimestamp(mouthCues, timestamp) {
		let left = 0;
		let right = mouthCues.length - 1;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);
			const currentObject = mouthCues[mid];

			if (
				timestamp >= currentObject.start &&
				timestamp <= currentObject.end
			) {
				return currentObject;
			} else if (timestamp < currentObject.start) {
				right = mid - 1;
			} else {
				left = mid + 1;
			}
		}

		return null; // Timestamp not found in any object
	}

	update() {
		// if(this.audio){
		// 	if (this.controls.play) this.audio.play();
		// 	else this.audio.pause();
		// }
		// console.log("hi")
		if (this.allResourcesLoaded) {
			this.playLipSyncAnimation();
		}
	}
}
