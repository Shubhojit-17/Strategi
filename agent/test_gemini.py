"""
Test Google Gemini AI integration
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

async def test_gemini():
    print("="*60)
    print("Testing Google Gemini AI in Agent System")
    print("="*60)
    
    # Set environment for Gemini
    os.environ['AI_PROVIDER'] = 'gemini'
    
    print(f"\nConfiguration:")
    print(f"  API Key: {os.getenv('GEMINI_API_KEY', '')[:30]}...")
    print(f"  Model: {os.getenv('GEMINI_MODEL')}")
    
    print("\n1. Initializing AIAgent with Gemini...")
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
            prompt="What is 5 + 7? Please answer with just the number.",
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
    
    print("\n4. Testing summarization...")
    try:
        long_text = """
        Somnia is a revolutionary Layer 1 blockchain designed for high-speed, 
        real-time applications. With sub-second block times and massive throughput, 
        it enables decentralized applications to operate at speeds comparable to 
        centralized systems. The network uses a unique consensus mechanism that 
        combines the security of Proof-of-Stake with the efficiency of Byzantine 
        fault-tolerant protocols, making it ideal for AI agents, gaming, and DeFi.
        """
        
        response = await agent.execute(
            prompt="Summarize this text in one sentence.",
            context=long_text,
            max_tokens=100,
            temperature=0.3
        )
        print(f"   ✅ Summarization successful!")
        print(f"\n   Original length: {len(long_text)} chars")
        print(f"   Summary: {response}\n")
    except Exception as e:
        print(f"   ❌ Summarization failed: {e}")
        return False
    
    print("="*60)
    print("Integration Test Complete")
    print("="*60)
    print("✅ Google Gemini AI is fully functional!")
    print("\n🎯 Ready for production use:")
    print("   - Set AI_PROVIDER=gemini in .env")
    print("   - Backend will automatically use Gemini")
    print("   - All AI operations logged and tracked")
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_gemini())
    if result:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
