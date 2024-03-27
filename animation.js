/**
 * Layout of the chat bubbles:
 * unlike a real text chat, the layout should initially be centered
 * vertically, so the first text message slides up to the middle of the screen
 * As messages are added they should remain centered vertically until they fill
 * the screen and then slide up like a normal text chat.
 *
 * To do this calculation, we keep a desired y position and an
 * actual y position.
 *
 * New bubbles are placed with an actual position just off screen,
 * all desired positions are updated, then eased to their new positions.
 */

import { recording, finishedRecording } from './recording.js';
import {ChatMessage} from './chatMessage.js';

var frameNumber = 0;
var frameRate = 60;
var canvas = document.getElementById("animCanvas");

// How long the messages should spend sliding onto the screen
var animationDurationMessageSlideUp = 3.0;
// How long the messages should spend stationary
var animationDurationMessageHold = 3.0;
var chatBubbleWidthPercent = 0.70;
var chatBubbleSpacingPixels = 5;
var currentMessageIndex = 0;


/**
 * Draw a frame on the canvas.
 * To be called by window.requestAnimationFrame in script.js
 * @param allChatMessages   Array of ChatMessage class
 */
export function drawFrame(allChatMessages) {
    canvas = document.getElementById("animCanvas");
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx);
    
    var {idxOfMessagesOnScreen, timeIntoThisMessage} = getOnScreenMessageIndex(allChatMessages);
    if (currentMessageIndex != idxOfMessagesOnScreen) {
        currentMessageIndex = idxOfMessagesOnScreen
     // set all the start positions
        for (var i = 0; i <= currentMessageIndex; i++) {
            allChatMessages[i].startPosition = allChatMessages[i].actualPosition;
        }
    }
    
    
    ctx.fillStyle = "rgb(127 0 0 / 40%)";
    ctx.strokeStyle = ctx.fillStyle;
    layout(allChatMessages, frameNumber / frameRate, canvas);
    drawAllTextBubbles(ctx, allChatMessages, canvas);
    
    frameNumber += 1;
    if (frameNumber > frameRate * 20.0) {
        if (recording) {
            finishedRecording();
        }
        frameNumber = 0;
        for (var i = 0; i < allChatMessages.length; i++) {
            allChatMessages[i].desiredPosition = 1.1;
            allChatMessages[i].actualPosition = 1.1;
            allChatMessages[i].startPosition = 1.1;
        }
    }
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
    ctx.fill();
    
    //console.log(`Drawing rect ${x} ${y} ${width} ${height}`);
}

/**
 * Draw a text bubble at a given y position (top of the bubble)
 * @param ctx   the drawing context
 * @param message  the ChatMessage item
 * @param left  boolean - if the bubble is on the left or right of the screen
 * @param y     y position of the text in percent
 * @param canvas    canvas element (for width)
 * @return      the height of the text bubble in pixels
 */
function drawTextBubble(ctx, message, left, y, canvas) {
    const bubbleWidth = Math.floor(chatBubbleWidthPercent * canvas.width);
    const startHeight = Math.floor(y * canvas.height);
    roundedRect(ctx, 10, startHeight, bubbleWidth, message.getHeight(bubbleWidth), 20);
}

/**
 * Go through all the messages, drawing up to the current message
 * Get the current shown messages from the frameNumber (and math)
 *
 */
function drawAllTextBubbles(ctx, messages, canvas) {
    for (var message of messages) {
        drawTextBubble(ctx, message, true, message.actualPosition, canvas);
    }
}

/**
 * Get the index up to which messages are currently on screen - or sliding
 * on screen. Also return the time the current message has been animating for
 * @param chatMessages  array of ChatMessage
 * @return {indexOfCurrentMessage, timeIntoMessageAnimation}
 */
function getOnScreenMessageIndex(chatMessages) {
    const elapsedTime = frameNumber / frameRate;
    const timePerMessage = animationDurationMessageHold + animationDurationMessageSlideUp;
    const idxOfMessagesOnScreen = Math.min(chatMessages.length - 1,
                                           Math.floor(elapsedTime / timePerMessage));
    const startTimeThisMessage = timePerMessage * idxOfMessagesOnScreen;
    const timeIntoThisMessage = elapsedTime - startTimeThisMessage;
    return {idxOfMessagesOnScreen, timeIntoThisMessage};
}

/**
 * Get the pixel height of all on-screen messages.
 * @param chatMessages  Array of ChatMessage class
 * @param canvas        The canvas element
 */
function getOnScreenMessagesSize(chatMessages, canvas) {
    var totalSize = 0;
    if (currentMessageIndex >= chatMessages.length || currentMessageIndex < 0) {
        console.log("Error in animation.js: getOnScreenMessagesSize");
        return 0;
    }
    for (var i = 0; i <= currentMessageIndex; i++) {
        totalSize += chatMessages[i].getHeight(canvas.width * chatBubbleWidthPercent);
    }
    return totalSize + chatBubbleSpacingPixels * currentMessageIndex;
}

/**
 * Set the positions of all chatMessages
 * @param chatMessages  array of ChatMessage class
 * @param elapsedTime   time in seconds since start of animation
 * @param canvas        the canvas (for width and height)
 */
function layout(chatMessages, elapsedTime, canvas) {
    const bubbleWidth = chatBubbleWidthPercent * canvas.width;
    // Get the height of on-screen chat messages
    const onScreenHeightPixels = getOnScreenMessagesSize(chatMessages, canvas);
    //console.log(`Total messages height ${onScreenHeightPixels}`);
    
    var baseHeight = 1.0;
    if (onScreenHeightPixels > canvas.height) {
        baseHeight = 1.0 - (chatBubbleSpacingPixels / canvas.height);
    } else {
        baseHeight = 0.5 + (onScreenHeightPixels / (canvas.height * 2));
    }
    for (var i = currentMessageIndex; i >= 0; i--) {
        const thisBubbleHeight = chatMessages[i].getHeight(bubbleWidth) / canvas.height;
        chatMessages[i].desiredPosition = baseHeight - thisBubbleHeight
        //console.log(`${baseHeight} ${chatMessages[i].desiredPosition}`);
        baseHeight -= thisBubbleHeight + (chatBubbleSpacingPixels / canvas.height);
    }
    // Desired positions now set.
    
    
    // Set the actual positions.
    var {x, timeIntoThisMessage} = getOnScreenMessageIndex(chatMessages);
    //console.log(`Time into animation: ${timeIntoThisMessage}`);
    
    for (var i = 0; i < chatMessages.length; i++) {
        if (timeIntoThisMessage < animationDurationMessageSlideUp) {
            const movePercent = timeIntoThisMessage / animationDurationMessageSlideUp;
            const totalDist = chatMessages[i].desiredPosition - chatMessages[i].startPosition;
            chatMessages[i].actualPosition = chatMessages[i].startPosition + (totalDist * movePercent);
        } else {
            chatMessages[i].actualPosition = chatMessages[i].desiredPosition;
        }
        
    }
}
