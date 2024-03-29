import {contentFilterText} from "./content-filter.js";

const app = express();
const PORT = 5500;

const submitButton = document.querySelector(".submit-btn"); 
const imageFrame = document.querySelector(".image-frame"); 
const entry = document.querySelector(".image-gen-entry"); 
const displayDiv = document.querySelector('.display-frame');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'bad'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});

const upload = multer({ storage: storage });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

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
		img.src = "../asset/image-loading.gif"; 
		imageFrame.appendChild(img); 
		query({"inputs": input}).then((response) => {
			img.classList.remove('image-frame-loading'); 
			img.classList.add('image-frame-image'); 
			img.src = URL.createObjectURL(response); 
			upload.single(img.src);
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
	displayDiv.classList.remove('slide-in');
	displayDiv.classList.add('slide-out');
	const inputText = document.createElement('h1');
	inputText.textContent = "You typed: " + input;
	displayDiv.appendChild(inputText);
}

function convertBlob(blob, filename){
	blob.lastModifiedDate = new Date();
	blob.name = filename;

	console.log(blob);
} 