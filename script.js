import {Profile, updateProfileDiv} from './profile.js';
import {playAnimationFromStart, drawFrame, AnimationSettings, addAlpha} from './animation.js';
import {ChatMessage} from './chatMessage.js';

// The image/name pairs that are displayed
var chatProfiles = [];
chatProfiles.push(new Profile('Grump', './images/char1.svg', '#218aff', true, '#ffffff'));
chatProfiles.push(new Profile('Olivia', './images/senior-transparent.svg', '#d8d8d8'));
chatProfiles.push(new Profile('Chad', './images/char2.svg'));
chatProfiles.push(new Profile('Tischman', './images/char3.svg'));

// All chat messages, whether on screen yet or not
var allChatMessages = [];
allChatMessages.push(new ChatMessage("Have you heard about chat-animator?", chatProfiles[0]));
allChatMessages.push(new ChatMessage("It makes phone chat animations like this.", chatProfiles[0]));
allChatMessages.push(new ChatMessage("How cool 😃 ", chatProfiles[2]));
allChatMessages.push(new ChatMessage("You can use them anywhere for free! No attribution necessary. Even the customizable profile pictures are free for commercial use.", chatProfiles[3]));
allChatMessages.push(new ChatMessage("Import the file into your video editor", chatProfiles[3]));

var animationSettings = new AnimationSettings();
var fileInput;

// Some glue to get the chatmessage variable into the animation module
function drawFrameParent() {
    drawFrame(allChatMessages, animationSettings);
    window.requestAnimationFrame(drawFrameParent);
}

/**
 * Onchange of the canvas size inputs. Change the canvas size,
 * or log to console if either size input is non-numeric
 */
