// Top of file and declaration section. //
// ------------------------------------ //

let largestNumber = 0n;

for (let index = 1; index < 54; index++) {
    largestNumber += BigInt(2 ** (1024 - index))
};
console.log(largestNumber)

//Creates audio context.
const synthCtx = new AudioContext({
  latencyHint: "interactive",
  sampleRate: 48000,
  sinkId: ''
});

const gainNode = synthCtx.createGain();
gainNode.gain.value = 0.5

const volumeControl = document.getElementsByName("synth-param-'amp'")[0];

volumeControl.addEventListener(
  "input",
  () => {
    gainNode.gain.value = volumeControl.value / 2;
  },
  false,
);

// Decimal to fraction.
function decToFrac(value, tolerance = 1e-6) {
  if (value === parseInt(value)) {
    return { numerator: value, denominator: 1 };
  }

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let negative = false;

  if (value < 0) {
    negative = true;
    value = -value;
  }

  let integerPart = Math.floor(value);
  value -= integerPart;

  let b = value;
  do {
    let a = Math.floor(b);
    let aux_h = h1;
    let aux_k = k1;
    h1 = a * h1 + h2;
    k1 = a * k1 + k2;
    h2 = aux_h;
    k2 = aux_k;
    b = 1 / (b - a);
  } while (Math.abs(value - h1 / k1) > value * tolerance);

  let finalNumerator = negative ? -(h1 + integerPart * k1) : (h1 + integerPart * k1);
  return { numerator: finalNumerator, denominator: k1 };
}

// All synth variables
let synthIdx = 0
let octave = 5
// Per synth variables.
let overtones = [1024]
let damping = [1]
let wavetype = [1]
let shift = [1]
let pull = [1]
let comb1 = [0]
let comb2 = [0]
let tension = [0]
let phaserComb1 = [0]
let phaserComb2 = [0]
let sinePhaser = [0] 
// Stores the overtones for each synth.
let synthArray = []
// Array of frequencies.
let frequencyArray = []

// ------------------------------------- //
// Oscillator creation and math section. //
// ------------------------------------- //

//Frequency ratio calculations.
function synthOvertoneFrequencies(synthIndex, overtoneIndex) {
    return Math.abs(wavetype[synthIndex] + (shift[synthIndex] * overtoneIndex) * (pull[synthIndex] ** overtoneIndex));
}
//Amplitude calculations.
function synthOvertoneAmplitudes(synthIndex, overtoneIndex) {
    return wavetype[synthIndex] * damping[synthIndex] * (1 / (synthOvertoneFrequencies(synthIndex, overtoneIndex) ** damping[synthIndex])) ** ((tension[synthIndex] + (overtoneIndex + 1)) / (overtoneIndex + 1)) * (Math.sign((overtoneIndex + ((Math.sign(comb1[synthIndex]) + 1) / 2)) % comb1[synthIndex]) ** Math.abs(Math.sign(comb1[synthIndex]))) * (Math.sign((overtoneIndex + ((Math.sign(comb2[synthIndex]) + 1) / 2)) % comb2[synthIndex]) ** Math.abs(Math.sign(comb2[synthIndex])));
}
function synthOvertonePhases(synthIndex, overtoneIndex, part) {
    let phase = ((Math.sign(overtoneIndex % phaserComb1[synthIndex]) ** Math.abs(Math.sign(phaserComb1[synthIndex]))) * Math.sign(phaserComb1[synthIndex])) + ((Math.sign(overtoneIndex % phaserComb2[synthIndex]) ** Math.abs(Math.sign(phaserComb2[synthIndex]))) / 2 * Math.sign(phaserComb2[synthIndex])) + (((2 * (overtoneIndex / Math.max(Math.abs(sinePhaser[synthIndex]) * Math.sign(sinePhaser[synthIndex]),1)) - 1) * Math.PI) / Math.max(overtoneIndex,1)) * sinePhaser[synthIndex]
    switch (part) {
        case "real":
            return Math.PI * phase - (Math.PI / 2);
        case "imag":
            return Math.PI * phase;
    
        default: console.log('Value for "part" is not acceptable.')
            break;
    };   
};
//Combination.
function synthOvertones(synthIndex, synthName) {
    let currentPreset = {}
    let perSynthOvertoneFrequencies = [];
    let perSynthOvertoneAmplitudes = [];
    let perSynthOvertonePhasesImag = [];
    let perSynthOvertonePhasesReal = [];
    
    for (let overtoneIndex = 0; overtoneIndex < overtones[synthIndex]; overtoneIndex++) {
        if (synthOvertoneFrequencies(synthIndex, overtoneIndex + 1) < largestNumber / BigInt(1000)) {    
            perSynthOvertoneFrequencies[overtoneIndex] = (synthOvertoneFrequencies(synthIndex, overtoneIndex));
            perSynthOvertoneAmplitudes[overtoneIndex] = (synthOvertoneAmplitudes(synthIndex, overtoneIndex));
            perSynthOvertonePhasesImag[overtoneIndex] = (synthOvertonePhases(synthIndex, overtoneIndex, "imag"));
            perSynthOvertonePhasesReal[overtoneIndex] = (synthOvertonePhases(synthIndex, overtoneIndex, "real"));  
        } else {
            break;
        }
    };

    currentPreset.name = synthName;
    currentPreset.overtoneRatios = perSynthOvertoneFrequencies;
    currentPreset.overtoneAmplitudes = perSynthOvertoneAmplitudes;
    currentPreset.overtonePhasesImag = perSynthOvertonePhasesImag;
    currentPreset.overtonePhasesReal = perSynthOvertonePhasesReal;

    synthArray[synthIndex] = currentPreset;
    
    return synthArray[synthIndex];
}
//Create synthesizer function.
function synthesizer(synthIndex, synthName, numb1, numb2, numb3, numb4, numb5, numb6, numb7, numb8, numb9, numb10, numb11) {
    overtones[synthIndex] = numb1;
    damping[synthIndex] = numb2;
    wavetype[synthIndex] = numb3;
    shift[synthIndex] = numb4;
    pull[synthIndex] = numb5;
    comb1[synthIndex] = numb6;
    comb2[synthIndex] = numb7;
    tension[synthIndex] = numb8;
    phaserComb1[synthIndex] = numb9;
    phaserComb2[synthIndex] = numb10;
    sinePhaser[synthIndex] = numb11;
    
    if (typeof synthName == "string") {
        synthOvertones(synthIndex, synthName);
        return console.log(synthArray)
    } else {
        return "Synth name must be a string!"
    }
};
//Find synth function.
function findSynth(name) {
    switch (typeof name) {
        case "number":
            return synthArray[name];
        case "string":
            for (let index = 0; index < synthArray.length; index++) {
                if (synthArray[index].synthName === name) {
                    return synthArray[index];
                };
            };

            return "404: synth not found. Please check your spelling or try finding your synth by its index."
    
        default:
            return "You must enter either the synth name (string) or the synth index (number). All other datatypes are invalid.";
    };

};

