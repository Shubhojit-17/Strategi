"""Test DeepSeek R1 via OpenRouter"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.agent import AIAgent
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

async def test_deepseek():
    print("="*60)
    print("Testing DeepSeek R1 via OpenRouter")
    print("="*60)
    
    os.environ['AI_PROVIDER'] = 'deepseek'
    
    print(f"\nConfiguration:")
    print(f"  API Key: {os.getenv('DEEPSEEK_API_KEY', '')[:30]}...")
    print(f"  Base URL: {os.getenv('DEEPSEEK_BASE_URL')}")
    print(f"  Model: {os.getenv('DEEPSEEK_MODEL')}")
    
    print("\n1. Initializing AIAgent with DeepSeek...")
    try:
        agent = AIAgent()
        print(f"   ✅ Agent initialized")
        print(f"      Provider: {agent.provider}")
        print(f"      Model: {agent.model}")
    except Exception as e:
        print(f"   ❌ Initialization failed: {e}")
        return False
    
    print("\n2. Testing simple query...")
    try:
        response = await agent.execute(
            prompt="What is 5 + 7? Answer with just the number.",
            context="Simple arithmetic problem",
            max_tokens=50,
            temperature=0.3
        )
        print(f"   ✅ Query successful!")
        print(f"\n   Q: What is 5 + 7?")
        print(f"   A: {response}\n")
    except Exception as e:
        print(f"   ❌ Query failed: {e}")
        return False
    
    print("\n3. Testing reasoning...")
    try:
        response = await agent.execute(
            prompt="If a train travels at 60 km/h for 2 hours, how far does it go?",
            context="Physics problem requiring reasoning",
            max_tokens=200,
            temperature=0.5
        )
        print(f"   ✅ Reasoning successful!")
        print(f"\n   Response: {response}\n")
    except Exception as e:
        print(f"   ❌ Reasoning failed: {e}")
        return False
    
    print("="*60)
    print("✅ DeepSeek R1 is working!")
    print("="*60)
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_deepseek())
    if result:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
