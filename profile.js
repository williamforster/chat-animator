import { playAnimationFromStart } from './animation.js'

/**
 * Profile class, with the profile image, and a name
 */
export class Profile {
    constructor(profileName, imageLink, backColor = '#d8d8d8',isMainPerson = false, color = '#333333') {
        this.profileName = profileName;
        this.imageLink = imageLink;
        this.backColor = backColor;
        this.color = color;
        // Do their texts come up on the right
        this.isMainPerson = isMainPerson;
        this.alphaValue = 1.0;
    }
    
    // Create a copy of another profile
    copy(otherProfile) {
        this.profileName = otherProfile.profileName + "2";
        this.imageLink = otherProfile.imageLink;
        this.image = otherProfile.image
        this.backColor = otherProfile.backColor;
        this.color = otherProfile.color;
        this.isMainPerson = false;
        this.alphaValue = otherProfile.alphaValue;
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
 * @param setupTextEntry A function that alters the message
 *                       text entry section when profiles are changed
 * @param deleteProfile  A function that deletes given profile from global
                        array of profiles.
 */
export function updateProfileDiv(divElement, profiles, setupTextEntry, deleteProfile) {
    // Empty the div element
    divElement.innerHTML = '';
    
    const allProfilesClosure = profiles;
    // Iterate through the profiles array
    for (var profile of profiles) {
        const profileClosure = profile;
        // Create a new div element for the profile
        const profileDiv = document.createElement('div');
        profileDiv.className = 'profile';
        
        // Create an img element for the profile image
        const img = document.createElement('img');
        img.src = profile.getImageLink();
        img.alt = profile.getProfileName();
        img.className = "profilePic";
        // Append the img to the profile div
        profileDiv.appendChild(img);
        
        profile.image = new Image();
        profile.image.src = profile.getImageLink();
        
        
        // Add a message color picker
        const picker = document.createElement('input');
        picker.type = 'color';
        picker.value = profile.backColor;
        picker.className = "picker";
        picker.addEventListener('input', () => {
            profileClosure.backColor = picker.value;
        });
        profileDiv.appendChild(picker);
        profile.picker = picker;
        
        const alpha = document.createElement('input');
        alpha.type = 'range';
        alpha.className = "range";
        alpha.max = 1.0;
        alpha.step = 0.01;
        alpha.min = 0.0;
        alpha.value = profile.alphaValue;
        profile.alpha = alpha;
        alpha.addEventListener('input', () => {
            profileClosure.alphaValue = alpha.value;
        });
        profileDiv.appendChild(alpha);
        
        // Add a text color picker
        const textPicker = document.createElement('input');
        textPicker.type = 'color';
        textPicker.className = "picker";
        textPicker.value = profile.color;
        profile.textPicker = textPicker;
        textPicker.addEventListener('input', () => {
            profileClosure.color = textPicker.value;
        });
        profileDiv.appendChild(textPicker);
        
        // Create a text node for the profile name
        const text = document.createElement('input');
        text.type = 'text';
        text.className = "nameInput";
        text.value = profile.profileName;
        text.addEventListener('change', (e) => {
            // Prevent errors with collision of profile names
            for (var prof of allProfilesClosure) {
                if (text.value == prof.profileName) {
                    text.value += '2';
                }
            }
            profileClosure.profileName = text.value;
            setupTextEntry();
        });
        profileDiv.appendChild(text);
        
        
        // Add a delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML= '-';
        deleteButton.className = "deleteButton";
        if (profile === profiles[0]) {
            deleteButton.disabled = true;
            deleteButton.className = "firstButton";
        }
        deleteButton.addEventListener('click', () => {
            deleteProfile(profileClosure);
        })
        profileDiv.appendChild(deleteButton);
        
        // Append the profile div to the main div element
        divElement.appendChild(profileDiv);
        
    
        const thisProfile = profile;
        // Add the profile image change functionality
        // When the image is clicked, trigger the file input
        img.addEventListener('click', (e) => {
            console.log("Clicked image upload");
            // Create a file input element dynamically
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*'; // Accept only images
            
            const closureProfile = thisProfile;
            // Handle file selection
            fileInput.addEventListener('change', (event) => {
                console.log("Selected image file");
                const file = event.target.files[0]; // Get the selected file
                if (file) {
                    const reader = new FileReader(); // Create a FileReader to read the file
                    reader.onload = function(e2) {
                        //console.log("Updated profile image to:" + e.target.result);
                        closureProfile.setImageLink(reader.result); // Set the img src to the read file
                        img.src = reader.result;
                        closureProfile.image = new Image();
                        closureProfile.image.src = reader.result;
                        
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