// -------------------------------- //
// Sound and visualization section. //
// -------------------------------- //

// Occillator visualization. (Will not display if any "harmonic" ratio is equal to 0).
let customWaveform = synthCtx.createPeriodicWave([0, 0], [0, 0]);
const oscCvs = document.getElementById("occiloscope-canvas");
const oscCtx = oscCvs.getContext("2d");
oscCtx.imageSmoothingEnabled = false;

function loadOcciloscope(sampleCount, synthIndex) {
    // Stops all occillators and clears the frequency array to remove bugs.
    for (let i = 0; i < frequencyArray.length; i++) {
        if (typeof(frequencyArray[i]) == "object") {
            if (frequencyArray[i].playing) {
                frequencyArray[i].osc.stop();
            } else {
                frequencyArray[i].osc.start();
                frequencyArray[i].osc.stop();
            };
            frequencyArray[i] = "Marked as empty!";
        }
    };

    frequencyArray = [];
    // Converts wavetype and shift values to proper fractional form for best results.
    let wavtp = Number(document.getElementsByName("synth-param-'wavetype'")[0].value);
    let shft = Number(document.getElementsByName("synth-param-'shift'")[0].value);
    if (wavtp % 1 != 0 || shift % 1 != 0) {
        document.getElementsByName("synth-param-'wavetype'")[0].value = decToFrac(wavtp / shft).numerator;
        document.getElementsByName("synth-param-'shift'")[0].value = decToFrac(wavtp / shft).denominator;
        wavetype[synthIndex] = decToFrac(wavtp / shft).numerator;
        shift[synthIndex] = decToFrac(wavtp / shft).denominator;
        return loadOcciloscope(sampleCount, synthIndex);
    };
    // Create the custom periodic wave to use as the periodic waveform.
    // 'Wavetype' and 'Shift' parameters should both be integers for best results.
    let real = [0]
    let imag = [0]
    let i = 1
    let overtonesTotal = 0
    while (overtonesTotal < overtones[synthIndex]) {
        for (let overtoneIndex = 0; overtoneIndex < overtones[synthIndex]; overtoneIndex++) {
            if (i == synthOvertoneFrequencies(synthIndex, overtoneIndex)) {
                real[i] = synthOvertoneAmplitudes(synthIndex, overtoneIndex) * -Math.cos(synthOvertonePhases(synthIndex, overtoneIndex, "real"));
                imag[i] = synthOvertoneAmplitudes(synthIndex, overtoneIndex) * -Math.cos(synthOvertonePhases(synthIndex, overtoneIndex, "imag"));
                overtonesTotal++
            } else {
                real.push(0);
                imag.push(0);
            };
        };

        i++;
    };

    console.log({"Real Part": real, "Imag Part": imag});
    customWaveform = synthCtx.createPeriodicWave(real, imag);

    // Draw the oscillator.
    // Draw Mode: Normal
    oscCtx.clearRect(0, 0, oscCvs.width, oscCvs.height);
    oscCtx.strokeStyle = "rgb(0, 185, 185)";
    oscCtx.fillStyle = "rgb(0, 185, 185)";
    let waveformSamplesArray = [];
    let sineSamplesArray = [];
    let vectorformSamplesArray = [];
    let maxVal = 0;
    if (document.getElementsByName('sinusoidal-view')[0].checked === false) {
        oscCtx.lineWidth = 1;

        for (let samplePoint = 0; samplePoint < sampleCount; samplePoint++) {
            let currentVal = 0;
            for (let overtoneIndex = 0; overtoneIndex < synthArray[synthIndex].overtoneAmplitudes.length; overtoneIndex++) {
                currentVal += Math.sin((synthOvertoneFrequencies(synthIndex, overtoneIndex) * 2 * Math.PI) * (samplePoint / sampleCount) + synthOvertonePhases(synthIndex, overtoneIndex, "imag")) * synthOvertoneAmplitudes(synthIndex, overtoneIndex);
                if (Math.abs(currentVal) > maxVal) {
                    maxVal = Math.abs(currentVal);
                };
            };
            waveformSamplesArray.push(currentVal)
        };
        let x = (0 / (sampleCount / 400));
        let y = waveformSamplesArray[0] / maxVal * -100 + 104;
        oscCtx.moveTo(x,y);
        oscCtx.beginPath();
        for (let index = 1; index < waveformSamplesArray.length; index++) {
            x = (index / (sampleCount / 400));
            y = waveformSamplesArray[index] / maxVal * -100 + 104;
            oscCtx.lineTo(x,y);
        };
        oscCtx.stroke();
    };
    // Draw Mode: Sinusoidal
    if (document.getElementsByName('sinusoidal-view')[0].checked) {
        oscCtx.lineWidth = 0.5;
        let currentVal = 0;

        for (let overtoneIndex = 0; overtoneIndex < synthArray[synthIndex].overtoneAmplitudes.length; overtoneIndex++) {
            for (let samplePoint = 0; samplePoint <= sampleCount; samplePoint++) {
                currentVal = Math.sin((synthOvertoneFrequencies(synthIndex, overtoneIndex) * 2 * Math.PI) * (samplePoint / sampleCount) + synthOvertonePhases(synthIndex, overtoneIndex, "imag")) * synthOvertoneAmplitudes(synthIndex, overtoneIndex);
                if (Math.abs(currentVal) > maxVal) {
                    maxVal = Math.abs(currentVal);
                };
                sineSamplesArray.push(currentVal)
            };
        };
        let x = 0;
        let y = sineSamplesArray[0] / maxVal * -100 + 104;;
        oscCtx.moveTo(x, y);
        oscCtx.beginPath();
        for (let sample = 1; sample < sineSamplesArray.length; sample++) {
            x = (sample / (sampleCount / 400)) % 401
            y = sineSamplesArray[sample] / maxVal * -100 + 104;
            if ((sample / (sampleCount / 400)) % 401 == 0) {
                oscCtx.moveTo(x, y);
            } else {
                oscCtx.lineTo(x, y);
            };
        };
        oscCtx.stroke();
    };
    // Draw Mode: Fourier Vector (Unused)
    if (largestNumber === 0) {
        if (Number(document.getElementsByName('wave-param-sample-rate')[0].value) < Number(document.getElementsByName("synth-param-'overtones'")[0].value) * 10) {
            alert("The drawing sample rate must be at least 10x the number of overtones for an accurate result.")
        };

        let maxValX = 0;
        let maxValY = 0;
        for (let sampleAngle = 0; sampleAngle < sampleCount; sampleAngle++) {
            let currentValX = 0;
            let currentValY = 0;
            for (let overtoneIndex = 0; overtoneIndex < synthArray[synthIdx].overtoneAmplitudes.length; overtoneIndex++) {
                currentValX += synthOvertoneAmplitudes(synthIdx, overtoneIndex) * Math.cos(2 * Math.PI * (sampleAngle / sampleCount) * synthOvertoneFrequencies(synthIdx, overtoneIndex) + synthOvertonePhases(synthIdx, overtoneIndex, "imag"))
                currentValY += synthOvertoneAmplitudes(synthIdx, overtoneIndex) * Math.sin(2 * Math.PI * (sampleAngle / sampleCount) * synthOvertoneFrequencies(synthIdx, overtoneIndex) + synthOvertonePhases(synthIdx, overtoneIndex, "imag"))
                if (Math.abs(currentValX) > maxValX) {
                    maxValX = Math.abs(currentValX);
                };
                if (Math.abs(currentValY) > maxValY) {
                    maxValY = Math.abs(currentValY);
                };
            };
            vectorformSamplesArray.push([currentValX, currentValY]);
        };
        let vx = vectorformSamplesArray[0][0];
        let vy = vectorformSamplesArray[0][1];
        oscCtx.moveTo(vx,vy);
        oscCtx.beginPath();
        for (let index = 1; index < vectorformSamplesArray.length; index++) {
            vx = 100 * vectorformSamplesArray[index][0] / Math.max(maxValX, maxValY) + oscCvs.width / 2;
            vy = 100 * -vectorformSamplesArray[index][1] / Math.max(maxValX, maxValY) + oscCvs.height / 2;
            oscCtx.lineTo(vx,vy);
        };
        oscCtx.closePath();

        oscCtx.stroke();
    };

    return waveformSamplesArray, console.log("Preset " + synthIndex + " occiloscope loaded.");
};

