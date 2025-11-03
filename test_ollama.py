"""
Test Ollama Local AI Connection
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv('agent/.env')

use_local = os.getenv('USE_LOCAL_MODEL', 'false').lower() == 'true'
model = os.getenv('AI_MODEL', 'phi')
endpoint = os.getenv('OLLAMA_ENDPOINT', 'http://localhost:11434')

print("🔍 Testing Ollama Local AI Connection\n")
print(f"Mode: {'🏠 Local (Ollama)' if use_local else '☁️  Cloud (OpenAI)'}")
print(f"Model: {model}")
print(f"Endpoint: {endpoint}\n")

if not use_local:
    print("❌ Error: USE_LOCAL_MODEL is set to false")
    print("Set USE_LOCAL_MODEL=true in agent/.env to use Ollama")
    exit(1)

print("⏳ Checking if Ollama is running...")

try:
    # Check if Ollama is accessible
    response = httpx.get(f"{endpoint}/api/tags", timeout=5.0)
    
    if response.status_code == 200:
        models = response.json().get('models', [])
        print(f"✅ Ollama is running!")
        print(f"📦 Available models: {len(models)}")
        
        model_names = [m['name'] for m in models]
        print(f"   Models: {', '.join(model_names) if model_names else 'None'}")
        
        # Check if our model is available
        if any(model in m['name'] for m in models):
            print(f"✅ Model '{model}' is available!")
        else:
            print(f"⚠️  Model '{model}' not found")
            print(f"   Run: ollama pull {model}")
            exit(1)
    else:
        print(f"❌ Ollama API error: {response.status_code}")
        exit(1)
        
except httpx.ConnectError:
    print("❌ Error: Cannot connect to Ollama")
    print("\n💡 To start Ollama:")
    print("   1. Ollama runs automatically after installation")
    print("   2. Or manually run: ollama serve")
    print("   3. Check Task Manager for 'ollama' process")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

# Test generation
print("\n⏳ Testing text generation...")

try:
    prompt = "Say 'Hello from Somnia AI!' in one sentence."
    
    response = httpx.post(
        f"{endpoint}/api/generate",
        json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 50
            }
        },
        timeout=60.0
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Generation successful!")
        print(f"\n🤖 AI Response:")
        print(f"   {result['response']}")
        print(f"\n📊 Stats:")
        print(f"   Tokens: {result.get('eval_count', 'N/A')}")
        print(f"   Time: {result.get('total_duration', 0) / 1e9:.2f}s")
        
        print(f"\n🎉 Ollama is working perfectly!")
        print(f"💰 Cost: FREE (runs locally)")
        print(f"🚀 Ready to use with your backend!")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
