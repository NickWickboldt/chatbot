import requests

API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
headers = {"Authorization": "Bearer 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"}

def query_audio_to_text(filename = './audio/user_audio_in.wav'):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    raw_json = response.json()
    text = raw_json['text'].lower()
    return text

# output = query_audio_to_text("./audio/save.wav")
# print(output['text'])