import { contentFilterText, filterImage, stopAtLastPeriod, removeBlankLines, toBase64, uploadFile } from "./content-filter.js";

const micButton = document.querySelector('.mic-btn');
const entry = document.querySelector(".image-gen-entry");
const frame = document.querySelector('.text-frame');
const submitButton = document.querySelector('.submit-btn');
const downloadButton = document.querySelector('.download-btn');
const downloadableLink = document.querySelector('.download-link');
const placeholderText = "Chat with Codie or ask him to generate an image"
const userInput = document.createElement('p');
userInput.classList.add("user-bubble");
const aiOutput = document.createElement('p');
aiOutput.classList.add("ai-bubble");
const imgGen0 = 'generate an image';
const imgGen1 = 'generate me an image';
const imgGen2 = 'generate image';
const audioFile = document.createElement('a');
const fileReader = new FileReader();
let mediaRecorder;
const records = [];
codieStart();

async function audioToText(filename) {
    //const fs = new FileReader();
    fileReader.readAsArrayBuffer(filename);
    const data = filename;
    const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
            headers: { Authorization: "Bearer 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" },
            method: "POST",
            body: data,
        }
    );
    const result = await response.json();
    return result;
}

fileReader.onload = function (event) {
    const arrayBuffer = event.target.result;
};

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

navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
    // Set up MediaRecorder
    mediaRecorder = new MediaRecorder(stream);
    let chunks = [];

    // Handle data available event
    mediaRecorder.ondataavailable = function (event) {
        chunks.push(event.data);
    };

    // Handle stop event
    mediaRecorder.onstop = function () {
        const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        // Save the audio file
        audioFile.href = url;
        audioFile.download = 'recorded-speech.ogg';

        audioToText(blob).then(async (response) => {
            const userAudio = response.text.toLowerCase();
            mainCall(userAudio);
        });
    };

}).catch(function (err) {
    console.error('Error accessing microphone:', err);
});


micButton.addEventListener('click', () => {
    const icon = micButton.childNodes[0].nodeName.toLowerCase();
    if (icon === 'i') {
        const soundIcon = document.createElement('img');
        soundIcon.src = "../../static/asset/sound.gif";
        soundIcon.classList.add('sound-waves');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(soundIcon);
        mediaRecorder.start();
    } else {
        const micIcon = document.createElement('i');
        micIcon.classList.add('fa-solid', 'fa-microphone');
        micButton.removeChild(micButton.childNodes[0]);
        micButton.appendChild(micIcon);
        mediaRecorder.stop();
    }
})

submitButton.addEventListener('click', () => {
    submit();
})

async function submit() {
    const input = entry.value.toLowerCase();
    mainCall(input);
}

async function mainCall(userValue) {
    if (userValue != "") {
        let contentValue = await contentFilterText(userValue);
        if (contentValue == 1) {
            if (userValue.includes(imgGen0) || userValue.includes(imgGen1) || userValue.includes(imgGen2)) {
                const imgCon = document.createElement('div');
                const img = document.createElement('img');
                imageGen({ "inputs": userValue }).then(async (response) => {
                    let base64 = await toBase64(response)
                    uploadFile(base64).then((url) => {
                        userInput.innerHTML = userValue;
                        frame.appendChild(userInput);
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
                    })
                });
            } else {
                textGen({ "inputs": userValue, "parameters": { "return_full_text": false } }).then(async (response) => {
                    let aiContentValue = await contentFilterText(response[0].generated_text);
                    if (aiContentValue == 1) {
                        userInput.innerHTML = userValue;
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