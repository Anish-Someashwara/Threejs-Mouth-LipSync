import * as THREE from "three";
import { ThreeEnvSetup } from "./Experience/ThreeEnvSetup";


// HTML Elements
const canvas = document.getElementById("webgl");


init();



function init(){

    // ThreeJs Scene Setup
    const ThreeEnvSetupInstance = new ThreeEnvSetup(canvas);
    const scene = ThreeEnvSetupInstance.scene;
    const camera = ThreeEnvSetupInstance.camera;
    const renderer = ThreeEnvSetupInstance.renderer;

}


