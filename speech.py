import requests
import os
from IPython.display import Audio
from auth_id import auth_id


# API_URL = "https://api-inference.huggingface.co/models/suno/bark-small"
API_URL = "https://api-inference.huggingface.co/models/facebook/mms-tts-eng"
headers = {"Authorization": "Bearer " + auth_id}

def query_text_to_audio(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content

def save_audio_wav(bytes):
    folder_path = "./audio"
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, "save.wav")
    with open(file_path, "wb") as f:
        f.write(bytes)
    Audio(bytes)

def play_audio_file():
    file_path = "C:\\Users\\nickw\\OneDrive\\Desktop\\chatbot\\audio\\save.wav"
    os.system("start wmplayer \"" + file_path + "\"")
    os.system("timeout /t 25 /nobreak")
    os.system("taskkill /f /im wmplayer.exe")



    
