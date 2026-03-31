import sys
import os
sys.path.append(os.getcwd())
from config.settings import settings
import google.generativeai as genai

print(f"Loaded Key: {settings.google_api_key[:10]}...")

try:
    genai.configure(api_key=settings.google_api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, respond with 'OK'")
    print(f"Gemini Response: {response.text.strip()}")
except Exception as e:
    print(f"Gemini Error: {e}")
