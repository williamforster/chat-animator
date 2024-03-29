/**
 * Layout of the chat bubbles:
 * unlike a real text chat, the layout should initially be centered
 * vertically, so the first text message slides up to the middle of the screen
 * As messages are added they should remain centered vertically until they fill
 * the screen and then slide up like a normal text chat.
 *
 * To do this calculation, we keep a desired y position, an
 * actual y position, and a start y position, updating the desired
 * and actual every frame, and updating the start position when it's
 * time for a new message.
 *
 * New bubbles are placed with an actual position just off screen.
 */

import { recording, finishedRecording } from './recording.js';
import {ChatMessage} from './chatMessage.js';

var frameNumber = 0;
var frameRate = 60;
var canvas = document.getElementById("animCanvas");

export class AnimationSettings {
    // How long the messages should spend sliding onto the screen
    durationMessageSlideUp = 0.5;
    // How long the messages should spend stationary
    durationMessageHold = 0.5;
    chatBubbleWidthPercent = 0.65;
    chatBubbleSpacingPixels = 20;
    // Text inset as a fraction of the total chat bubble width
    textInsetWidth = 0.06;
    // Text height inset as a fraction of the total chat bubble width
    textInsetHeight = 0.03;
    // Delay at the start (and end) of animation
    startDelay = 1.0;
    // pixels between vertical lines of text
    lineHeight = 20;
    font = "16px sans-serif";
    // Show names beside messages or do not show names
    showNames = true;
    nameSizePercent = 0.10;
    
    backColor = "#ffffff00";
    // nudge the profile pics away from the edge of screen
    nudgeProfiles = 5;
}

// Set to -1 as a reset flag for chat messages. This happens in the drawFrame function
// which has access to the chat messages.
var currentMessageIndex = -1;



/**
 * Draw a frame on the canvas.
 * To be called by window.requestAnimationFrame in script.js
 * @param allChatMessages   Array of ChatMessage class
 * @param animationSettings Object with settings for animation
 */
export function drawFrame(allChatMessages, animationSettings) {
    canvas = document.getElementById("animCanvas");
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas, animationSettings);
    
    // Reset the message positions
    if (currentMessageIndex === -1) {
        // resetMessagePositions
        for (var i = 0; i < allChatMessages.length; i++) {
            allChatMessages[i].desiredPosition = 1.1;
            allChatMessages[i].actualPosition = 1.1;
            allChatMessages[i].startPosition = 1.1;
        }
    }
    
    var {idxOfMessagesOnScreen, timeIntoThisMessage} = getOnScreenMessageIndex(allChatMessages, animationSettings);
    if (currentMessageIndex != idxOfMessagesOnScreen) {
        currentMessageIndex = idxOfMessagesOnScreen
        // set all the start positions
        for (var i = 0; i <= currentMessageIndex; i++) {
            allChatMessages[i].startPosition = allChatMessages[i].actualPosition;
        }
    }
    
    layout(ctx, allChatMessages, frameNumber / frameRate, canvas, animationSettings);
    drawAllTextBubbles(ctx, allChatMessages, canvas, animationSettings);
    
    frameNumber += 1;
    const finishTime = allChatMessages.length *
            (animationSettings.durationMessageHold + animationSettings.durationMessageSlideUp) +
            (2 * animationSettings.startDelay);
    if (frameNumber > frameRate * finishTime) {
        if (recording) {
            finishedRecording();
        }
        playAnimationFromStart();
    }
}

/**
 * Play animation from start
 */
export function playAnimationFromStart() {
    frameNumber = 0;
    currentMessageIndex = -1;
}

/**
 * Clear the canvas
 * @param context      the drawing context
 * @param canvas        the canvas element
 * @param animationSettings     yep
 */
function clearCanvas(context, canvas, animationSettings) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = animationSettings.backColor;
    context.rect(0,0,canvas.width, canvas.height);
    context.fill();
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
}

/**
 * Draw a text bubble at a given y position (top of the bubble)
 * @param ctx   the drawing context
 * @param message  the ChatMessage item
 * @param left  boolean - if the bubble is on the left or right of the screen
 * @param y     y position of the text in percent
 * @param canvas    canvas element (for width)
 * @param animationSettings     object containing the bubble width
 * @return      the height of the text bubble in pixels
 */
