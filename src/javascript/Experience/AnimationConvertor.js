// import {
// 	AnimationClip,
// 	NumberKeyframeTrack,
// } from 'three';

// function createAnimation(animationData, morphTargetDictionary, bodyPart) {
//   const fps = 60;
//   const mouthCues = animationData.mouthCues;

//   if (!mouthCues || mouthCues.length === 0) { return null; }

//   const tracks = [];

//   for (let i = 0; i < Object.keys(morphTargetDictionary).length; i++) {
//     const blendShapeKey = Object.keys(morphTargetDictionary)[i];
//     const morphTargetIndex = morphTargetDictionary[blendShapeKey];

//     const keyframes = [];
//     let previousValue = 0;
//     let previousTime = 0;

//     for (const cue of mouthCues) {
//       const value = mapCueToBlendShapeValue(cue.value); // Map cue value to blend shape value

//       if (value !== previousValue) {
//         keyframes.push(previousTime / fps, previousValue);
//         keyframes.push(cue.start, value);
//       }

//       previousTime = cue.end * fps;
//       previousValue = value;
//     }

//     // Add the last keyframe
//     keyframes.push(previousTime / fps, previousValue);

//     const track = new NumberKeyframeTrack(`${bodyPart}.morphTargetInfluences[${morphTargetIndex}]`, keyframes);
//     tracks.push(track);
//   }

//   const clip = new AnimationClip('animation', -1, tracks);
//   return clip;
// }

// function mapCueToBlendShapeValue(cueValue) {
//   // Define your mapping logic here based on the cue values and blend shape values
//   // For example:
//   switch (cueValue) {
//     case "A":
//       return 0.5;
//     case "B":
//       return 1.0;
//     case "C":
//       return 0.0;
//     // Add more cases for other cue values as needed
//     default:
//       return 0.0; // Default value
//   }
// }

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

function createAnimation2(animationData, morphTargetDictionary, bodyPart){
    const fps = 60;
    const mouthCues = animationData.mouthCues;

    if (!mouthCues || mouthCues.length === 0) { return null; }

    const animation = [];

    for (let i = 0; i < Object.keys(morphTargetDictionary).length; i++) {
        animation.push([]);
    }

    let time = []
    let finishedFrames = 0

    // Object.entries(morphTargetDictionary).forEach(([key, value]) =>{
    //     console.log(key, value)
    //     animation[morphTargetDictionary[key]].push(1)
    //     time.push(finishedFrames / fps)
    //     finishedFrames++;
    // })

    mouthCues.forEach(mouthCue => {
      console.log(morphTargetDictionary[VISEME_DATA[mouthCue.value]])
      animation[morphTargetDictionary[VISEME_DATA[mouthCue.value]]].push(1);
      time.push(finishedFrames / fps)
      finishedFrames++;
    });
    console.log(animation)
    console.log(time, finishedFrames)

    let tracks = []
    let flag = false;

    mouthCues.forEach(mouthCue => {
          let i = morphTargetDictionary[VISEME_DATA[mouthCue.value]];
          let track = new NumberKeyframeTrack(`${bodyPart}.morphTargetInfluences[${i}]`, time, animation[i])
          tracks.push(track)
    });

    const clip = new AnimationClip('animation', -1, tracks);
    return clip
    
}

// export default createAnimation2;



// **********************************************************
import {
	AnimationClip,
	NumberKeyframeTrack,
	BooleanKeyframeTrack,
	ColorKeyframeTrack,
	Vector3,
	VectorKeyframeTrack
} from 'three';

var fps = 60

function modifiedKey(key) {

  if (["eyeLookDownLeft", "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight"].includes(key)) {
    return key
  }

  if (key.endsWith("Right")) {
    return key.replace("Right", "_R");
  }
  if (key.endsWith("Left")) {
    return key.replace("Left", "_L");
  }
  return key;
}

function createAnimation (recordedData, morphTargetDictionary, bodyPart) {

  // console.log("----morphTargetDictionary", morphTargetDictionary)
  
  if (recordedData.length != 0) {
    let animation = []
    for (let i = 0; i < Object.keys(morphTargetDictionary).length; i++) {
      animation.push([])
    }
    // console.log(animation)
    
    let time = []
    let finishedFrames = 0
    recordedData.forEach((d, i) => {
      console.log("d: ", d)
      console.log("i: ", i)
        Object.entries(d.blendshapes).forEach(([key, value]) => {
          // console.log("blendsaphes: ", key, value)
          if (! (modifiedKey(key) in morphTargetDictionary)) {return};
          
          if (key == 'mouthShrugUpper') {
            value += 0.4;
          }
          console.log(key, value,morphTargetDictionary[modifiedKey(key)])
          animation[morphTargetDictionary[modifiedKey(key)]].push(value)
        });
        time.push(finishedFrames / fps)
        finishedFrames++

    })

    // console.log("-----animation", animation);

    let tracks = []

    let flag = false;
    //create morph animation
    Object.entries(recordedData[0].blendshapes).forEach(([key, value]) => {
      if (! (modifiedKey(key) in morphTargetDictionary)) {return};
      
      let i = morphTargetDictionary[modifiedKey(key)]
      // console.log("***", key, i)
      
      // if (bodyPart === "HG_TeethLower") {

      //       if (flag === true)
      //         return;
            
      //       if(key === 'jawOpen') {
      //         let track2 = new NumberKeyframeTrack(`HG_TeethLower.morphTargetInfluences[${i}]`, time, animation[i])
      //         tracks.push(track2)
      //         flag = true
      //       }
      // } else {
        let track = new NumberKeyframeTrack(`${bodyPart}.morphTargetInfluences[${i}]`, time, animation[i])

        tracks.push(track)
  
      // }

      
      // if (key === "jawOpen") {
      //   let track2 = new NumberKeyframeTrack(`HG_TeethLower.morphTargetInfluences[${i}]`, time, animation[i])
      //   tracks.push(track2)
      //   console.log("----jawOpen Track", track2);
      // }
    });

    const clip = new AnimationClip('animation', -1, tracks);
    return clip
  }
  return null
}








////////////////////////////////////////////////////

////////////////////////////////////////////////////




// export default createAnimation;
export default createAnimation2;
// module.exports  = {createAnimation, createAnimation2};