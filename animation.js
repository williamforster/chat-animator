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
var canvas = document.getElementById("animCanvas");

export class AnimationSettings {
    // How long the messages should spend sliding onto the screen
    durationMessageSlideUp = 0.5;
    // How long the messages should spend stationary
    durationMessageHold = 1.0;
    chatBubbleWidthPercent = 0.65;
    chatBubbleSpacingPixels = 30;
    // Text inset as a fraction of the total chat bubble width
    textInsetWidth = 0.06;
    // Text height inset as a fraction of the total chat bubble width
    textInsetHeight = 0.03;
    // Delay at the start (and end) of animation
    startDelay = 1.0;
    // pixels between vertical lines of text
    lineHeight = 36;
    font = "32px sans-serif";
    // Show names beside messages or do not show names
    showNames = true;
    showTails = true;
    nameSizePercent = 0.12;
    // Messages enter at an exact specified frame
    frameSpecify = false;
    
    backColor = "#ffffffff";
    // nudge the profile pics away from the edge of screen
    nudgeProfiles = 5;

    frameRate = 60;
    
    /**
     * Get the width of the text bubble rectangle given the canvas width
     */
    getBubbleWidth(canvas) {
        return Math.floor(this.chatBubbleWidthPercent * canvas.width);
    }
    
    /**
     * Get the width of the text drawing area given the canvas width
     */
    getTextWidth(canvas) {
        const bubbleWidth = this.getBubbleWidth(canvas);
        const textInset = bubbleWidth * this.textInsetWidth;
        return Math.floor(bubbleWidth - 2 * textInset);
    }

    getAnimationFrameCount() {
        return Math.floor(durationMessageSlideUp * frameRate);
    }
}

