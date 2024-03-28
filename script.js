import {Profile, updateProfileDiv} from './profile.js';
import {playAnimationFromStart, drawFrame} from './animation.js';
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
allChatMessages.push(new ChatMessage("Hello world", chatProfiles[1]));
allChatMessages.push(new ChatMessage("Hello world", chatProfiles[1]));
allChatMessages.push(new ChatMessage("Hello world", chatProfiles[1]));

// Some glue to get the chatmessage variable into the animation module
function drawFrameParent() {
    drawFrame(allChatMessages);
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
    
    /**
     * Onload
     */
    setCanvasSize();
    updateProfileDiv(document.getElementById("profiles"), chatProfiles);
    window.requestAnimationFrame(drawFrameParent);
});