// Graph section.
const graphCvs = document.getElementById("graph-canvas");
const graphCtx = graphCvs.getContext("2d");
graphCtx.lineWidth = 1;
graphCtx.strokeStyle = "rgb(0, 180, 180)";
graphCtx.fillStyle = "rgb(0, 0, 0)";
graphCtx.imageSmoothingEnabled = false;
const preRenderGraphCvs = new OffscreenCanvas(400, 208)
const preRenderGraphCtx = preRenderGraphCvs.getContext("2d",{ alpha: true, desynchronized: true, willReadFrequently: true });
preRenderGraphCtx.lineWidth = 1;
preRenderGraphCtx.strokeStyle = "rgb(0, 180, 180)";
preRenderGraphCtx.fillStyle = "rgb(0, 0, 0)";
preRenderGraphCtx.imageSmoothingEnabled = false;

// Set up the visualizer.
const oscAnalyser = synthCtx.createAnalyser();
oscAnalyser.fftSize = 4096;
oscAnalyser.smoothingTimeConstant = 0.8;
oscAnalyser.minDecibels = -90;
oscAnalyser.maxDecibels = 0;

const bufferLength = oscAnalyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

let visualToggle = false
document.getElementsByName('toggle-visualizer-type')[0].addEventListener(
  "input",
  () => {
    visualToggle = document.getElementsByName('toggle-visualizer-type')[0].checked;
    visualizerToggle();
  },
  false,
);

