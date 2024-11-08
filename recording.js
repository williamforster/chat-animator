import {playAnimationFromStart} from './animation.js';

const recordWebmButton = document.querySelector("#saveWebmButton");
const recordMp4Button = document.querySelector("#saveMp4Button");
const recordGifButton = document.querySelector("#saveGifButton");

export let recording = false;
export let gifRecording = false;
// Global for recording frames to gif
export let gifRecord = new GIF({
    workers: 2,
    quality: 10
});
let mediaRecorder;
let recordedChunks;
let mimeType = "video/mp4;";
let extension = "mp4";

recordWebmButton.addEventListener("click", (clickEvent) => {
    mimeType = bestWebmCodec;
    extension = "webm";
    recordWebmButton.innerHTML = 'Recording';
    recordWebmButton.className += " recording";
    startRecording();
});
recordMp4Button.addEventListener("click", (clickEvent) => {
    mimeType = bestMp4Codec;
    extension = "mp4";
    recordMp4Button.innerHTML = 'Recording';
    recordMp4Button.className += " recording";
    startRecording();
});

recordGifButton.addEventListener("click", (clickEvent) => {
    recordGifButton.innerHTML = 'Recording';
    recordGifButton.className += " recording";
    const canvas = document.querySelector("#animCanvas");
    
    gifRecord = new GIF({
        workers: 3,
        quality: 12
    });
    
    
    gifRecord.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.gif";
        a.click();
        URL.revokeObjectURL(url);
        returnButtonsToNormal();
    });
    
    playAnimationFromStart();
    gifRecording = true;
});

function startRecording() {
    const canvas = document.querySelector("#animCanvas");
    const bitRateInput = document.querySelector("#bitRate");
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert("Video type not supported by user");
        returnButtonsToNormal();
        return;
    }
    if (!Number(bitRateInput.value)) {
        alert("Invalid bitrate set by user");
        returnButtonsToNormal();
        return;
    }
    recording = true;
    const stream = canvas.captureStream(60);
    var options = { mimeType: mimeType,
        type: 'video',
        width: canvas.width,
        height: canvas.height,
        videoBitsPerSecond: bitRateInput.value
    };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    mediaRecorder.ondataavailable = e => {
        if(e.data.size > 0){
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.start();
    mediaRecorder.onstop = (e) => {
        const blob = new Blob(recordedChunks, {
        type: mimeType
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording." + extension;
        a.click();
        URL.revokeObjectURL(url);
    }
    playAnimationFromStart();
}

/**
 * Finished recording actions. Called in animation.js when animation
 * reaches the end
 */
export function finishedRecording() {
    if (recording) {
        mediaRecorder.stop();
        recording = false;
        returnButtonsToNormal();
    }
    if ( gifRecording ) {
        gifRecording = false;
        gifRecord.render();
        recordGifButton.innerHTML = 'rendering';
    }
    
}

/***
 * When recording the buttons say 'recording'. After they should be
 * returned to normal by this function.
 */
function returnButtonsToNormal() {
    recordMp4Button.innerHTML = 'Save .mp4';
    recordMp4Button.className = "saveButton";
    recordWebmButton.innerHTML = 'Save .webm';
    recordWebmButton.className = "saveButton";
    recordGifButton.innerHTML = 'Save .gif';
    recordGifButton.className = "saveButton";
}

/**
 * Call MediaRecorder.isTypeSupported on a bunch of codecs to find
 * the best one that is supported.
 */
function getSupportedCodec(media, types, codecs) {
    const isSupported = MediaRecorder.isTypeSupported;
    const supportedArray = [];
    types.forEach((type) => {
        const mimeType = `${media}/${type}`;
        codecs.forEach((codec) => [
            `${mimeType};codecs=${codec}`,
            `${mimeType};codecs=${codec.toUpperCase()}`,
        ].forEach(variation => {
            if(isSupported(variation))
                supportedArray.push(variation);
        }));
        //if (isSupported(mimeType))
        //    supportedArray.push(mimeType);
    });
    return supportedArray;
}

const videoTypes = ["webm", "ogg", "mp4", "x-matroska"];
const audioTypes = ["webm", "ogg", "mp3", "x-matroska"];
const codecs = ["vp9", "vp9.0", "vp8", "vp8.0", "avc1", "av1", "h265", "h.265", "h264", "h.264", "opus", "pcm", "aac", "mpeg", "mp4a"];

const bestMp4Codec = getSupportedCodec("video", ["mp4"], codecs)[0];
const bestWebmCodec = getSupportedCodec("video", ["webm"], codecs)[0];
