"""Quick test of Google Gemini API"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = "AIzaSyAWa5RW8WfmlTCnSF_hNzJU5q27llQs3t0"
genai.configure(api_key=api_key)

print("Testing Gemini API...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("What is 5 + 7? Answer with just the number.")
    print(f"✅ Success: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
