import { contentFilterText, stopAtLastPeriod } from "./content-filter.js";

const submitButton = document.querySelector(".submit-btn");
const entry = document.querySelector(".image-gen-entry");
const textFrame = document.querySelector(".text-frame");

async function query(data) {
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


submitButton.addEventListener('click', () => {
    submit();
});

async function submit() {
    const input = entry.value;
    if (input != "") {
        let contentValue = await contentFilterText(input);
        if (contentValue == 1) {
            query({ "inputs": input, "parameters": { "return_full_text": false } }).then(async (response) => {
                let aiContentValue = await contentFilterText(response[0].generated_text);
                if (aiContentValue == 1) {
                    const userInput = document.createElement('p');
                    userInput.classList.add("user-bubble");
                    const aiOutput = document.createElement('p');
                    aiOutput.classList.add("ai-bubble");
                    userInput.innerHTML = input;
                    let cutOff = stopAtLastPeriod(response[0].generated_text);
                    aiOutput.textContent = cutOff
                    textFrame.appendChild(userInput);
                    textFrame.appendChild(aiOutput);
                    textFrame.scrollTop = textFrame.scrollHeight;
                    entry.value = '';
                    entry.placeholder = "Ask me a question...";
                } else {
                    setPlaceholder(aiContentValue);
                }
            });
        } else {
            setPlaceholder(contentValue);
        }

    }

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


