import {Profile, updateProfileDiv} from './profile.js';
import {playAnimationFromStart, drawFrame, AnimationSettings} from './animation.js';
import {ChatMessage} from './chatMessage.js';

// The image/name pairs that are displayed
var chatProfiles = [];
chatProfiles.push(new Profile('Grump', './char1.svg', '#218aff', true));
chatProfiles.push(new Profile('Jane', './senior-transparent.svg', '#d8d8d8'));
chatProfiles.push(new Profile('Chad', './char2.svg'));
chatProfiles.push(new Profile('Tischman', './char3.svg'));

// All chat messages, whether on screen yet or not
var allChatMessages = [];
allChatMessages.push(new ChatMessage("Hello world", chatProfiles[0]));
allChatMessages.push(new ChatMessage("Hello world this is a longer message.", chatProfiles[1]));
allChatMessages.push(new ChatMessage("Hello world 😃", chatProfiles[1]));
allChatMessages.push(new ChatMessage("Hello world", chatProfiles[1]));

var animationSettings = new AnimationSettings();

// Some glue to get the chatmessage variable into the animation module
function drawFrameParent() {
    drawFrame(allChatMessages, animationSettings);
    window.requestAnimationFrame(drawFrameParent);
}

document.addEventListener('DOMContentLoaded', () => {
    /**
     * Onchange of the canvas size inputs. Change the canvas size,
     * or log to console if either size input is non-numeric
     */
    // Access the input field and the element to resize
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const resizeableElement = document.getElementById('animCanvas');
    const animationDurationInput = document.getElementById('animationDuration');
    const holdDurationInput = document.getElementById('holdDuration');
    const startDelayInput = document.getElementById('startDelay');
    const fontInput = document.getElementById('font');
    
    function setCanvasSize() {
        // Get the current value of the input field
        const newWidth = canvasWidthInput.value;
        const newHeight = canvasHeightInput.value;
        // Check if the input is a positive number
        if (newWidth > 0 && newHeight > 0) {
            var existingCanvas = document.getElementById('animCanvas');
            
            if (existingCanvas) {
                // Get the parent element of the canvas
                var parentElement = existingCanvas.parentNode;
                
                // Remove the existing canvas from the DOM
                parentElement.removeChild(existingCanvas);
                
                parentElement.innerHTML = '<canvas id="animCanvas" width="' + newWidth + '" height="' + newHeight+ '"></canvas>';
            }
        } else {
            console.log("Invalid value for canvas size");
        }
    }
    
    canvasWidthInput.addEventListener('input', function() {
        setCanvasSize();
    });
    canvasHeightInput.addEventListener('input', function() {
        setCanvasSize();
    });
    animationDurationInput.value = animationSettings.durationMessageSlideUp;
    animationDurationInput.addEventListener('input', function() {
        if (Number(animationDurationInput.value)) {
            animationSettings.durationMessageSlideUp = Number(animationDurationInput.value);
            playAnimationFromStart();
            //console.log(`Set animDuration ${animationDurationInput.value}`);
        }
    });
    holdDurationInput.value = animationSettings.durationMessageHold;
    holdDurationInput.addEventListener('input', function() {
        if (Number(holdDurationInput.value)) {
            animationSettings.durationMessageHold = Number(holdDurationInput.value);
            playAnimationFromStart();
        }
    });
    startDelayInput.value = animationSettings.startDelay;
    startDelayInput.addEventListener('input', function() {
        if (Number(startDelayInput.value)) {
            animationSettings.startDelay = Number(startDelayInput.value);
            playAnimationFromStart();
        }
    });
    fontInput.addEventListener('input', function() {
        animationSettings.font = fontInput.value;
        var parts = fontInput.value.replace('px', '').split(' ');
        animationSettings.lineHeight = Number(parts[0]) * 1.2;
        playAnimationFromStart();
    });
    
    
    /**
     * Onload
     */
    setCanvasSize();
    updateProfileDiv(document.getElementById("profiles"), chatProfiles);
    window.requestAnimationFrame(drawFrameParent);
});
