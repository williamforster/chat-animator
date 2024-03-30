import {playAnimationFromStart} from './animation.js';

const recordWebmButton = document.querySelector("#saveWebmButton");
const recordMp4Button = document.querySelector("#saveMp4Button");

export let recording = false;
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

function startRecording() {
    const canvas = document.querySelector("#animCanvas");
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        alert("Video type not supported by user");
        returnButtonsToNormal();
        return;
    }
    recording = true;
    const stream = canvas.captureStream(60);
    var options = { mimeType: mimeType,
        type: 'video',
        width: canvas.width,
        height: canvas.height
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
    mediaRecorder.stop();
    recording = false;
    //setTimeout(() => {
    //},500);
    // The example has
    
    returnButtonsToNormal();
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
}

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
