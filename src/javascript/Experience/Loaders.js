import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { AudioLoader } from 'three';





export default class Loaders {
	constructor(ThreeEnvironment) {
        const {renderer, camera} = ThreeEnvironment;
        this.setupLoaders();


    }

    setupLoaders(){
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( 'https://unpkg.com/three@0.160.x/examples/jsm/libs/draco/gltf/' );

		this.gltfLoader = new GLTFLoader();
        this.gltfLoader.setDRACOLoader( dracoLoader );

        this.fbxLoader = new FBXLoader()
        this.audioLoader = new AudioLoader();
        this.fileLoader = new THREE.FileLoader()
        THREE.Cache.enabled = true;
    }


    // GLTF Loader
	loadGltfByUrl(url) {
		return new Promise((resolve, reject) => {
			this.gltfLoader.load(
				url,
				(gltf) => {
                    // console.log("done laoding model!")
					resolve(gltf);
				},
				(xhr) => {},
				(error) => {
					console.log("Error Occured while loading model: ", error);
					reject(error);
				}
			);
		});
	}


    loadFBXByUrl(url){
		return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (model) => {
					resolve(model);
                },
                (xhr) => {
                    // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                },
                (error) => {
                    console.log(error)
                }
            )
        });
    }
    

    loadModels(modelPaths) {
        const loadPromises = Object.entries(modelPaths).map(([modelName, modelPath]) => {
            return new Promise((resolve, reject) => {
                console.log(`Loading ${modelName}`);
                this.loadFBXByUrl(modelPath, modelName)
                    .then(gltf => {
                        console.log(`Loaded ${modelName}`)
                        resolve({ [modelName]: gltf });
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        });
    
        return Promise.all(loadPromises)
            .then(modelsArray => {
                // Combine the loaded models into a single object
                return modelsArray.reduce((accumulator, current) => {
                    return { ...accumulator, ...current };
                }, {});
            });
    }

    loadGLTFModels(modelPaths) {
        const loadPromises = Object.entries(modelPaths).map(([modelName, modelPath]) => {
            return new Promise((resolve, reject) => {
                console.log(`Loading ${modelName}`);
                this.loadGltfByUrl(modelPath, modelName)
                    .then(gltf => {
                        console.log(`Loaded ${modelName}`)
                        resolve({ [modelName]: gltf });
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        });
    
        return Promise.all(loadPromises)
            .then(modelsArray => {
                // Combine the loaded models into a single object
                return modelsArray.reduce((accumulator, current) => {
                    return { ...accumulator, ...current };
                }, {});
            });
    }
    

    // GLTF Loader
	loadAudioByURL(url) {
		return new Promise((resolve, reject) => {
			this.audioLoader.load(
				url,
				(buffer) => {
					resolve(buffer);
				},
				(xhr) => {},
				(error) => {
					console.log("Error Occured while loading Audio: ", error);
					reject(error);
				}
			);
		});
	}
    

    loadFileByURL(url){
		return new Promise((resolve, reject) => {
            this.fileLoader.load(url, ( data ) => {
                    resolve(data)
                },
                function ( xhr ) { 
                    // console.log('JSON Loading: ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
                }, // onProgress callback
                function ( err ) { console.error( 'An error happened' );} // onError callback
            );
        })
    }
    
}