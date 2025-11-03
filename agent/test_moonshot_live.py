"""
Test Moonshot AI integration via OpenRouter with real agent
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

async def test_moonshot_via_openrouter():
    print("="*60)
    print("Testing Moonshot AI via OpenRouter in Agent System")
    print("="*60)
    
    # Set environment for Moonshot via OpenRouter
    os.environ['AI_PROVIDER'] = 'moonshot'
    
    print(f"\nConfiguration:")
    print(f"  API Key: {os.getenv('MOONSHOT_API_KEY', '')[:30]}...")
    print(f"  Base URL: {os.getenv('MOONSHOT_BASE_URL')}")
    print(f"  Model: {os.getenv('MOONSHOT_MODEL')}")
    
    print("\n1. Initializing AIAgent with Moonshot/OpenRouter...")
    try:
        agent = AIAgent()
        print(f"   ✅ Agent initialized")
        print(f"      Provider: {agent.provider}")
        print(f"      Model: {agent.model}")
        print(f"      Client: {type(agent.client).__name__}")
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
        print(f"   A: {response}")
    except Exception as e:
        print(f"   ❌ Query failed: {e}")
        return False
    
    print("\n3. Testing document analysis...")
    context = """
    Artificial Intelligence (AI) is transforming healthcare through:
    - Diagnostic assistance with medical imaging
    - Drug discovery and development
    - Personalized treatment recommendations
    - Patient monitoring and predictive analytics
    """
    
    try:
        response = await agent.execute(
            prompt="List the main applications of AI in healthcare mentioned in this document.",
            context=context,
            max_tokens=150,
            temperature=0.5
        )
        print(f"   ✅ Analysis successful!")
        print(f"\n   Document: AI in Healthcare")
        print(f"   Response:\n   {response}")
    except Exception as e:
        print(f"   ❌ Analysis failed: {e}")
        return False
    
    print("\n4. Testing summarization...")
    long_text = """
    The Somnia blockchain is a high-performance Layer 1 blockchain designed for 
    real-time applications. It features sub-second block times, enabling fast 
    transaction finality. The blockchain uses an innovative consensus mechanism 
    that combines the security of Proof of Stake with the efficiency of practical 
    Byzantine Fault Tolerance. This makes it ideal for applications requiring 
    both speed and decentralization, such as AI agents, gaming, and DeFi.
    """
    
    try:
        response = await agent.summarize(
            text=long_text,
            max_length=50
        )
        print(f"   ✅ Summarization successful!")
        print(f"\n   Original length: {len(long_text)} chars")
        print(f"   Summary: {response}")
    except Exception as e:
        print(f"   ❌ Summarization failed: {e}")
        return False
    
    print("\n" + "="*60)
    print("Integration Test Complete")
    print("="*60)
    print("✅ Moonshot AI via OpenRouter is fully functional!")
    print("\n🎯 Ready for production use:")
    print("   - Set AI_PROVIDER=moonshot in .env")
    print("   - Backend will automatically use Kimi AI")
    print("   - All AI operations logged and tracked")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_moonshot_via_openrouter())
    if success:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
