import {playAnimationFromStart} from './animation.js';

const recordWebmButton = document.querySelector("#saveWebmButton");
const recordMp4Button = document.querySelector("#saveMp4Button");

export let recording = false;
let mediaRecorder;
let recordedChunks;
let mimeType = "video/mp4;";
let extension = "mp4";

recordWebmButton.addEventListener("click", (clickEvent) => {
    mimeType = "video/webm;";
    extension = "webm";
    recordWebmButton.innerHTML = 'Recording';
    recordWebmButton.className += " recording";
    startRecording();
});
recordMp4Button.addEventListener("click", (clickEvent) => {
    mimeType = "video/mp4;";
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
    const stream = canvas.captureStream(25);
    var options = { mimeType: mimeType,
        type: 'video',
        width: 200,
        height: 700
    };
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    mediaRecorder.ondataavailable = e => {
        if(e.data.size > 0){
            recordedChunks.push(e.data);
        }
    };
    mediaRecorder.start();
    playAnimationFromStart();
}

/**
 * Finished recording actions. Called in animation.js when animation
 * reaches the end
 */
export function finishedRecording() {
    mediaRecorder.stop();
    recording = false;
    setTimeout(() => {
        const blob = new Blob(recordedChunks, {
        type: mimeType
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording." + extension;
        a.click();
        URL.revokeObjectURL(url);
    },5);
    
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
