import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv('agent/.env')

api_key = os.getenv('OPENAI_API_KEY')

if not api_key or api_key == 'your_openai_api_key_here':
    print("❌ Error: OPENAI_API_KEY not set in agent/.env")
    print("Please add your OpenAI API key to agent/.env file")
    exit(1)

print("🔍 Testing OpenAI connection...")
print(f"📝 API key starts with: {api_key[:15]}...")

client = OpenAI(api_key=api_key)

try:
    print("\n⏳ Sending test request to GPT-3.5-turbo...")
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant for the Somnia AI Hackathon."},
            {"role": "user", "content": "Say 'Hello from Somnia AI Agents!' in one enthusiastic sentence."}
        ],
        max_tokens=50,
        temperature=0.7
    )
    
    print("\n✅ OpenAI connected successfully!")
    print(f"\n🤖 AI Response:")
    print(f"   {response.choices[0].message.content}")
    print(f"\n📊 Usage Statistics:")
    print(f"   Prompt tokens: {response.usage.prompt_tokens}")
    print(f"   Completion tokens: {response.usage.completion_tokens}")
    print(f"   Total tokens: {response.usage.total_tokens}")
    print(f"   Estimated cost: ${response.usage.total_tokens * 0.000002:.6f}")
    
    print(f"\n🎯 Model: {response.model}")
    print(f"⚡ Response ID: {response.id}")
    
except Exception as e:
    error_msg = str(e)
    print(f"\n❌ Error: {error_msg}")
    
    if "Incorrect API key" in error_msg or "invalid_api_key" in error_msg:
        print("\n💡 Tips:")
        print("   1. Check that your API key is correct")
        print("   2. Make sure it starts with 'sk-proj-' or 'sk-'")
        print("   3. Verify the key is active in OpenAI dashboard")
        print("   4. No spaces before/after the key in .env file")
    elif "exceeded your current quota" in error_msg or "insufficient_quota" in error_msg:
        print("\n💡 Tips:")
        print("   1. Add payment method at: https://platform.openai.com/account/billing")
        print("   2. Check your usage at: https://platform.openai.com/usage")
        print("   3. Verify payment method is verified (may take 5-10 minutes)")
    elif "Rate limit" in error_msg:
        print("\n💡 Tips:")
        print("   1. Wait a few seconds and try again")
        print("   2. Free tier has strict rate limits")
        print("   3. Consider upgrading to paid tier")
    else:
        print("\n💡 Check your internet connection and OpenAI status:")
        print("   https://status.openai.com/")
