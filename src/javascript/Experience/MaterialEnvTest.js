import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// import createAnimation from "./AnimationConvertor";
import createAnimation2 from "./AnimationConvertor";
import { AnimationClip, NumberKeyframeTrack } from "three";

// Custom Scripts
import Loaders from "./Loaders";

// For manInShorts.glb model
// const VISEME_DATA = {
// 	A: "viseme_PP",
// 	B: "viseme_kk",
// 	C: "viseme_I",
// 	D: "viseme_AA",
// 	E: "viseme_O",
// 	F: "viseme_U",
// 	G: "viseme_FF",
// 	H: "viseme_TH",
// 	X: "viseme_PP",
// };

// For FacialExp4.gltf model
const VISEME_DATA = {
	A: "P_B_M",
	B: "EE",
	C: "AA",
	D: "AA",
	E: "Ow",
	F: "Ow",
	G: "ER",
	H: "ER",
	X: "P_B_M",
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
		await this.loadLipSyncData();
		await this.addModel();
		await this.addAudioSystem();
		this.addGUIControls();
		this.allResourcesLoaded = true;
		return Promise.resolve("All Resources loaded!");
	}

	async addModel() {
		let gltf = await this.loaders.loadGltfByUrl("/models/FacialExp7.gltf");

		const model = gltf.scene;
		this.scene.add(model);
		model.scale.set(10, 10, 10);
		model.position.y = -16;
		console.log(gltf);

		// ////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// this.face = model.getObjectByName("HG_Body");
		// this.morphDict = this.face.morphTargetDictionary;
		// this.morphInf = this.face.morphTargetInfluences;

		// this.teethDict = model.getObjectByName("HG_TeethLower").morphTargetDictionary
		// // this.morphInf[this.morphDict['jawOpen']] = 1;
		// // console.log(this.lipSyncJson)
		// this.mixer = new THREE.AnimationMixer( model );
		// let blinkClip = createAnimation(this.lipSyncJson, this.morphDict, 'HG_Body');
		// let blinkAction = this.mixer.clipAction(blinkClip);
		// blinkAction.play();
		// console.log(blinkClip)

		// // let teethAnim = createAnimation(this.lipSyncJson, this.teethDict, 'HG_TeethLower');
		// // let teethAnimAction = this.mixer.clipAction(teethAnim);
		// // teethAnimAction.play();
		// ////////////////////////////////////////////////////////////////////////////////////////////////////////////

		// *******************************************************************************************
		this.face = model.getObjectByName("Face");
		this.morphDict = this.face.morphTargetDictionary;
		this.morphInf = this.face.morphTargetInfluences;
		this.mixer = new THREE.AnimationMixer(model);
		console.log(this.morphDict);

		let finishedFrames = 0;
		const numFrames = 60; // Number of frames for smooth animation
		const animation = [];
		const tracks = [];
		let time = [];

		for (let i = 0; i < Object.keys(this.morphDict).length; i++)
			animation.push([]);

		this.lipSyncJson.mouthCues.forEach((cue) => {
			const startTime = cue.start;
			const endTime = cue.end;
			const noOfSecs = endTime - startTime;
			const noOfFrames = noOfSecs * numFrames;

			for (let i = 0; i <= noOfFrames; i++) {
				animation[this.morphDict[VISEME_DATA[cue.value]]].push(
					i / (noOfFrames - 1)
				); // Linear interpolation from 0 to 1
				Object.entries(this.morphDict).forEach(([key]) => {
					if (key !== VISEME_DATA[cue.value])
						animation[this.morphDict[key]].push(0);
				});

				time.push(finishedFrames / numFrames);
				finishedFrames++;
			}
		});

		Object.entries(this.morphDict).forEach(([key]) => {
			let i = this.morphDict[key];
			let track = new NumberKeyframeTrack(
				`${"Face"}.morphTargetInfluences[${i}]`,
				time,
				animation[i]
			);
			tracks.push(track);
		});

		console.log("********* Animations *********", animation);
		console.log("********* TIME *********", time);
		console.log("********* Frames *********", finishedFrames);
		console.log("********* tracks *********", tracks);

		const clip = new AnimationClip("animation", -1, tracks);
		let action = this.mixer.clipAction(clip);
		action.play();
		action.loop = THREE.LoopOnce;

		this.mixer.addEventListener("finished", (e) => {
			console.log("finished", e);
		});
		// *******************************************************************************************

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
		// this.audio.resume();
		// this.audio.context.resume();

		console.log("Audio Setup Done!");
		return Promise.resolve("Audio Setup Done!");
	}

	async loadLipSyncData() {
		const data = await this.loaders.loadFileByURL("/json/BotIntro.json");
		// const data = await this.loaders.loadFileByURL("/json/blendData.json");
		this.lipSyncJson = JSON.parse(data);
		console.log("LipSync Data Setup Done!");
		return Promise.resolve("LipSync Data Setup Done!");
	}

	addGUIControls() {
		const gui = new GUI();
		for (const [key, value] of Object.entries(this.morphDict)) {
			gui.add(this.morphInf, value, 0, 1, 0.01)
				.name(key.replace("blendShape1.", ""))
				.listen(this.morphInf);
		}

		// this.controls = {
		// 	play: false,
		// 	selectedAudio: "Bot-Intro", // Placeholder for selected audio file
		// };
		// const options = {
		// 	BotIntro: "Bot-Intro",
		// 	BotIntro2: "Bot-Intro1",
		// };

		// // Add controls to Dat.GUI
		// gui.add(this.controls, "play")
		// 	.name("Play")
		// .onChange((value) => {
		// 	if (this.controls.play) this.audio.play();
		// 	else this.audio.pause();
		// 	this.playLipSyncAnimation();
		// });
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

	update(delta) {
		if (this.mixer) this.mixer.update(delta);
		// if(this.audio){
		// 	if (this.controls.play) this.audio.play();
		// 	else this.audio.stop();
		// }

		// if (this.allResourcesLoaded) {
		// 	// this.playLipSyncAnimation();
		// }
	}

	// ************************************* LipSync In Update Code *************************************

	playLipSyncAnimation() {
		console.log(this.audio.isPlaying);

		if (this.audio.isPlaying) {
			const context = this.audio.context; // Get the audio context from the audio object
			const currentAudioTime = context.currentTime; // Get the current time of the audio playback
			console.log(currentAudioTime);
			// console.log(this.lipSyncJson.mouthCues.length)

			Object.keys(LIP_POSE).forEach((value) => {
				this.head.morphTargetInfluences[
					this.head.morphTargetDictionary[value]
				] = 0;
				this.teeth.morphTargetInfluences[
					this.teeth.morphTargetDictionary[value]
				] = 0;
			});

			for (let i = 0; i < this.lipSyncJson.mouthCues.length; i++) {
				const mouthCue = this.lipSyncJson.mouthCues[i];
				if (
					currentAudioTime >= mouthCue.start &&
					currentAudioTime <= mouthCue.end
				) {
					console.log("Yes");
					this.head.morphTargetInfluences[
						this.head.morphTargetDictionary[
							LIP_POSE[mouthCue.value]
						]
					] = 1;
					this.teeth.morphTargetInfluences[
						this.teeth.morphTargetDictionary[
							LIP_POSE[mouthCue.value]
						]
					] = 1;
				}
			}

			// const result = this.findObjectByTimestamp(
			// 	this.lipSyncJson.mouthCues,
			// 	currentAudioTime
			// );

			// if (result) {
			// 	console.log(result);
			// 	this.head.morphTargetInfluences[
			// 		this.head.morphTargetDictionary[LIP_POSE[result.value]]
			// 	] = 1;
			// 	this.teeth.morphTargetInfluences[
			// 		this.teeth.morphTargetDictionary[LIP_POSE[result.value]]
			// 	] = 1;
			// }
		}
	}

	playNormalAnimation(i) {
		console.log("h");
		const mouthCue = this.lipSyncJson.mouthCues[i];

		this.head.morphTargetInfluences[
			this.head.morphTargetDictionary[LIP_POSE[mouthCue.value]]
		] = THREE.MathUtils.lerp(
			this.head.morphTargetInfluences[
				this.head.morphTargetDictionary[LIP_POSE[mouthCue.value]]
			],
			1,
			0.5
		);
		this.teeth.morphTargetInfluences[
			this.head.morphTargetDictionary[LIP_POSE[mouthCue.value]]
		] = THREE.MathUtils.lerp(
			this.teeth.morphTargetInfluences[
				this.head.morphTargetDictionary[LIP_POSE[mouthCue.value]]
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

	// ************************************* LipSync In Update Code *************************************
}
