from transformers import pipeline
generator = pipeline('text-generation', model='gpt2-medium')

print("start")
item = generator("What color is the sky?", max_length=50, num_return_sequences=1, truncation = True)

textItem = item[0]["generated_text"]

try:
    # Find the position of the first period
    period_index = textItem.rfind('.')
    
    # Truncate the string at the period
    truncated_string = textItem[:period_index + 1]  # Include the period in the truncated string
    print(truncated_string)
except ValueError:
    print("Period not found in the string.")