// Set to -1 as a reset flag for chat messages. This happens in the drawFrame function
// which has access to the chat messages.
var currentMessageCount = 0;



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
    if (frameNumber == 0) {
        // resetMessagePositions
        for (var i = 0; i < allChatMessages.length; i++) {
            allChatMessages[i].desiredPosition = 1.1;
            allChatMessages[i].actualPosition = 1.1;
            allChatMessages[i].startPosition = 1.1;
        }
    }
    
    var {onScreenMessages, timeIntoThisMessage} = getOnScreenMessages(allChatMessages, animationSettings);
    if (currentMessageCount != onScreenMessages.length) {
        currentMessageCount = onScreenMessages.length
        // set all the start positions
        for (var i = 0; i < onScreenMessages.length; i++) {
            if (animationSettings.frameSpecify) {
                if (onScreenMessages[i].enterFrame == frameNumber) {
                    onScreenMessages[i].startPosition = 1.1;
                } else {
                    onScreenMessages[i].startPosition = onScreenMessages[i].actualPosition;
                }
            }
             else {
                onScreenMessages[i].startPosition = onScreenMessages[i].actualPosition;
             }
        }
    }
    
    layout(ctx, onScreenMessages, frameNumber / animationSettings.frameRate, canvas, animationSettings);
    drawAllTextBubbles(ctx, onScreenMessages, canvas, animationSettings);
    
    frameNumber += 1;
    var finishTime = allChatMessages.length *
            (animationSettings.durationMessageHold + animationSettings.durationMessageSlideUp) +
            (2 * animationSettings.startDelay);
    if (animationSettings.frameSpecify) {
        var latest = 0;
        for (var msg of allChatMessages) { latest = Math.max(msg.enterFrame, latest); }
        finishTime = (latest / animationSettings.frameRate) + animationSettings.durationMessageSlideUp +
            animationSettings.startDelay;
    }
    if (frameNumber > animationSettings.frameRate * finishTime) {
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
    currentMessageCount = 0;
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
    // Make all the variables ints to minimize bleeding
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    radius = Math.floor(radius);
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
 * Draw a rounded rectangle with the current stroke and fill, and a little tail
 * pointing to the person who sent the text.
 */
function roundedRectWithTail(ctx, x, y, width, height, radius, left = true) {
    // Make all the variables ints to minimize bleeding
    x = Math.floor(x);
    y = Math.floor(y);
    width = Math.floor(width);
    height = Math.floor(height);
    radius = Math.floor(radius);
    // The bottom left border radius center
    var borderRadiusCenter = {x: x + radius,y: y + height - radius};
    // Stuff to do with meeting the border radius where it would usually be
    const miniArcAngle = Math.PI / 5;
    var destPos = {x: borderRadiusCenter.x - radius * Math.sin(miniArcAngle), y: borderRadiusCenter.y + radius * Math.cos(miniArcAngle)};
    
    if (left) {
        ctx.beginPath();
        // start at the top left
        ctx.moveTo(x, y + radius);
        // move down, then arc around the bottom left
        ctx.arcTo(x, y + height, x - radius /2, y + height, radius / 2);
        ctx.lineTo(x - radius / 2, y + height);
        ctx.arcTo(x, y + height, destPos.x, destPos.y, radius);
        
        // Draw an arc where the corner radius normally is
        ctx.arc(x + radius, y + height - radius, radius, (Math.PI / 2) + miniArcAngle, Math.PI / 2, true);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.stroke();
        ctx.fill();
    } else {
        borderRadiusCenter = {x: x + width - radius, y: y + height - radius};
        destPos = {x:borderRadiusCenter.x + radius * Math.sin(miniArcAngle), y: borderRadiusCenter.y + radius * Math.cos(miniArcAngle)};
            
        ctx.beginPath();
        // start at the top right below the radius
        ctx.moveTo(x + width, y + radius);
        // move down, and do the little tail on the right
        ctx.arcTo(x + width, y + height, x + width + radius / 2, y + height, radius / 2);
        ctx.lineTo(x + width + radius / 2, y + height);
        ctx.arcTo(x + width, y + height, destPos.x, destPos.y, radius);
            
        // Draw an arc where the corner radius normally is
        ctx.arc(borderRadiusCenter.x, borderRadiusCenter.y, radius,(Math.PI / 2) - miniArcAngle, Math.PI / 2);
        // Do the bottom left radius.
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.stroke();
        ctx.fill();
    }
}

/**
 * Draw a text bubble at a given y position (top of the bubble)
 * @param ctx   the drawing context
 * @param message  the ChatMessage item
 * @param left  boolean - if the bubble is on the left or right of the screen
 * @param y     y position of the text in percent
 * @param canvas    canvas element (for width)
 * @param animationSettings     object containing the bubble width
 */
function drawTextBubble(ctx, message, left, y, canvas, animationSettings) {
    var bubbleWidth = animationSettings.getBubbleWidth(canvas);
    const textInsetHeight = bubbleWidth * animationSettings.textInsetHeight;
    const textWidth = animationSettings.getTextWidth(canvas);
    const textInsetWidth = bubbleWidth * animationSettings.textInsetWidth;
    const yOffsetFromNames = animationSettings.nameSizePercent * 0.5 * canvas.width;
    
    const startHeight = Math.floor(y * canvas.height) - yOffsetFromNames;
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
    let { widthRequired, messageHeight } = message.getSize(ctx,
                                            canvas,
                                            animationSettings);
    const borderRadius = Math.min(messageHeight / 2, animationSettings.lineHeight);
    if (!left) {
        xPos += (bubbleWidth - widthRequired);
    }
    if (animationSettings.showTails) {
        roundedRectWithTail(ctx, xPos, startHeight, widthRequired, messageHeight, borderRadius, left);
    } else {
        roundedRect(ctx, xPos, startHeight, widthRequired, messageHeight, borderRadius);
    }
    ctx.fillStyle = message.profile.textPicker.value;
    wrapTextAndDraw(ctx,
                    message.message,
                    xPos + textInsetWidth,
                    startHeight + textInsetHeight,
                    textWidth,
                    animationSettings.lineHeight);
    
    // Draw name
    const bottomHeight = startHeight + messageHeight + yOffsetFromNames;
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
function getOnScreenMessages(chatMessages, animationSettings) {
    var onScreenMessages = [];
    var timeIntoThisMessage = 0;
    if (animationSettings.frameSpecify) {
        var latest = 0;
        for (var i = 0; i < chatMessages.length; i++) {
            if (frameNumber >= chatMessages[i].enterFrame) {
                latest = Math.max(latest, chatMessages[i].enterFrame);
                onScreenMessages.push(chatMessages[i]);
            }
        }
        
        if (animationSettings.durationMessageSlideUp > 0) {
            timeIntoThisMessage = (frameNumber - latest) /
             (animationSettings.durationMessageSlideUp * animationSettings.frameRate);
        } else {
            timeIntoThisMessage = 0;
        }
        return {onScreenMessages, timeIntoThisMessage};
    } else {
        // Keep elapsed time at 0 until delay time is over
        const elapsedTime = Math.max((frameNumber / animationSettings.frameRate) -
            animationSettings.startDelay, 0.0);
        const timePerMessage = animationSettings.durationMessageHold +
        animationSettings.durationMessageSlideUp;
        const idxOfMessagesOnScreen = Math.min(chatMessages.length - 1,
        Math.floor(elapsedTime / timePerMessage));
        const startTimeThisMessage = timePerMessage * idxOfMessagesOnScreen;
        const timeIntoThisMessage = elapsedTime - startTimeThisMessage;
        for (var i = 0; i <= idxOfMessagesOnScreen; i++) {
            onScreenMessages.push(chatMessages[i]);
        }
        return {onScreenMessages, timeIntoThisMessage};
    }
    
}

/**
 * Get the pixel height of all on-screen messages.
 * @param ctx           The drawing context
 * @param onScreenMessages  Array of ChatMessage class
 * @param canvas        The canvas element
 */
function getOnScreenMessagesSize(ctx, onScreenMessages, canvas, animationSettings) {
    var totalSize = 0;
    const textWidth = animationSettings.getTextWidth(canvas);
    for (var msg of onScreenMessages) {
        let { widthRequired, messageHeight }  = msg.getSize(ctx,
                                                  canvas,
                                                  animationSettings);
        totalSize += messageHeight;
    }
    totalSize += animationSettings.nameSizePercent * canvas.width;
    return totalSize + animationSettings.chatBubbleSpacingPixels *
            (onScreenMessages.length - 1);
}

/**
 * Set the positions of all chatMessages
 * @param ctx           the drawing context
 * @param chatMessages  array of ChatMessage class
 * @param elapsedTime   time in seconds since very start of animation
 * @param canvas        the canvas (for width and height)
 */
function layout(ctx, chatMessages, elapsedTime, canvas, animationSettings) {
    const bubbleWidth = animationSettings.getBubbleWidth(canvas);
    const textWidth = animationSettings.getTextWidth(canvas);
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
    for (var i = chatMessages.length - 1; i >= 0; i--) {
        let { widthRequired, messageHeight }  = chatMessages[i].getSize(ctx,
                                                    canvas,
                                                    animationSettings);
        const thisBubbleHeight = messageHeight / canvas.height;
        chatMessages[i].desiredPosition = baseHeight - thisBubbleHeight
        //console.log(`${baseHeight} ${chatMessages[i].desiredPosition}`);
        baseHeight -= thisBubbleHeight + 
                        (animationSettings.chatBubbleSpacingPixels / canvas.height);
    }
    // Desired positions now set.
    
    
    // Set the actual positions.
    var {x, timeIntoThisMessage} = getOnScreenMessages(chatMessages, animationSettings);
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
        
        
        // Draw image with shortest dimension matching the circle.
        var aspectRatio = message.profile.image.width /
                            message.profile.image.height;
        // svg magic. If svg file width or height is relative (eg 100%)
        // firefox will complain. Workaround below.
        if (!message.profile.image.width || !message.profile.image.height) {
            aspectRatio = 1.0;
            message.profile.image.width = 64;
            message.profile.image.height = 64;
        }
        var xSize = picSize;
        var ySize = picSize;
        if (aspectRatio > 1) {
            xSize = picSize * aspectRatio;
        } else {
            ySize = picSize / aspectRatio;
        }
        
        ctx.save();
        
        
        // Begin clip path
        ctx.beginPath();
        ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(message.profile.image,
                      clipX - xSize / 2,
                      clipY - ySize / 2,
                      xSize,
                      ySize);
        
        ctx.restore();
        // The last element's alpha channel doesn't work without this hacky line ???
        ctx.beginPath();
    }
}
