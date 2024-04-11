import { contentFilterText, stopAtLastPeriod, removeBlankLines, toBase64, uploadFile } from "./content-filter.js";

const micButton = document.querySelector('.mic-btn');
const entry = document.querySelector(".image-gen-entry");
const frame = document.querySelector('.text-frame');
const submitButton = document.querySelector('.submit-btn');
const downloadButton = document.querySelector('.download-btn');
const downloadableLink = document.querySelector('.download-link');
const codieIntroTag = document.createElement('div');
const fileReader = new FileReader();

let bubbles = [codieIntroTag];

const imgPromtString = [
    'picture','image', 'show me', 'photo'
]
const records = [];
let mediaRecorder;
codieStart();

function makeBubbleEvents() {
    bubbles.forEach(aiBubble => {
        aiBubble.addEventListener('click', () => {
            console.log(aiBubble.innerHTML)
            const options = {
                method: 'POST',
                headers: {
                    'xi-api-key': '6b198811761454a818ba50ecd87894e6',
                    'Content-Type': 'application/json'
                },
                body: `{"text": "${aiBubble.innerHTML.trim()}"}`,
                type: "arrayBuffer"
            };
            fetch('https://api.elevenlabs.io/v1/text-to-speech/vzIvYzEA9hRE16PpL5jb', options)
                .then(async (response) => {
                    const arrayBuffer = await response.arrayBuffer();
                    const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(blob);
                    const audioElement = new Audio(audioUrl);
                    audioElement.play();
                })
                .catch(err => console.error(err));
        });
    });
}

async function audioToText(filename) {
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
    mediaRecorder = new MediaRecorder(stream);
    let chunks = [];
    mediaRecorder.ondataavailable = function (event) {
        chunks.push(event.data);
    };
    mediaRecorder.onstop = function () {
        micButton.disabled = true; 
        const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
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

downloadButton.addEventListener('click', () => {
    const filename = "records.txt";
    let conversation = "";
    if (records.length > 0) {
        records.forEach(record => {
            conversation += record + '\n' + '\n';
        });

        const blob = new Blob([conversation], {
            type: 'text/plain;charset=utf-8'
        });
        downloadableLink.download = filename;
        downloadableLink.href = window.URL.createObjectURL(blob);
    }
})

submitButton.addEventListener('click', () => {
    submitEntry();
})

async function submitEntry() {
    const input = entry.value.toLowerCase();
    mainCall(input);
}

async function mainCall(userValue) {
    const userInput = document.createElement('div');
    userInput.classList.add("user-bubble");
    const aiOutput = document.createElement('div');
    aiOutput.classList.add("ai-bubble");
    if (userValue != "") {
        let contentValue = await contentFilterText(userValue);
        if (contentValue == 1) {
            if (checkImgPromt(userValue)) {
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
                        resetPlaceholder();
                        records.push("User: " + userInput.innerHTML);
                        records.push(img.src);
                        records.push("Ai: " + aiOutput.innerHTML);
                    })
                });
            } else {
                textGen({ "inputs": userValue, "parameters": { "return_full_text": false } }).then(async (response) => {
                    let aiContentValue = await contentFilterText(response[0].generated_text);
                    if (aiContentValue == 1) {
                        userInput.innerHTML = userValue;
                        let cutOff = stopAtLastPeriod(response[0].generated_text);
                        let noBlankLines = removeBlankLines(cutOff);
                        aiOutput.innerHTML = noBlankLines;
                        frame.appendChild(userInput);
                        frame.appendChild(aiOutput);
                        bubbles.push(aiOutput);
                        makeBubbleEvents(); 
                        frame.scrollTop = frame.scrollHeight;
                        resetPlaceholder();
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
    micButton.disabled = false; 
}

function codieStart() {
    const codieIntro = "Hello, my name is Codie. How can I assist you?";
    const codieIntruction = "Start your sentence with 'generate me an image' or anything to just chat with me!";

    const codieIntructionTag = document.createElement('div');
    codieIntroTag.classList.add('ai-bubble');
    codieIntructionTag.classList.add('ai-bubble');
    codieIntroTag.textContent = codieIntro;
    codieIntructionTag.textContent = codieIntruction;
    frame.appendChild(codieIntroTag);
    frame.appendChild(codieIntructionTag);
    records.push("AI: " + codieIntro);
    records.push("AI: " + codieIntruction);
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

function resetPlaceholder() {
    entry.value = '';
    entry.placeholder = "Chat with Codie or ask him to generate an image";
}

function checkImgPromt(input) {
    for (let i = 0; i < imgPromtString.length; i++) {
        if (input.includes(imgPromtString[i])) {
            return true;
        }
    }
    return false;
}