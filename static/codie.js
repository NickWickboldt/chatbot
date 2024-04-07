import { contentFilterText, filterImage, stopAtLastPeriod } from "./content-filter.js";

const micButton = document.querySelector('.mic-btn');
let micOn = true;


micButton.addEventListener('click', () =>{
    const icon =  micButton.childNodes[0].nodeName.toLowerCase();

    if(icon === 'i'){
        const soundIcon = document.createElement('img');
        soundIcon.src = "../../static/asset/sound.gif";
        soundIcon.classList.add('sound-waves');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(soundIcon);
    }else{
        const micIcon = document.createElement('i');
        micIcon.classList.add('fa-solid','fa-microphone');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(micIcon);
    }
})