const drawOsc = () => {
    requestAnimationFrame(drawOsc);

    oscAnalyser.getByteTimeDomainData(dataArray);
    
    graphCtx.clearRect(0, 0, graphCvs.width, graphCvs.height);
    graphCtx.fillStyle = "black";
    graphCtx.fillRect(0, 0, graphCvs.width, graphCvs.height);

    graphCtx.beginPath();

    const sliceWidth = (graphCvs.width / bufferLength);
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 256.0;
        const y = (v * graphCvs.height);

        if (i === 0) {
        graphCtx.moveTo(x, y);
        } else {
        graphCtx.lineTo(x, y);
        }

        x += sliceWidth;
    };

    graphCtx.lineTo(graphCvs.width, graphCvs.height / 2);
    graphCtx.stroke();
};

const drawSpect = () => {
    drawVisual = requestAnimationFrame(drawSpect);

    oscAnalyser.getByteFrequencyData(dataArray);

    graphCtx.clearRect(0, 0, graphCvs.width, graphCvs.height);
    graphCtx.fillStyle = "black";
    graphCtx.fillRect(0, 0, graphCvs.width, graphCvs.height);

    /* graphCtx.drawImage(graphCvs, -1, 0, graphCvs.width, graphCvs.height);
    graphCtx.clearRect(graphCvs.width, 0, 2, graphCvs.height); */
    
    function frequencyToAxis(frequency, minFreq, maxFreq, canvasDim) {
        const minLog = Math.log10(minFreq);
        const maxLog = Math.log10(maxFreq);
        const range = maxLog - minLog;
        let axis = ((Math.log10(frequency) - minLog) / range) * canvasDim * 1.7; // Other constant: 1.3
        return axis;
    };

    const barWidth = (graphCvs.width / bufferLength) * 4;
    let x = 0;

    graphCtx.beginPath();

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 256 * graphCvs.height;

        graphCtx.lineTo(frequencyToAxis(x, 1, 20000, graphCvs.width), graphCvs.height - barHeight);

        x += barWidth / 4;
    };

    
    graphCtx.stroke();

    /* let y = 0;

    for (let i = 0; i < bufferLength; i++) {
        const pixelIntensity = dataArray[i] / 256;

        graphCtx.fillStyle = 'rgb(0,' + 180 * pixelIntensity + ', ' + 180 * pixelIntensity + ')';
        graphCtx.fillRect(399, graphCvs.height - 1 - frequencyToAxis(y, 1, 20000, graphCvs.height), 1, 1);
        preRenderGraphCtx.fillStyle = 'rgb(0,' + 180 * pixelIntensity + ', ' + 180 * pixelIntensity + ')';
        preRenderGraphCtx.fillRect(399, graphCvs.height - 1 - frequencyToAxis(y, 1, 20000, graphCvs.height), 1, 1);

        y += 1;
    }; */
};