function setCanvasSize() {
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    // Get the current value of the input field
    const newWidth = canvasWidthInput.value;
    const newHeight = canvasHeightInput.value;
    // Check if the input is a positive number
    if (newWidth > 0 && newHeight > 0) {
        var existingCanvas = document.getElementById('animCanvas');
        
        if (existingCanvas) {
            existingCanvas.width = newWidth;
            existingCanvas.height = newHeight;
            playAnimationFromStart();
        }
    } else {
        console.log("Invalid value for canvas size");
    }
    
    // Now style the page so it fits
    const parentDiv = document.getElementById("canvasParent");
    parentDiv.style.width = (Number(newWidth) / 2) + 'px';
    parentDiv.style.height = (Number(newHeight) / 2) + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    // Access the input field and the element to resize
    const canvasWidthInput = document.getElementById('canvasWidth');
    const canvasHeightInput = document.getElementById('canvasHeight');
    const resizeableElement = document.getElementById('animCanvas');
    const animationDurationInput = document.getElementById('animationDuration');
    const holdDurationInput = document.getElementById('holdDuration');
    const startDelayInput = document.getElementById('startDelay');
    const fontInput = document.getElementById('font');
    const showNamesInput = document.getElementById('showNames');
    const showTailsInput = document.getElementById('showTails');
    const frameSpecifyInput = document.getElementById('frameSpecify');
    const backColorInput = document.getElementById('backColor');
    const backAlphaInput = document.getElementById('backAlpha');
    const newProfileButton = document.getElementById('newProfile');
    const newMessageButton = document.getElementById('newMessage');
    
    canvasWidthInput.addEventListener('change', function() {
        setCanvasSize();
    });
    canvasHeightInput.addEventListener('change', function() {
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
    showTailsInput.addEventListener('input', () => {
        animationSettings.showTails = showTailsInput.checked;
    });
    frameSpecifyInput.addEventListener('input', () => {
        animationSettings.frameSpecify = frameSpecifyInput.checked;
        holdDurationInput.disabled = frameSpecifyInput.checked;
        startDelayInput.disabled = frameSpecifyInput.checked;
        calculateStartFrames();
        setupTextEntry();
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
                         deleteProfile,
                         fileInput);
        setupTextEntry();
    });
    newMessageButton.addEventListener('click', () => {
        var newMsg = new ChatMessage("", chatProfiles[0]);
        if (animationSettings.frameSpecify) {
            var lastFrame = 0;
            for (var msg of allChatMessages) { lastFrame = Math.max(lastFrame, msg.enterFrame); }
            newMsg.enterFrame = lastFrame +
                animationSettings.frameRate *
                 (animationSettings.durationMessageSlideUp + animationSettings.durationMessageHold);
        }
        allChatMessages.push(newMsg);
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
                     deleteProfile,
                     fileInput);
    setupTextEntry();
    window.requestAnimationFrame(drawFrameParent);
});

/**
 * Set up the part where user enters the message text that appears
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

        if (animationSettings.frameSpecify) {
            const frameInput = document.createElement('input');
            frameInput.type = 'number';
            frameInput.value = allChatMessages[i].enterFrame;
            frameInput.addEventListener('input', () => {
                chatMsg.enterFrame = Number(frameInput.value);
                playAnimationFromStart();
            });
            chatMessageRowDiv.appendChild(frameInput);
        }
        
        if (allChatMessages[i].image instanceof HTMLImageElement) {
            const removeImageButton = document.createElement('img')
            removeImageButton.src = "./images/image-icon-delete.png";
            removeImageButton.addEventListener("click", (event) => {
                chatMsg.imageInput = null;
                chatMsg.image = null;
                chatMsg.textInput.disabled = false;
                chatMsg.textInput.style.backgroundColor = 'white';
                setupTextEntry();
            });
            removeImageButton.className = "removeImageButton";
            chatMessageRowDiv.appendChild(removeImageButton);
            //chatMessageRowDiv.appendChild(allChatMessages[i].imageInput);
            allChatMessages[i].textInput.disabled = true;
            allChatMessages[i].textInput.style.backgroundColor = '#ddd';
        } else {
            const imageInput = document.createElement('img');
            
            imageInput.src = "./images/image-icon.png";
            imageInput.className = "imageInput";
            allChatMessages[i].imageInput = imageInput
            //imageInput.value = allChatMessages[i].imagePath;
            imageInput.addEventListener("click", (event) => {
                let chatMsgClosure = chatMsg;
                if (window.FileReader) {
                    // Create a file input element dynamically
                    fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*'; // Accept only images
                    fileInput.addEventListener('input', (event) => {
                        const file = event.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                            chatMsgClosure.image = new Image();
                            chatMsgClosure.image.src = reader.result;
                            //chatMsgClosure.textInput.disabled = true;
                            //chatMsgClosure.textInput.style.backgroundColor = '#ddd';
                            setupTextEntry();
                        };
                        reader.readAsDataURL(file);
                    });
                    fileInput.click();
                }
                    
            });
            chatMessageRowDiv.appendChild(imageInput);
        }

        
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
        for (var message of allChatMessages) {
            if (message.profile == profile) {
                message.profile = chatProfiles[0];
            }
        }
        chatProfiles.splice(index, 1);
        console.log(chatProfiles.length);
        updateProfileDiv(document.getElementById("profiles"),
                         chatProfiles,
                         setupTextEntry,
                         deleteProfile,
                         fileInput);
        setupTextEntry();
    }
}

/**
 * Calculate a sensible start frame for all chat messages based
 * on the hold time and animation speed.
 */
function calculateStartFrames() {
    var frameNumber = 0;
    frameNumber += Math.floor(animationSettings.startDelay * animationSettings.frameRate);
    for (var i = 0; i < allChatMessages.length; i++) {
        allChatMessages[i].enterFrame = frameNumber;
        console.log(`Set message ${i} to enter frame ${frameNumber}`);
        frameNumber = Math.floor(frameNumber + 
            (animationSettings.durationMessageSlideUp + animationSettings.durationMessageHold) * 
            animationSettings.frameRate);
    }
}
