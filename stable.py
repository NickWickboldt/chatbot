import requests

API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": "Bearer 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"}

def query_image(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.content