function visualizerToggle() {
    if (visualToggle == true) {
        graphCtx.clearRect(0, 0, graphCvs.width, graphCvs.height);
        graphCtx.fillRect(0, 0, graphCvs.width, graphCvs.height);
        oscAnalyser.getByteFrequencyData(dataArray);
        drawSpect();
    } else {
        graphCtx.clearRect(0, 0, graphCvs.width, graphCvs.height);
        graphCtx.fillRect(0, 0, graphCvs.width, graphCvs.height);
        oscAnalyser.getByteTimeDomainData(dataArray);
        drawOsc();
    };
};

// Set frequency function.
function setFrequency(action, numb) {
    switch (action) {
        case "set":
            // Checks if 'numb' is already in the array.
            for (let index = 0; index < frequencyArray.length; index++) {
                if (frequencyArray[index].freq == numb) {
                    return
                };
            }
            // Adds 'numb' to the array, trying to replace the first "Marked as empty!" entry it finds.
            for (let index = 0; index < frequencyArray.length; index++) {
                if (frequencyArray[index] === "Marked as empty!") {
                    frequencyArray[index] = {
                        "freq": numb,
                        "osc": synthCtx.createOscillator(),
                        "playing": true,
                        "keyboardbtn": null
                    };
                    frequencyArray[index].osc.setPeriodicWave(customWaveform);
                    frequencyArray[index].osc.frequency.setValueAtTime((440 * (2 ** ((3 + numb)/12))) / wavetype[synthIdx] * (2 ** (octave - 5)), synthCtx.currentTime);
                    frequencyArray[index].osc.connect(gainNode).connect(oscAnalyser).connect(synthCtx.destination);
                    frequencyArray[index].osc.start();
                    frequencyArray[index].keyboardbtn = document.getElementById(numb);
                    if (frequencyArray[index].keyboardbtn.className === "keybtn-type-2") {
                        frequencyArray[index].keyboardbtn.style.color = 'rgb(0, 255, 255)';
                        frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(64, 64, 80)';
                    } else {
                        frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(0, 255, 255)';
                    };
                    frequencyArray[index].keyboardbtn.style.borderRadius = '1px';
                    return;
                };
            };
            let index = frequencyArray.length
            frequencyArray.push({
                        "freq": numb,
                        "osc": synthCtx.createOscillator(),
                        "playing": true,
                        "keyboardbtn": null
            });
            frequencyArray[index].osc.setPeriodicWave(customWaveform);
            frequencyArray[index].osc.frequency.setValueAtTime((440 * (2 ** ((3 + numb)/12))) / wavetype[synthIdx] * (2 ** (octave - 5)), synthCtx.currentTime);
            frequencyArray[index].osc.connect(gainNode).connect(oscAnalyser).connect(synthCtx.destination);
            frequencyArray[index].osc.start();
            frequencyArray[index].keyboardbtn = document.getElementById(numb);
            if (frequencyArray[index].keyboardbtn.className === "keybtn-type-2") {
                frequencyArray[index].keyboardbtn.style.color = 'rgb(0, 255, 255)';
                frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(64, 64, 80)';
            } else {
                frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(0, 255, 255)';
            };
            frequencyArray[index].keyboardbtn.style.borderRadius = '1px';
            return;
        case "unset":
            // Removes 'numb' from the array as long as it's in the array.
            for (let index = 0; index < frequencyArray.length; index++) {
                if (frequencyArray[index].freq === numb) {
                    frequencyArray[index].osc.stop();
                    if (frequencyArray[index].keyboardbtn.className == "keybtn-type-2") {
                        frequencyArray[index].keyboardbtn.style.color = 'rgb(0, 185, 185)';
                        frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(24, 24, 26)';
                    } else {
                        frequencyArray[index].keyboardbtn.style.backgroundColor = 'rgb(0, 185, 185)';
                    };
                    frequencyArray[index].keyboardbtn.style.borderRadius = '2px';
                    frequencyArray[index] = "Marked as empty!";
                    return;
                };
            };

            return "Something went wrong";

        default:
            return 'Your selected action was not a valid action. The valid actions are: "set" and "unset."';
    };
};

