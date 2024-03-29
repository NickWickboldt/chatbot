export async function contentFilterText(textInput){
  let data = new FormData();
  data.append('text', textInput);
  data.append('lang', 'en');
  data.append('opt_countries', 'us,gb,fr');
  data.append('mode', 'rules');
  data.append('api_user', '1820253693');
  data.append('api_secret', 'Yc42azkarSBjGDhqiAHkZNEojyQfB7tm');

  try {
    const response = await axios({
        url: 'https://api.sightengine.com/1.0/text/check.json',
        method: 'post',
        data: data
    });

    if (response.data.profanity.matches.length > 0) {
        return 0; // profanity
    } else {
        let secondaryCheck = checkOtherContent(textInput); 
        return secondaryCheck;
    }
} catch (error) {
    console.error("Error in contentFilterText:", error);
    throw error; 
}
}

function checkOtherContent(textInput){
  const possibilities = [
    "restroom",
    "bathroom",
    "no clothes",
    "chest",
    "no shirt",
    "toilet",
    "changing clothes",
    "kissing",
    "clothingless",
    "making out",
    "revealing",
    "shower",
    "bath",
    "pee"
  ]

  for(const item of possibilities){
    if(textInput.includes(item)){
      return 0; 
    }
  }
  return 1; 
}

export async function contentFilterImage(blobURL){
  let response = await axios.get('https://api.sightengine.com/1.0/check-workflow.json', {
    params: {
      'url': blobURL,
      'workflow': 'wfl_fYMYmqaTT4Hcbfo8SKWRi',
      'api_user': '1820253693',
      'api_secret': 'Yc42azkarSBjGDhqiAHkZNEojyQfB7tm',
    }
  })
  console.log(response); 
  // const anchor = document.createElement('a');
  // anchor.style.display = 'none'; 
  // anchor.href = blobURL;
  // anchor.download = 'image.jpg';
  // document.body.appendChild(anchor);
  // anchor.click();
  // document.body.removeChild(anchor);
}