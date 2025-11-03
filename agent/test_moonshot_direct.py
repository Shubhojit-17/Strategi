"""
Test Moonshot AI with new API key from platform.moonshot.ai
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.agent import AIAgent
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)

load_dotenv()

async def test_moonshot_direct():
    print("="*60)
    print("Testing Moonshot AI Direct Platform")
    print("="*60)
    
    # Set environment for Moonshot
    os.environ['AI_PROVIDER'] = 'moonshot'
    
    print(f"\nConfiguration:")
    print(f"  API Key: {os.getenv('MOONSHOT_API_KEY', '')[:30]}...")
    print(f"  Base URL: {os.getenv('MOONSHOT_BASE_URL')}")
    print(f"  Model: {os.getenv('MOONSHOT_MODEL')}")
    
    print("\n1. Initializing AIAgent with Moonshot...")
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
            prompt="What is 5 + 7?",
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
    
    print("\n3. Testing document analysis...")
    try:
        document = """
        Artificial Intelligence in Healthcare
        
        AI is transforming healthcare through various applications:
        - Diagnostic imaging analysis
        - Drug discovery and development
        - Personalized treatment plans
        - Patient monitoring and predictive analytics
        """
        
        response = await agent.execute(
            prompt="List the key applications of AI in healthcare mentioned in the document.",
            context=document,
            max_tokens=200,
            temperature=0.5
        )
        print(f"   ✅ Analysis successful!")
        print(f"\n   Document: AI in Healthcare")
        print(f"   Response:\n   {response}\n")
    except Exception as e:
        print(f"   ❌ Analysis failed: {e}")
        return False
    
    print("="*60)
    print("✅ Moonshot AI Direct Platform is working!")
    print("="*60)
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_moonshot_direct())
    if result:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
