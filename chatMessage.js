import {Profile} from './profile.js';
import {AnimationSettings} from './animation.js';

/**
 * A message string with associated profile
 */
export class ChatMessage {
    message = '';
    profile = '';
    constructor(message, profile) {
        this.profile = profile;
        this.message = message;
        // The positions on screen, in fraction of screen height.
        // Start past the bottom of the screen
        this.desiredPosition = 1.1;
        this.actualPosition = 1.1;
        this.startPosition = 1.1;
        // When using frame specify, which exact frame to enter the screen on.
        this.enterFrame = 0;
    }
    
    getMessage() {
        return this.message;
    }
    
    getProfile() {
        return this.profile;
    }
    
    /**
     * Get the height and width of this message in pixels.
     * If the text is smaller than one line, only the necessary
     * width will be drawn.
     * @param ctx           the drawing context
     * @param canvas        the drawing canvas
     * @param animationSettings the settings to calculate layout
     * @return the required width for the text, and the height in pixels
     */
    getSize(ctx, canvas, animationSettings) {
        if (this.message == '') {
            this.message = ' ';
        }
        var words = this.message.split(' ');
        var line = '';
        var y = 0;
        
        const bubbleWidth = animationSettings.getBubbleWidth(canvas);
        const widthInset = bubbleWidth * animationSettings.textInsetWidth;
        const maxWidth = animationSettings.getTextWidth(canvas);
        const heightInset = bubbleWidth * animationSettings.textInsetHeight;
        var widthRequired = 0;
        for(var n = 0; n < words.length; n++) {
            var oldWidth = ctx.measureText(line).width;
            if (oldWidth) {
                widthRequired = Math.max(widthRequired, oldWidth);
            }
            
            // Test line with next word
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            
            // If the line is too wide, draw the current line and start a new one
            if (testWidth > maxWidth && n > 0) {
                line = words[n] + ' ';
                if (n != words.length - 1 || line != ' ') {
                    y += animationSettings.lineHeight;
                }
            }
            else {
                line = testLine;
            }
        }
        var lastWidth = ctx.measureText(line).width;
        if (lastWidth) {
            widthRequired = Math.max(widthRequired, lastWidth);
        }
        widthRequired += 2 * widthInset;
        widthRequired = Math.floor(widthRequired);
        var messageHeight = y + animationSettings.lineHeight + (2 * heightInset);
        //console.log(`textwidth: ${maxWidth}, maxWidth: ${maxWidth}, req:${widthRequired}`);
        return { widthRequired, messageHeight };
    }
}
