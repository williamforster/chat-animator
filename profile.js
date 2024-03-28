import { playAnimationFromStart } from './animation.js'

/**
 * Profile class, with the profile image, and a name
 */
export class Profile {
    constructor(profileName, imageLink, color = '#d8d8d8',isMainPerson = false) {
        this.profileName = profileName;
        this.imageLink = imageLink;
        this.color = color;
        // Do their texts come up on the right
        this.isMainPerson = isMainPerson;
    }
    
    // Get the profile name
    getProfileName() {
        return this.profileName;
    }
    
    // Set a new profile name
    setProfileName(newName) {
        this.profileName = newName;
    }
    
    // Get the image link
    getImageLink() {
        return this.imageLink;
    }
    
    // Set a new image link
    setImageLink(newLink) {
        this.imageLink = newLink;
    }
}

/**
 *  Show a profile for each chatter in the div argument
 * @param divElement    The div element to show the profiles in
 * @param profiles      An array of profile classes to fill the element with
 */
export function updateProfileDiv(divElement, profiles) {
    // Empty the div element
    divElement.innerHTML = '';
    
    // Iterate through the profiles array
    for (var profile of profiles) {
        // Create a new div element for the profile
        const profileDiv = document.createElement('div');
        profileDiv.className = 'profile';
        
        // Create an img element for the profile image
        const img = document.createElement('img');
        img.src = profile.getImageLink();
        img.alt = profile.getProfileName();
        img.className = "profilePic";
        
        // Create a text node for the profile name
        const text = document.createTextNode(profile.getProfileName());
        
        // Append the img and text to the profile div
        profileDiv.appendChild(img);
        profileDiv.appendChild(text);
        
        // Add a message color picker
        const picker = document.createElement('input');
        picker.type = 'color';
        picker.value = profile.color;
        profileDiv.appendChild(picker);
        profile.picker = picker;
        
        const alpha = document.createElement('input');
        alpha.type = 'range';
        alpha.value = 1.0;
        alpha.max = 1.0;
        alpha.step = 0.01;
        alpha.min = 0.0;
        profileDiv.appendChild(alpha);
        profile.alpha = alpha;
        
        // Append the profile div to the main div element
        divElement.appendChild(profileDiv);
        
        
        
    
        
        // Add the profile image change functionality
        // When the image is clicked, trigger the file input
        img.addEventListener('click', () => {
            // Create a file input element dynamically
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*'; // Accept only images
            // Handle file selection
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0]; // Get the selected file
                if (file) {
                    const reader = new FileReader(); // Create a FileReader to read the file
                    reader.onload = function(e) {
                        profile.setImageLink(reader.result); // Set the img src to the read file
                        img.src = reader.result;
                        console.log("Updated profile image to:" + e.target.result);
                    };
                    reader.readAsDataURL(file); // Read the file as Data URL
                } else {
                    console.log("Error - invalid file selected for profile picture");
                }
            });
            fileInput.click();
        });
    
    }
}
