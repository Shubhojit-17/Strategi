"""
Test Moonshot AI API to understand its structure and compatibility
"""
import httpx
import json

# Moonshot API follows OpenAI's API specification
API_KEY = "sk-WsubxwwLDBOSeR68fwkleCS44OZ95Lz4Zra9AHZullvxY4nc"

# Try multiple possible base URLs
BASE_URLS = [
    "https://api.moonshot.cn/v1",
    "https://api.moonshot.com/v1",
    "https://api.moonshot.ai/v1"
]

def test_models():
    """Test available models endpoint"""
    print("="*60)
    print("Testing Moonshot API - Models Endpoint")
    print("="*60)
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    for base_url in BASE_URLS:
        print(f"\nTrying {base_url}...")
        try:
            response = httpx.get(f"{base_url}/models", headers=headers, timeout=30)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                models = response.json()
                print(f"\n✅ SUCCESS! Available Models:")
                for model in models.get('data', []):
                    print(f"  - {model.get('id', 'unknown')}")
                return base_url  # Return working URL
            else:
                print(f"Response: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")
    
    return None

def test_chat_completion(base_url):
    """Test chat completion endpoint"""
    if not base_url:
        print("\n❌ No working base URL found")
        return
        
    print("\n" + "="*60)
    print("Testing Moonshot API - Chat Completion")
    print("="*60)
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try different model names
    models_to_try = [
        "moonshot-v1-8k",
        "moonshot-v1-32k",
        "moonshot-v1-128k",
        "kimi"
    ]
    
    for model in models_to_try:
        print(f"\nTrying model: {model}")
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Hello! Please introduce yourself briefly."}
            ],
            "temperature": 0.7,
            "max_tokens": 100
        }
        
        try:
            response = httpx.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=data,
                timeout=60
            )
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n✅ SUCCESS with model: {model}")
                print(json.dumps(result, indent=2))
                
                if 'choices' in result and len(result['choices']) > 0:
                    content = result['choices'][0]['message']['content']
                    print(f"\nAI Response: {content}")
                return model  # Return working model
            else:
                print(f"Response: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    working_url = test_models()
    if working_url:
        test_chat_completion(working_url)
        print(f"\n✅ Working configuration:")
        print(f"   Base URL: {working_url}")
        print(f"   API Key: {API_KEY[:20]}...")
    else:
        print("\n❌ Could not find working Moonshot API configuration")
        print("   Please verify:")
        print("   1. API key is valid")
        print("   2. API key has proper permissions")
        print("   3. Account is active")