// ------------------------------- //
// General event listener section. //
// ------------------------------- //

let synthParamsInputHTML = [
    document.getElementsByName(`synth-param-'amp'`)[0],
    document.getElementsByName(`synth-param-'overtones'`)[0],
    document.getElementsByName(`synth-param-'damping'`)[0],
    document.getElementsByName(`synth-param-'wavetype'`)[0],
    document.getElementsByName(`synth-param-'shift'`)[0],
    document.getElementsByName(`synth-param-'pull'`)[0],
    document.getElementsByName(`synth-param-'comb1'`)[0],
    document.getElementsByName(`synth-param-'comb2'`)[0],
    document.getElementsByName(`synth-param-'tension'`)[0],
    document.getElementsByName(`synth-param-'phaserComb1'`)[0],
    document.getElementsByName(`synth-param-'phaserComb2'`)[0],
    document.getElementsByName(`synth-param-'sinePhaser'`)[0],
];

document.getElementById('set-default-params-btn').addEventListener('click', () => {
    synthParamsInputHTML[0].value = "1";
    synthParamsInputHTML[1].value = "1024";
    synthParamsInputHTML[2].value = "1";
    synthParamsInputHTML[3].value = "1";
    synthParamsInputHTML[4].value = "1";
    synthParamsInputHTML[5].value = "1";
    synthParamsInputHTML[6].value = "0";
    synthParamsInputHTML[7].value = "0";
    synthParamsInputHTML[8].value = "0";
    synthParamsInputHTML[9].value = "0";
    synthParamsInputHTML[10].value = "0";
    synthParamsInputHTML[11].value = "0";
    document.getElementsByName(`wave-param-sample-rate`)[0].value = 400;
    return
});

function synthesize() {
    synthesizer(
    Number(document.getElementsByName(`synth-index-input`)[0].value),
    (document.getElementsByName(`synth-name-input`)[0].value),
    Number(synthParamsInputHTML[1].value),
    Number(synthParamsInputHTML[2].value),
    Number(synthParamsInputHTML[3].value), 
    Number(synthParamsInputHTML[4].value), 
    Number(synthParamsInputHTML[5].value), 
    Number(synthParamsInputHTML[6].value), 
    Number(synthParamsInputHTML[7].value), 
    Number(synthParamsInputHTML[8].value), 
    Number(synthParamsInputHTML[9].value), 
    Number(synthParamsInputHTML[10].value), 
    Number(synthParamsInputHTML[11].value),
    );
    visualizerToggle();
    return loadOcciloscope(document.getElementsByName(`wave-param-sample-rate`)[0].value, Number(document.getElementsByName(`synth-index-input`)[0].value));
};

document.getElementById("save-preset-btn").addEventListener("click", () => {
    synthIdx = Number(document.getElementsByName(`synth-index-input`)[0].value);    
    return synthesize();
});

document.getElementById("load-preset-btn").addEventListener("click", () => {
    synthIdx = Number(document.getElementsByName(`synth-index-input`)[0].value);
    let synthIndex = Number(document.getElementsByName(`synth-index-input`)[0].value);
    synthesizer(
    synthIndex,
    findSynth(synthIndex).name,
    overtones[synthIndex],
    damping[synthIndex],
    wavetype[synthIndex], 
    shift[synthIndex], 
    pull[synthIndex], 
    comb1[synthIndex], 
    comb2[synthIndex], 
    tension[synthIndex], 
    phaserComb1[synthIndex], 
    phaserComb2[synthIndex], 
    sinePhaser[synthIndex],
    );
    visualizerToggle();
    loadOcciloscope(document.getElementsByName(`wave-param-sample-rate`)[0].value, synthIndex);
    return alert('The preset named "' + findSynth(synthIndex).name + '" has been loaded!');
});

