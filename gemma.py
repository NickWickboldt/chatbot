import requests

API_URL = "https://api-inference.huggingface.co/models/google/gemma-7b"
headers = {"Authorization": "Bearer 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"}

def query_sentence(payload):
	response = requests.post(API_URL, headers=headers, json=payload)
	return response.json()
	


