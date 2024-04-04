import {contentFilterText, toBase64, uploadFile} from "./content-filter.js";

const submitButton = document.querySelector(".submit-btn"); 
const downloadButton = document.querySelector(".download-btn");
const downloadLink = document.querySelector(".download-link");
const imageFrame = document.querySelector(".image-frame"); 
const entry = document.querySelector(".image-gen-entry");
const displayH1 = document.createElement('h1'); 
var imageSRC;

async function query(data) {
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

downloadButton.addEventListener('click', () => {
	if(imageFrame.hasChildNodes() == true)
	{
		downloadLink.href = imageSRC;
		downloadLink.download = "image.png";
		downloadLink.click();
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
	let contentValue = await contentFilterText(input);

	if(contentValue == 1){
		const img = document.createElement('img'); 
		img.classList.add('image-frame-loading'); 
		img.src = "../../static/asset/image-loading.gif"; 
		imageFrame.appendChild(img); 
		query({"inputs": input}).then(async (response) => {
			let base64 = await toBase64(response)
			uploadFile(base64).then((url) => {
				img.classList.remove('image-frame-loading'); 
				img.classList.add('image-frame-image'); 
				img.src = url;
				imageSRC = base64;
			})
		});
		entry.value = "";
		entry.placeholder = "Type something in..."
	}else{
		if(contentValue == 0){
			entry.value = "";
			entry.placeholder = "Please be appropriate!"; 
		}else{
			entry.value = "";
			entry.placeholder = "There has been an error."; 
		}
	}
	display_input(input);
}

function display_input(input){
	displayH1.textContent = input;
	imageFrame.appendChild(displayH1);
}