document.getElementById("export-wav-button").addEventListener("click", () => {
    synthIdx = Number(document.getElementsByName(`synth-index-input`)[0].value);
    const sampleRate = synthCtx.sampleRate;
    const durationSeconds = 1;
    const numChannels = 1;
    const bytesPerSample = 2 * numChannels;
    const bytesPerSecond = sampleRate * bytesPerSample;
    const dataLength = bytesPerSecond * durationSeconds;
    const headerLength = 44;
    const fileLength = dataLength + headerLength;
    const bufferData = new Uint8Array(fileLength);
    const dataView = new DataView(bufferData.buffer);
    const writer = createWriter(dataView);

    // HEADER
    writer.string("RIFF");
    // File Size
    writer.uint32(fileLength);
    writer.string("WAVE");

    writer.string("fmt ");
    // Chunk Size
    writer.uint32(16);
    // Format Tag
    writer.uint16(1);
    // Number Channels
    writer.uint16(numChannels);
    // Sample Rate
    writer.uint32(sampleRate);
    // Bytes Per Second
    writer.uint32(bytesPerSecond);
    // Bytes Per Sample
    writer.uint16(bytesPerSample);
    // Bits Per Sample
    writer.uint16(bytesPerSample * 8);
    writer.string("data");

    writer.uint32(dataLength);

    // Audio generation. (Can take a few seconds.)
    let waveformSamplesArray = []
    let maxVal = 0
    for (let samplePoint = 0; samplePoint < sampleRate; samplePoint++) {
        let currentVal = 0;
        for (let overtoneIndex = 0; overtoneIndex < synthArray[synthIdx].overtoneAmplitudes.length; overtoneIndex++) {
            currentVal += Math.sin((synthOvertoneFrequencies(synthIdx, overtoneIndex) * 2 * Math.PI) * (samplePoint / sampleRate) + synthOvertonePhases(synthIdx, overtoneIndex, "imag")) * synthOvertoneAmplitudes(synthIdx, overtoneIndex);
            if (Math.abs(currentVal) > maxVal) {
                maxVal = Math.abs(currentVal);
            };
        };
        waveformSamplesArray.push(currentVal)
    };
    // Audio normaliztion
    for (let i = 0; i < waveformSamplesArray.length; i++) {
        waveformSamplesArray[i] *= 1 / maxVal
    };
    // Write to buffer.
    for (let i = 0; i < dataLength / 2; i++) {
        const val = waveformSamplesArray[i];
        writer.pcm16s(val);
    }
    // Write to blob.
    const waveBlob = new Blob([dataView.buffer], { type: 'application/octet-stream' });
    // Download blob.
    let waveBlobURL = URL.createObjectURL(waveBlob)
    let downloadLink = document.getElementById('Link')
    // Set the file to be downloaded and it's name + extension.
    downloadLink.href = waveBlobURL;
    downloadLink.download = wavetype[synthIdx] + "-" + shift[synthIdx] + "-" + pull[synthIdx] + "_" + comb1[synthIdx] + "," + comb2[synthIdx] + "," + tension[synthIdx] + "_" + phaserComb1[synthIdx] + "," + phaserComb2[synthIdx] + "," + sinePhaser[synthIdx] + "_" + findSynth(synthIdx).name + "_" + ".wav";
    // "Click" the "link."
    downloadLink.click();
    // Removes the blob url to free memory.
    URL.revokeObjectURL(waveBlob);

    function createWriter(dataView) {
    let pos = 0;

    return {
            string(val) {
                for (let i = 0; i < val.length; i++) {
                    dataView.setUint8(pos++, val.charCodeAt(i));
                }
            },
            uint16(val) {
                dataView.setUint16(pos, val, true);
                pos += 2;
            },
            uint32(val) {
                dataView.setUint32(pos, val, true);
                pos += 4;
            },
            pcm16s: function(value) {
                value = Math.round(value * 32768);
                value = Math.max(-32768, Math.min(value, 32767));
                dataView.setInt16(pos, value, true);
                pos += 2;
            },
        }
    }
});

// This function will be executed when a key is pressed.
document.addEventListener('keydown', () => {
    switch (event.key) {
        case "`":
            setFrequency("set", -2);
            break;
        case "q":
            setFrequency("set", 0);
            break;
        case "2":
            setFrequency("set", 1);
            break;
        case "w":
            setFrequency("set", 2);
            break;
        case "3":
            setFrequency("set", 3);
            break;
        case "e":
            setFrequency("set", 4);
            break;
        case "r":
            setFrequency("set", 5);
            break;
        case "5":
            setFrequency("set", 6);
            break;
        case "t":
            setFrequency("set", 7);
            break;
        case "6":
            setFrequency("set", 8);
            break;
        case "y":
            setFrequency("set", 9);
            break;
        case "7":
            setFrequency("set", 10);
            break;
        case "u":
            setFrequency("set", 11);
            break;
        case "i":
            setFrequency("set", 12);
            break;
        case "9":
            setFrequency("set", 13);
            break;
        case "o":
            setFrequency("set", 14);
            break;
        case "0":
            setFrequency("set", 15);
            break;
        case "p":
            setFrequency("set", 16);
            break;
        case "[":
            setFrequency("set", 17);
            break;
        case "=":
            setFrequency("set", 18);
            break;
        case "]":
            setFrequency("set", 19);
            break;
        case "Backspace":
            setFrequency("set", 20);
            break;
        case `\\`:
            setFrequency("set", 21);
            break;
        case "z":
            setFrequency("set", -12);
            break;
        case "s":
            setFrequency("set", -11);
            break;
        case "x":
            setFrequency("set", -10);
            break;
        case "d":
            setFrequency("set", -9);
            break;
        case "c":
            setFrequency("set", -8);
            break;
        case "v":
            setFrequency("set", -7);
            break;
        case "g":
            setFrequency("set", -6);
            break;
        case "b":
            setFrequency("set", -5);
            break;
        case "h":
            setFrequency("set", -4);
            break;
        case "n":
            setFrequency("set", -3);
            break;
        case "j":
            setFrequency("set", -2);
            break;
        case "m":
            setFrequency("set", -1);
            break;
        case ",":
            setFrequency("set", 0);
            break;
        case "l":
            setFrequency("set", 1);
            break;
        case ".":
            setFrequency("set", 2);
            break;
        case ";":
            setFrequency("set", 3);
            break;
        case "/":
            setFrequency("set", 4);
            break;
        case "Enter":
            synthIdx = Number(document.getElementsByName(`synth-index-input`)[0].value);    
            return synthesize();
    };
});

