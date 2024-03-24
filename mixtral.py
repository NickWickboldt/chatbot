import requests

API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
headers = {"Authorization": "Bearer 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"}

def query_text(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	
