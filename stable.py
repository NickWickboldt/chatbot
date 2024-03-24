import requests
from auth_id import auth_id

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": "Bearer " + auth_id}

def query_image(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content