function drawTextBubble(ctx, message, left, y, canvas, animationSettings) {
    const bubbleWidth = Math.floor(animationSettings.chatBubbleWidthPercent * canvas.width);
    const textInsetWidth = bubbleWidth * animationSettings.textInsetWidth;
    const textInsetHeight = bubbleWidth * animationSettings.textInsetHeight;
    const textWidth = bubbleWidth - 2 * textInsetWidth;
    
    const startHeight = Math.floor(y * canvas.height);
    ctx.fillStyle = '#d8d8d8';
    if (message.profile.picker && message.profile.alpha) {
        const color = addAlpha(message.profile.picker.value, message.profile.alpha.value);
        ctx.fillStyle = color;
    }
    ctx.strokeStyle = ctx.fillStyle;
    var xPos = 10;
    if (!left) {
        xPos = canvas.width - 10 - bubbleWidth;
    }
    const nameSizePixels = canvas.width * animationSettings.nameSizePercent;
    if (animationSettings.showNames) {
        if (!left) {
            xPos -= nameSizePixels;
        } else {
            xPos += nameSizePixels;
        }
    }
    
    ctx.font = animationSettings.font;
    ctx.textBaseline = 'top';
    const messageHeight = message.getHeight(ctx,
                                            bubbleWidth,
                                            animationSettings);
    roundedRect(ctx, xPos, startHeight, bubbleWidth, messageHeight, 16);
    ctx.fillStyle = message.profile.textPicker.value;
    wrapTextAndDraw(ctx,
                    message.message,
                    xPos + textInsetWidth,
                    startHeight + textInsetHeight,
                    textWidth,
                    animationSettings.lineHeight);
    
    // Draw name
    const bottomHeight = startHeight + messageHeight + 10;
    drawName(ctx, message, bottomHeight, canvas, animationSettings);
    
    drawPicture(ctx, message, bottomHeight, canvas, animationSettings);
}

/**
 * Go through all the messages, drawing up to the current message
 * Get the current shown messages from the frameNumber (and math)
 * @param ctx   the drawing context
 * @param messages  array of ChatMessage - all messages
 * @param canvas    canvas element (for size calculations)
 * @param animationSettings     AnimationSettings Objects for size calcs
 */
function drawAllTextBubbles(ctx, messages, canvas, animationSettings) {
    for (var message of messages) {
        drawTextBubble(ctx,
                       message,
                       !message.profile.isMainPerson,
                       message.actualPosition,
                       canvas,
                       animationSettings);
    }
}

/**
 * Get the index up to which messages are currently on screen - or sliding
 * on screen. Also return the time the current message has been animating for
 * @param chatMessages  array of ChatMessage
 * @return {indexOfCurrentMessage, timeIntoMessageAnimation}
 */
function getOnScreenMessageIndex(chatMessages, animationSettings) {
    // Keep elapsed time at 0 until delay time is over
    const elapsedTime = Math.max((frameNumber / frameRate) -
                                 animationSettings.startDelay, 0.0);
    const timePerMessage = animationSettings.durationMessageHold +
                            animationSettings.durationMessageSlideUp;
    const idxOfMessagesOnScreen = Math.min(chatMessages.length - 1,
                    Math.floor(elapsedTime / timePerMessage));
    const startTimeThisMessage = timePerMessage * idxOfMessagesOnScreen;
    const timeIntoThisMessage = elapsedTime - startTimeThisMessage;
    return {idxOfMessagesOnScreen, timeIntoThisMessage};
}

/**
 * Get the pixel height of all on-screen messages.
 * @param ctx           The drawing context
 * @param chatMessages  Array of ChatMessage class
 * @param canvas        The canvas element
 */
function getOnScreenMessagesSize(ctx, chatMessages, canvas, animationSettings) {
    var totalSize = 0;
    if (currentMessageIndex >= chatMessages.length || currentMessageIndex < 0) {
        console.log("Error in animation.js: getOnScreenMessagesSize");
        return 20;
    }
    const bubbleWidth = canvas.width * animationSettings.chatBubbleWidthPercent;
    for (var i = 0; i <= currentMessageIndex; i++) {
        totalSize += chatMessages[i].getHeight(ctx,
                                               bubbleWidth,
                                               animationSettings);
    }
    return totalSize + animationSettings.chatBubbleSpacingPixels *
            currentMessageIndex;
}

/**
 * Set the positions of all chatMessages
 * @param ctx           the drawing context
 * @param chatMessages  array of ChatMessage class
 * @param elapsedTime   time in seconds since very start of animation
 * @param canvas        the canvas (for width and height)
 */
