import {contentFilterText, toBase64, uploadFile, downloadableLink} from "./content-filter.js";

const submitButton = document.querySelector(".submit-btn"); 
const downloadButton = document.querySelector(".download-btn");
const downloadLink = document.querySelector(".download-link");
const imageFrame = document.querySelector(".image-frame"); 
const entry = document.querySelector(".image-gen-entry");
const displayH1 = document.createElement('h1'); 

let gemini_api_key; 

export let inputDisplay;

fetch('/env')
    .then(response => response.json())
    .then(data => {
        gemini_api_key= data.gemini_api_key;
    })
    .catch(error => {
        console.error('Error fetching environment variables:', error);
    });

async function query(data) {
	const response = await fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent", {
      method: "POST",
      headers: {
        "x-goog-api-key": gemini_api_key,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents: [{ parts: [{ text: `${data.inputs}` }] }]
      }),
    }
  );
	const jsonResponse = await response.json();
	console.log(jsonResponse)
	const imagePart = jsonResponse.candidates[0].content.parts.find(p => p.inlineData);
	const mimeType = imagePart.inlineData.mimeType; 
  	const base64DataUri = `data:${mimeType};base64,${imagePart.inlineData.data}`;
	return base64DataUri;
}

downloadButton.addEventListener('click', () => {
	if(imageFrame.hasChildNodes() == true && downloadableLink != null)
	{
		downloadLink.href = downloadableLink;
		downloadLink.download = "image.png";
	}
})

submitButton.addEventListener('click', () =>{
	if(imageFrame.hasChildNodes() == true){
		imageFrame.removeChild(...imageFrame.children); 
	}
	submitClicked(); 
});

async function submitClicked(){
	const input = entry.value;
	if(input != ""){
		inputDisplay = input;
		let contentValue = await contentFilterText(input);
		
		if(contentValue == 1){
			const img = document.createElement('img'); 
			img.classList.add('image-frame-loading'); 
			img.src = "../../static/asset/image-loading.gif"; 
			imageFrame.appendChild(img); 
			query({"inputs": input}).then(async (response) => {
				// let base64 = await toBase64(response)
				uploadFile(response).then((url) => {
					console.log(url)
					img.classList.remove('image-frame-loading'); 
					img.classList.add('image-frame-image'); 
					img.src = url;
					if(url != "../../static/asset/bam.svg"){
						display_input(input)
					}
				})
			});
			entry.value = "";
			entry.placeholder = "Type something in..."
		}else{
			if(contentValue == 0){
				entry.value = "";
				entry.placeholder = "Please be appropriate!"; 
				inputDisplay = "Please be appropriate!"
			}else{
				entry.value = "";
				entry.placeholder = "There has been an error.";
				inputDisplay = "There has been an error." 
			}
		}
		display_input("");
	}
	
}

export function display_input(input){
	displayH1.textContent = input;
	imageFrame.appendChild(displayH1);
}
