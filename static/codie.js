import { contentFilterText, filterImage, stopAtLastPeriod, removeBlankLines, toBase64, uploadFile } from "./content-filter.js";

const micButton = document.querySelector('.mic-btn');
const entry = document.querySelector(".image-gen-entry");
const frame = document.querySelector('.text-frame');
const submitButton = document.querySelector('.submit-btn');
const placeholderText = "Chat with Codie or ask him to generate an image"
const userInput = document.createElement('p');
userInput.classList.add("user-bubble");
const aiOutput = document.createElement('p');
aiOutput.classList.add("ai-bubble");
const imgGen0 = 'generate an image';
const imgGen1 = 'generate me an image';
const imgGen2 = 'generate image';
const records = [];
codieStart();

async function textGen(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
            headers: {
                Authorization: "Bearer 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",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

async function imageGen(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            headers: {
                Authorization: "Bearer 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",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    return result;
}

micButton.addEventListener('click', () => {
    const icon = micButton.childNodes[0].nodeName.toLowerCase();
    if (icon === 'i') {
        const soundIcon = document.createElement('img');
        soundIcon.src = "../../static/asset/sound.gif";
        soundIcon.classList.add('sound-waves');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(soundIcon);
    } else {
        const micIcon = document.createElement('i');
        micIcon.classList.add('fa-solid', 'fa-microphone');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(micIcon);
    }
})

submitButton.addEventListener('click', () => {
    submit();
})

async function submit() {
    const input = entry.value.toLowerCase();
    if (input != "") {
        let contentValue = await contentFilterText(input);
        if (contentValue == 1) {
            if (input.includes(imgGen0) || input.includes(imgGen1) || input.includes(imgGen2)) {
                const imgCon = document.createElement('div');
                const img = document.createElement('img');
                imageGen({ "inputs": input }).then(async (response) => {
                    let base64 = await toBase64(response)
                    uploadFile(base64).then((url) => {
                        console.log('generate img')
                        img.src = url;
                        img.classList.add('image-generated-codie');
                        imgCon.classList.add('image-bubble');
                        imgCon.appendChild(img);
                        frame.appendChild(imgCon);
                        aiOutput.innerHTML = 'Here is your image!'
                        frame.appendChild(aiOutput);
                        frame.scrollTop = frame.scrollHeight;
                        entry.value = '';
                        entry.placeholder = placeholderText;
                        console.log('image is here')
                    })
                });
            } else {
                textGen({ "inputs": input, "parameters": { "return_full_text": false } }).then(async (response) => {
                    let aiContentValue = await contentFilterText(response[0].generated_text);
                    if (aiContentValue == 1) {
                        userInput.innerHTML = input;
                        let cutOff = stopAtLastPeriod(response[0].generated_text);
                        aiOutput.innerHTML = cutOff
                        frame.appendChild(userInput);
                        frame.appendChild(aiOutput);
                        frame.scrollTop = frame.scrollHeight;
                        entry.value = '';
                        entry.placeholder = placeholderText;
                        let noBlankLines = removeBlankLines(cutOff);
                        records.push("User: " + userInput.innerHTML);
                        records.push("Ai: " + noBlankLines);
                    } else {
                        setPlaceholder(aiContentValue);
                    }
                });
            }
        } else {
            setPlaceholder(contentValue);
        }
    }


}

function codieStart() {
    const codieIntro = "Hello, my name is Codie. How can I assist you?"; 
    const codieIntruction = "Start your sentence with 'generate me an image' or anything to just chat with me!";
    const codieIntroTag = document.createElement('p');
    const codieIntructionTag = document.createElement('p');
    codieIntroTag.classList.add('ai-bubble');
    codieIntructionTag.classList.add('ai-bubble');
    codieIntroTag.textContent = codieIntro;
    codieIntructionTag.textContent = codieIntruction;
    frame.appendChild(codieIntroTag);
    frame.appendChild(codieIntructionTag);
}


function setPlaceholder(cv) {
    if (cv == 0) {
        entry.value = "";
        entry.placeholder = "Please be appropriate!";
    } else {
        entry.value = "";
        entry.placeholder = "There has been an error.";
    }
}