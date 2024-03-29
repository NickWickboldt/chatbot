const textButton = document.querySelector(".text-button"); 
const textBody = document.querySelector("body"); 





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

// query({"inputs": "What is an elephant?"}).then((response) => {
// 	console.log(response[0].generated_text);
// });

textButton.addEventListener('click', () =>{
  query({"inputs": "What is a tiger"}).then((response) => {
    const text = document.createElement('p'); 
    text.innerHTML = response[0].generated_text; 
    textBody.appendChild(text); 
  });
});