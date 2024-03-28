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
        this.desiredPosition = 1.1;
        this.actualPosition = 1.1;
        this.startPosition = 1.1;
    }
    
    getMessage() {
        return this.message;
    }
    
    getProfile() {
        return this.profile;
    }
    
    /**
     * Get the height of this message in pixels given the
     * width of the message bubbles.
     * @param ctx           the drawing context
     * @param bubbleWidth    max drawing width
     * @param animationSettings the settings to calculate layout
     */
    getHeight(ctx, bubbleWidth, animationSettings) {
        var words = this.message.split(' ');
        var line = '';
        var y = 0;
        const widthInset = bubbleWidth * animationSettings.textInsetWidth;
        const maxWidth = bubbleWidth - (2 * widthInset);
        const heightInset = bubbleWidth * animationSettings.textInsetHeight;
        
        for(var n = 0; n < words.length; n++) {
            // Test line with next word
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            
            // If the line is too wide, draw the current line and start a new one
            if (testWidth > maxWidth && n > 0) {
                line = words[n] + ' ';
                y += animationSettings.lineHeight;
            }
            else {
                line = testLine;
            }
        }
        return y + animationSettings.lineHeight + (2 * heightInset);
    }
}
