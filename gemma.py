import requests
from auth_id import auth_id

API_URL = "https://api-inference.huggingface.co/models/google/gemma-7b"
headers = {"Authorization": "Bearer " + auth_id}

def query_sentence(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	


