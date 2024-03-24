#libraries
from PIL import Image, ImageTk
import io
import tkinter as tk
#files
import mixtral
import speech
import ai_camp
import stable
import whisper
import gemma

def determine_action(input_text):
    tasks = {
        "image generation": image_generation,
        "sentence completion": sentence_completion,
        "question answering": question_answering
    }
    clean_input_text = ai_camp.remove_periods_and_commas(input_text).strip()

    for task_name, task_func in tasks.items():
        if task_name in clean_input_text:
            # If a match is found, call the corresponding function
            task_func(clean_input_text)
            break
    else:
        print("No matching task found. Try to speak more clearly.")


def question_answering(text):
    print("You have selected question answering")
    parsed_text = text[18:]
    stripped_text = parsed_text.strip()
    text_input_to_speech_output(stripped_text, "question answering")

def sentence_completion(text):
    print("You have selected sentence completion")
    parsed_text = text[19:]
    stripped_text = parsed_text.strip()
    text_input_to_speech_output(stripped_text, "sentence completion")


def image_generation(text):
    print("You have selected image generation")
    parsed_text = text[16:]
    stripped_text = parsed_text.strip()
    image_bytes = stable.query_image({
	    "inputs": stripped_text,
    })
    image = Image.open(io.BytesIO(image_bytes))
    image.save("./images/img.png")
    

def text_input_to_speech_output(text, command):
    if command == "question answering":
        text_output = mixtral.query_text({
            "inputs": text,
        	"parameters": {
        		"max_length": 32
            }
        })
    elif command == "sentence completion":
        text_output = gemma.query_sentence({
	        "inputs": text,
	        "parameters": {
	        	"max_length": 32
            }
        })

    gen_text = text_output[0]["generated_text"]

    audio_bytes = speech.query_text_to_audio({
    	"inputs": gen_text
    })

    speech.save_audio_wav(audio_bytes)
    speech.play_audio_file()

def on_submit(event=None):
    text = whisper.query_audio_to_text
    determine_action(text)

def main():
    window = tk.Tk()
    mic_button, submit_button = ai_camp.build_window(window)
    mic_button.bind("<Button-1>", ai_camp.record_audio)
    submit_button.bind("<Button-1>", on_submit)
    window.mainloop()
        
        
    # print("Hello! My name is Codie and I am your helpful iCode AI companion!")
    # print("I can do many things such as answer questions, complete sentences, and generate images!")
    # print("Prompt me with key words: 'Image Generation' | 'Sentence Completion' | 'Image Creation'")
    # print("Sample Input: 'Image Creation, A dinosaur eating a pizza.'")
    # print("Type 'record' to start recording your input! You will have 5 seconds to record.")

main()