// This function will be executed when a key is released.
document.addEventListener('keyup', () => {
    switch (event.key) {
        case "`":
            setFrequency("unset", -2);
            break;
        case "q":
            setFrequency("unset", 0);
            break;
        case "2":
            setFrequency("unset", 1);
            break;
        case "w":
            setFrequency("unset", 2);
            break;
        case "3":
            setFrequency("unset", 3);
            break;
        case "e":
            setFrequency("unset", 4);
            break;
        case "r":
            setFrequency("unset", 5);
            break;
        case "5":
            setFrequency("unset", 6);
            break;
        case "t":
            setFrequency("unset", 7);
            break;
        case "6":
            setFrequency("unset", 8);
            break;
        case "y":
            setFrequency("unset", 9);
            break;
        case "7":
            setFrequency("unset", 10);
            break;
        case "u":
            setFrequency("unset", 11);
            break;
        case "i":
            setFrequency("unset", 12);
            break;
        case "9":
            setFrequency("unset", 13);
            break;
        case "o":
            setFrequency("unset", 14);
            break;
        case "0":
            setFrequency("unset", 15);
            break;
        case "p":
            setFrequency("unset", 16);
            break;
        case "[":
            setFrequency("unset", 17);
            break;
        case "=":
            setFrequency("unset", 18);
            break;
        case "]":
            setFrequency("unset", 19);
            break;
        case "Backspace":
            setFrequency("unset", 20);
            break;
        case "\\":
            setFrequency("unset", 21);
            break;
        case "z":
            setFrequency("unset", -12);
            break;
        case "s":
            setFrequency("unset", -11);
            break;
        case "x":
            setFrequency("unset", -10);
            break;
        case "d":
            setFrequency("unset", -9);
            break;
        case "c":
            setFrequency("unset", -8);
            break;
        case "v":
            setFrequency("unset", -7);
            break;
        case "g":
            setFrequency("unset", -6);
            break;
        case "b":
            setFrequency("unset", -5);
            break;
        case "h":
            setFrequency("unset", -4);
            break;
        case "n":
            setFrequency("unset", -3);
            break;
        case "j":
            setFrequency("unset", -2);
            break;
        case "m":
            setFrequency("unset", -1);
            break;
        case ",":
            setFrequency("unset", 0);
            break;
        case "l":
            setFrequency("unset", 1);
            break;
        case ".":
            setFrequency("unset", 2);
            break;
        case ";":
            setFrequency("unset", 3);
            break;
        case "/":
            setFrequency("unset", 4);
            break;
        case "4":
            octave--;
            break;
        case "8":
            octave++;
            break;
        case "f":
            octave--;
            break;
        case "k":
            octave++;
            break;
        case "Shift":
            octave = 5;
            break;
    };
});

document.getElementById('the-manual-button').addEventListener('click', () => {
    let manualDiv = document.getElementsByClassName('manual-container')[0];
    let checkboxes = [document.getElementsByTagName('input')[15],document.getElementsByTagName('input')[16]];
    manualDiv.style.display = 'flex';
    checkboxes[0].style.visibility = 'hidden';
    checkboxes[1].style.visibility = 'hidden';
});

document.getElementsByClassName('close-button')[0].addEventListener('click', () => {
    let manualDiv = document.getElementsByClassName('manual-container')[0];
    let checkboxes = [document.getElementsByTagName('input')[15],document.getElementsByTagName('input')[16]];
    manualDiv.style.display = 'none';
    checkboxes[0].style.visibility = 'visible';
    checkboxes[1].style.visibility = 'visible';
});