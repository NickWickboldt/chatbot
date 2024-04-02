const cloudinaryCloudname = "dmm8zr0az"

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
        return 1; 
    }
} catch (error) {
    console.error("Error in contentFilterText:", error);
    throw error; 
}
}

export async function toBase64(blobURL){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
        const base64 = reader.result;
        resolve(base64);
    };
    reader.onerror = function (error) {
        reject(error);
    };
    reader.readAsDataURL(blobURL);
});
}

export function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryCloudname}/upload`;
    const fd = new FormData();
    fd.append('upload_preset', 'jb97dxcc');
    fd.append('file', file);

    fetch(url, {
        method: 'POST',
        body: fd,
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to upload file');
        }
        return response.json();
    })
    .then((data) => {
        let url = data.secure_url;
        filterImage(url).then((response) => {
          if(response.data.summary.action == 'reject'){
            url = "../../static/asset/bam.svg";
            resolve(url);
          }else{
            resolve(url); 
          }
        }); 
    })
    .catch((error) => {
        console.error('Error uploading the file:', error);
        reject(error); 
    });
});
}

export async function filterImage(url){
   let response = await axios.get('https://api.sightengine.com/1.0/check-workflow.json', {
    params: {
      'url': url,
      'workflow': 'wfl_fYMYmqaTT4Hcbfo8SKWRi',
      'api_user': '1820253693',
      'api_secret': 'Yc42azkarSBjGDhqiAHkZNEojyQfB7tm',
    }
  })
  return response; 
}