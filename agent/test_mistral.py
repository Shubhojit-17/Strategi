"""Test Mistral 7B Instruct via OpenRouter"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.agent import AIAgent
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
load_dotenv()

async def test_mistral():
    print("="*60)
    print("Testing Mistral 7B Instruct via OpenRouter")
    print("="*60)
    
    os.environ['AI_PROVIDER'] = 'mistral'
    
    print(f"\nConfiguration:")
    print(f"  API Key: {os.getenv('MISTRAL_API_KEY', '')[:30]}...")
    print(f"  Base URL: {os.getenv('MISTRAL_BASE_URL')}")
    print(f"  Model: {os.getenv('MISTRAL_MODEL')}")
    
    print("\n1. Initializing AIAgent with Mistral...")
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
            prompt="What is 10 + 15? Answer with just the number.",
            context="Simple arithmetic problem",
            max_tokens=50,
            temperature=0.3
        )
        print(f"   ✅ Query successful!")
        print(f"\n   Q: What is 10 + 15?")
        print(f"   A: {response}\n")
    except Exception as e:
        print(f"   ❌ Query failed: {e}")
        return False
    
    print("\n3. Testing document analysis...")
    try:
        document = """
        DevTrack Hackathon Presentation
        
        Project: AI-Powered Code Review System
        Team Members: Alice, Bob, Charlie
        Tech Stack: Python, FastAPI, OpenAI, Docker
        
        Features:
        - Automated code quality analysis
        - Security vulnerability detection
        - Performance optimization suggestions
        - Real-time collaboration tools
        """
        
        response = await agent.execute(
            prompt="Summarize the key features of this project in 3 bullet points.",
            context=document,
            max_tokens=200,
            temperature=0.5
        )
        print(f"   ✅ Document analysis successful!")
        print(f"\n   Response: {response}\n")
    except Exception as e:
        print(f"   ❌ Document analysis failed: {e}")
        return False
    
    print("="*60)
    print("✅ Mistral 7B Instruct is working!")
    print("="*60)
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_mistral())
    if result:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
