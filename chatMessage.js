import {Profile} from './profile.js'

/**
 * A message string with associated profile
 */
export class ChatMessage {
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
     * width of the message bubbles
     */
    getHeight(pixelWidth) {
        return 60;
    }
}
