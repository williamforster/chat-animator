import {Profile, updateProfileDiv} from './profile.js';
import {playAnimationFromStart, drawFrame, AnimationSettings, addAlpha} from './animation.js';
import {ChatMessage} from './chatMessage.js';

// The image/name pairs that are displayed
var chatProfiles = [];
chatProfiles.push(new Profile('Grump', './char1.svg', '#218aff', true, '#ffffff'));
chatProfiles.push(new Profile('Olivia', './senior-transparent.svg', '#d8d8d8'));
chatProfiles.push(new Profile('Chad', './char2.svg'));
chatProfiles.push(new Profile('Tischman', './char3.svg'));

// All chat messages, whether on screen yet or not
var allChatMessages = [];
allChatMessages.push(new ChatMessage("Have you heard about chat-animator?", chatProfiles[0]));
allChatMessages.push(new ChatMessage("It makes phone chat animations like this.", chatProfiles[0]));
allChatMessages.push(new ChatMessage("How cool 😃", chatProfiles[2]));
allChatMessages.push(new ChatMessage("You can use them anywhere for free! Even the profile pictures are free for commercial use.", chatProfiles[3]));
allChatMessages.push(new ChatMessage("Import the file into your video editor", chatProfiles[3]));

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
    const showNamesInput = document.getElementById('showNames');
    const backColorInput = document.getElementById('backColor');
    const backAlphaInput = document.getElementById('backAlpha');
    const newProfileButton = document.getElementById('newProfile');
    const newMessageButton = document.getElementById('newMessage');
    
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
        var widthParentDiv = document.getElementById("wrapper");
        const controlsDiv = document.getElementById("controlsDiv");
        var newWidth = Number(canvasWidthInput.value) + 100;
        if (widthParentDiv.getBoundingClientRect().width > 1024) {
            newWidth += Number(controlsDiv.getBoundingClientRect().width);
        }
        console.log(`setting minWidth=${newWidth}`);
        widthParentDiv.style.minWidth = newWidth + 'px';
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
    showNamesInput.addEventListener('input', () => {
        animationSettings.showNames = showNamesInput.checked;
    });
    function updateBackcolor() {
        animationSettings.backColor = addAlpha(backColorInput.value,
                                               backAlphaInput.value);
    }
    backColorInput.addEventListener('input', () => {
        updateBackcolor();
    });
    backAlphaInput.addEventListener('input', () => {
        updateBackcolor();
    });
    newProfileButton.addEventListener('click', () => {
        const lastProfile = chatProfiles[chatProfiles.length - 1];
        const newProfile = new Profile('','');
        newProfile.copy(lastProfile);
        chatProfiles.push(newProfile);
        updateProfileDiv(document.getElementById("profiles"), 
                         chatProfiles,
                         setupTextEntry,
                         deleteProfile);
        setupTextEntry();
    });
    newMessageButton.addEventListener('click', () => {
        allChatMessages.push(new ChatMessage("", chatProfiles[0]));
        setupTextEntry();
        playAnimationFromStart();
    });
    
    /**
     * Onload
     */
    setCanvasSize();
    updateProfileDiv(document.getElementById("profiles"), 
                     chatProfiles,
                     setupTextEntry,
                     deleteProfile);
    setupTextEntry();
    window.requestAnimationFrame(drawFrameParent);
});

/**
 * Set up the part where user enters the text that appears
 */
function setupTextEntry() {
    const textEntryDiv = document.getElementById("textFields");
    textEntryDiv.innerHTML = '';
    for (var i = 0; i < allChatMessages.length; i++) {
        const chatMessageRowDiv = document.createElement('div');
        chatMessageRowDiv.className = "messageRowDiv";
        
        const chatMsg = allChatMessages[i];
        const selectInput = document.createElement('select');
        for (var profile of chatProfiles) {
            const selectOption = document.createElement('option');
            selectOption.innerHTML = profile.profileName;
            selectOption.id = profile.profileName;
            selectOption.value = profile.profileName;
            selectInput.appendChild(selectOption);
        }
        selectInput.value = allChatMessages[i].profile.profileName;
        allChatMessages[i].selectInput = selectInput;
        
        selectInput.addEventListener('input', () => {
            for (var profile of chatProfiles) {
                if (profile.profileName == chatMsg.selectInput.value) {
                    chatMsg.profile = profile;
                    break;
                }
            }
            playAnimationFromStart();
        });
        chatMessageRowDiv.appendChild(selectInput);
        
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.value = allChatMessages[i].message;
        textInput.id = i;
        textInput.className = "messageInput";
        allChatMessages[i].textInput = textInput
        textInput.addEventListener('input', () => {
            chatMsg.message = textInput.value + ' ';
            playAnimationFromStart();
        });
        chatMessageRowDiv.appendChild(textInput);
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = "-";
        deleteButton.className = "deleteButton";
        if (i == 0) {
            deleteButton.disabled = true;
            deleteButton.className = "firstButton";
        }
        allChatMessages[i].deleteButton = deleteButton;
        deleteButton.addEventListener('click', (e) => {
            const index = allChatMessages.indexOf(chatMsg);
            console.log(index);
            allChatMessages.splice(index, 1);
            playAnimationFromStart();
            setupTextEntry();
        });
        chatMessageRowDiv.appendChild(deleteButton);
        
        textEntryDiv.appendChild(chatMessageRowDiv);
    }
}

function deleteProfile(profile) {
    if (chatProfiles.length > 1) {
        const index = chatProfiles.indexOf(profile);
        chatProfiles.splice(index, 1);
        console.log(chatProfiles.length);
        updateProfileDiv(document.getElementById("profiles"),
                         chatProfiles,
                         setupTextEntry,
                         deleteProfile);
        setupTextEntry();
    }
}