function layout(ctx, chatMessages, elapsedTime, canvas, animationSettings) {
    const bubbleWidth = animationSettings.chatBubbleWidthPercent * canvas.width;
    // Get the height of on-screen chat messages
    const onScreenHeightPixels = getOnScreenMessagesSize(ctx, chatMessages, canvas, animationSettings);
    //console.log(`Total messages height ${onScreenHeightPixels}`);
    
    var baseHeight = 1.0;
    if (onScreenHeightPixels > canvas.height) {
        baseHeight = 1.0 - (animationSettings.chatBubbleSpacingPixels /
                            canvas.height);
    } else {
        baseHeight = 0.5 + (onScreenHeightPixels / (canvas.height * 2));
    }
    for (var i = currentMessageIndex; i >= 0; i--) {
        const thisBubbleHeight = chatMessages[i].getHeight(ctx,
                                                           bubbleWidth,
                                                           animationSettings) / canvas.height;
        chatMessages[i].desiredPosition = baseHeight - thisBubbleHeight
        //console.log(`${baseHeight} ${chatMessages[i].desiredPosition}`);
        baseHeight -= thisBubbleHeight + 
                        (animationSettings.chatBubbleSpacingPixels / canvas.height);
    }
    // Desired positions now set.
    
    
    // Set the actual positions.
    var {x, timeIntoThisMessage} = getOnScreenMessageIndex(chatMessages, animationSettings);
    //console.log(`Time into animation: ${timeIntoThisMessage}`);
    
    for (var i = 0; i < chatMessages.length; i++) {
        if (timeIntoThisMessage < animationSettings.durationMessageSlideUp) {
            const movePercent = ease(timeIntoThisMessage /
                            animationSettings.durationMessageSlideUp);
            const totalDist = chatMessages[i].desiredPosition - chatMessages[i].startPosition;
            chatMessages[i].actualPosition = chatMessages[i].startPosition + (totalDist * movePercent);
        } else {
            chatMessages[i].actualPosition = chatMessages[i].desiredPosition;
        }
        
    }
}

/**
 * Add alpha value from 0-1.0 to a hex color
 */
export function addAlpha(color, opacity) {
    // coerce values so it is between 0 and 1.
    var _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    var opacityString = _opacity.toString(16).toUpperCase();
    if (opacityString.length == 1) {
        opacityString = '0' + opacityString;
    }
    return color + opacityString;
}

/**
 * Transform a percentage of movement 0 to 1, to an eased percentage, 0-1
 */
function ease(input) {
    return 1.0 - Math.exp(-6 * input);
}

/**
 * Draw text over multiple lines. Assume the ctx has
 * the correct fillstyle already
 * @param ctx   the drawing context
 * @param text  the string to draw
 * @param x     start x position (pixels)
 * @param y     start y position (pixels)
 * @param maxWidth  line width (pixels)
 * @param lineHeight (pixels)
 */
function wrapTextAndDraw(ctx, text, x, y, maxWidth, lineHeight) {
    // Split the initial text into words.
    var words = text.split(' ');
    var line = '';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for(var n = 0; n < words.length; n++) {
        // Test line with next word
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        
        // If the line is too wide, draw the current line and start a new one
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, Math.floor(x), Math.floor(y));
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    // Draw any remaining text
    ctx.fillText(line, x, y);
}

/**
 * Draw the name next to a text bubble.
 * @param ctx       the context
 * @param message   a ChatMessage object
 * @param bottomHeight   the y pixel baseline to draw from
 * @param canvas    the canvas element
 * @param animationSettings object of class AnimationSettings
 */
function drawName(ctx, message, bottomHeight, canvas, animationSettings) {
    const nameSizePixels = canvas.width * animationSettings.nameSizePercent;
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const nudge = animationSettings.nudgeProfiles;
    ctx.scale(0.5,0.5);
    if (animationSettings.showNames) {
        var centerX = (nameSizePixels / 2) + nudge;
        if (message.profile.isMainPerson) {
            centerX = canvas.width - centerX;
        }
        ctx.fillText(message.profile.profileName, centerX * 2, bottomHeight * 2);
    }
    ctx.scale(2,2);
}

/**
 * Draw the profile picture next to the chat bubble
 * @param ctx       the drawing context
 * @param message   a ChatMessage object
 * @param bottomHeight  the baseline of the message in pixels
 * @param canvas        the canvas element
 * @param animationSettings yep
 */
function drawPicture(ctx, message, bottomHeight, canvas, animationSettings) {
    if (animationSettings.showNames) {
        const nudge = animationSettings.nudgeProfiles;
        const picSize = animationSettings.nameSizePercent * canvas.width;
        var clipX = (picSize / 2) + nudge;
        if (message.profile.isMainPerson) {
            clipX = canvas.width - clipX;
        }
        
        const fontSize = Number(ctx.font.replace('px','').split(' ')[0]) / 2;
        const clipY = bottomHeight - (fontSize + 2) - (picSize / 2);
        const clipRadius = picSize / 2;
        
        
        
        
        ctx.save();
        
        
        // Begin clip path
        ctx.beginPath();
        ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(message.profile.image,
                      clipX - picSize / 2,
                      clipY - picSize / 2,
                      picSize,
                      picSize);
        
        ctx.restore();
        
    }
}
