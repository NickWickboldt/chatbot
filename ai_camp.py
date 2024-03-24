import pyaudio
import wave
from PIL import Image, ImageTk
import tkinter as tk

def record_audio(event=None):
    event.widget.configure(bg="#FF0000")
    # Define audio recording parameters
    FORMAT = pyaudio.paInt16  # Sample size and format
    CHANNELS = 1  # Number of audio channels (1 for mono, 2 for stereo)
    RATE = 44100  # Sample rate (samples per second)
    CHUNK = 1024  # Number of frames per buffer

    # Initialize PyAudio
    audio = pyaudio.PyAudio()

    # Open audio stream for recording
    stream = audio.open(format=FORMAT, channels=CHANNELS,
                    rate=RATE, input=True,
                    frames_per_buffer=CHUNK)

    print("Recording...")

    # Create a WAV file for writing
    output_file = wave.open("./audio/user_audio_in.wav", "wb")
    output_file.setnchannels(CHANNELS)
    output_file.setsampwidth(audio.get_sample_size(FORMAT))
    output_file.setframerate(RATE)

    # Record audio data in chunks and write to file
    frames = []
    for _ in range(int(RATE / CHUNK * 5)):  # Record for 5 seconds
        data = stream.read(CHUNK)
        frames.append(data)
        output_file.writeframes(data)

    print("Recording finished.")

    # Close the audio stream and file
    stream.stop_stream()
    stream.close()
    audio.terminate()
    output_file.close()
    event.widget.configure(bg="#DC8686")

def remove_periods_and_commas(input_string):
    # Use a generator expression to filter out periods and commas
    filtered_chars = (char for char in input_string if char not in (',', '.'))
    # Join the filtered characters back into a string
    return ''.join(filtered_chars)

def build_window(window):
    window.title("iCode Assistant Bot")
    window.geometry("600x300")  # width x height
    window.configure(bg="#FAF3F0")
    title = tk.Label(window, text="Hello, my name is Codie!", 
                     bg="#FAF3F0", fg="#31363F", font=("Arial", 15, "bold"), pady=5)
    title.pack()

    input_frame = tk.Frame(window, bg="#FAF3F0", bd=0)
    input_frame.pack(side=tk.BOTTOM, pady=5)

    entry_title = tk.Label(input_frame, text="Type, or press the mic to talk to Codie", 
                           bg="#FAF3F0", fg="#31363F", font=("Arial", 10, "bold"))
    entry_title.pack(side=tk.TOP)

    entry = tk.Entry(input_frame, width=70)  # Adjust the width as needed
    entry.pack(side=tk.LEFT, pady=5, padx=(0, 5))  # Place the entry field on the left side of the frame

    og_img = Image.open("./asset/mic-icon.png")
    resize_img = og_img.resize((20, 20))
    mic_image = ImageTk.PhotoImage(resize_img)

    mic_button = tk.Button(input_frame, image=mic_image, width=20, height=20, bg="#DC8686")
    mic_button.image = mic_image  # Keep a reference to the image object
    mic_button.pack(side=tk.LEFT, padx=5, pady=5)  # Place the button next to the entry field

    submit_button = tk.Button(input_frame, text="Submit", bg="#82A0D8")
    submit_button.pack(side=tk.LEFT, padx=5, pady=5)  # Place the button next to the entry field

    return mic_button, submit_button