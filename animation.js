import { recording, finishedRecording } from './recording.js';

const canvas = document.getElementById("animCanvas");
var frameNumber = 0

/**
 * Draw a frame on the canvas.
 * To be called by window.requestAnimationFrame in script.js
 */
export function drawFrame() {
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);
    
    ctx.fillStyle = "rgb(127 0 0 / 40%)";
    ctx.fillRect(frameNumber, 0, 40, 24);
    
    frameNumber += 1;
    if (frameNumber > 300) {
        if (recording) {
            finishedRecording();
        }
        frameNumber = 0;
    }
    window.requestAnimationFrame(drawFrame);
}

/**
 * Play animation from start
 */
export function playAnimationFromStart() {
    frameNumber = 0;
    // resetMessagePositions()
}

/**
 * Clear the canvas
 * @param context      the drawing context
 */
function clearCanvas(context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw a rounded rectangle with the current stroke and fill
 */
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.stroke();
}
