from google import genai 

client = genai.Client()

response = client.models.generate_content(
    model="gemini-1.5-pro",
    contents="Explain how AI works in a few words",
)
