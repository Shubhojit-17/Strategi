"""
Test OpenRouter API key for Moonshot/Kimi access
"""
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("MOONSHOT_API_KEY")
BASE_URL = os.getenv("MOONSHOT_BASE_URL", "https://openrouter.ai/api/v1")
MODEL = os.getenv("MOONSHOT_MODEL", "moonshotai/kimi-k2:free")

print("="*60)
print("Testing OpenRouter API for Moonshot/Kimi")
print("="*60)
print(f"API Key: {API_KEY[:30]}...")
print(f"Base URL: {BASE_URL}")
print(f"Model: {MODEL}")
print()

def test_models():
    """Test models endpoint"""
    print("1. Testing Models Endpoint...")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = httpx.get(f"{BASE_URL}/models", headers=headers, timeout=30)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            models = response.json()
            print(f"   ✅ SUCCESS! Found {len(models.get('data', []))} models")
            
            # Find Moonshot models
            moonshot_models = [m for m in models.get('data', []) 
                              if 'moonshot' in m.get('id', '').lower() or 
                                 'kimi' in m.get('id', '').lower()]
            
            if moonshot_models:
                print(f"\n   Moonshot/Kimi models available:")
                for model in moonshot_models[:5]:  # Show first 5
                    model_id = model.get('id', 'unknown')
                    context = model.get('context_length', 'unknown')
                    print(f"      - {model_id} (context: {context})")
            
            return True
        else:
            print(f"   ❌ Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_chat():
    """Test chat completion"""
    print("\n2. Testing Chat Completion...")
    print(f"   Using model: {MODEL}")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/somnia-ai-agents",  # Optional: for tracking
        "X-Title": "Somnia AI Agents"  # Optional: app name
    }
    
    data = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": "Hello! Please introduce yourself in one sentence."
            }
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    try:
        response = httpx.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=60
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            if 'choices' in result and len(result['choices']) > 0:
                content = result['choices'][0]['message']['content']
                usage = result.get('usage', {})
                
                print(f"\n   ✅ SUCCESS!")
                print(f"\n   AI Response:")
                print(f"   {content}")
                print(f"\n   Token Usage:")
                print(f"      Prompt: {usage.get('prompt_tokens', 0)}")
                print(f"      Completion: {usage.get('completion_tokens', 0)}")
                print(f"      Total: {usage.get('total_tokens', 0)}")
                
                return True
            else:
                print(f"   ⚠️ Unexpected response format: {json.dumps(result, indent=2)}")
                return False
        else:
            print(f"   ❌ Error Response:")
            try:
                error_data = response.json()
                print(f"   {json.dumps(error_data, indent=6)}")
            except:
                print(f"   {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    models_ok = test_models()
    chat_ok = test_chat()
    
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    if models_ok and chat_ok:
        print("✅ All tests passed!")
        print(f"\nOpenRouter API is working with Moonshot/Kimi")
        print(f"Model: {MODEL}")
        print(f"\nTo use in your app:")
        print(f"  AI_PROVIDER=moonshot")
        print(f"  MOONSHOT_API_KEY={API_KEY[:30]}...")
        print(f"  MOONSHOT_BASE_URL={BASE_URL}")
        print(f"  MOONSHOT_MODEL={MODEL}")
    else:
        print("❌ Some tests failed")
        print("\nPlease check:")
        print("  1. API key is valid")
        print("  2. Model name is correct")
        print("  3. OpenRouter account is active")
