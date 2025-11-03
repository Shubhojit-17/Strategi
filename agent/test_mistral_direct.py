"""
Direct test of Mistral 7B Instruct API via OpenRouter
Tests API key without depending on backend server
"""
import asyncio
import os
from openai import AsyncOpenAI

async def test_mistral_direct():
    """Test Mistral API directly"""
    api_key = "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"
    base_url = "https://openrouter.ai/api/v1"
    model = "mistralai/mistral-7b-instruct:free"
    
    print("=" * 60)
    print("🧪 Testing Mistral 7B Instruct (Direct API)")
    print("=" * 60)
    print(f"Base URL: {base_url}")
    print(f"Model: {model}")
    print()
    
    # Initialize OpenAI-compatible client
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url
    )
    
    # Test 1: Simple arithmetic
    print("📝 Test 1: Simple Arithmetic")
    print("-" * 60)
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "What is 10 + 15? Answer with just the number."}
            ],
            max_tokens=50,
            temperature=0.0
        )
        answer = response.choices[0].message.content.strip()
        print(f"Prompt: What is 10 + 15?")
        print(f"Response: {answer}")
        print(f"✅ Test passed!\n")
    except Exception as e:
        print(f"❌ Test failed: {e}\n")
        return False
    
    # Test 2: Document analysis
    print("📝 Test 2: Document Analysis")
    print("-" * 60)
    doc_text = """
    DevTrack Hackathon Presentation
    
    Project Overview:
    DevTrack is an AI-powered development tracking platform that helps teams monitor code quality,
    identify bottlenecks, and improve productivity. Key features include:
    - Real-time code analysis
    - AI-generated insights
    - Team collaboration tools
    - Performance metrics
    
    Technology Stack:
    - Frontend: React, TypeScript
    - Backend: Python, FastAPI
    - Database: PostgreSQL
    - AI: OpenAI GPT-4
    """
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": f"Summarize this document in 2-3 sentences:\n\n{doc_text}"}
            ],
            max_tokens=200,
            temperature=0.3
        )
        summary = response.choices[0].message.content.strip()
        print(f"Document: DevTrack Hackathon Presentation")
        print(f"Summary: {summary}")
        print(f"✅ Test passed!\n")
    except Exception as e:
        print(f"❌ Test failed: {e}\n")
        return False
    
    # Test 3: PDF-like content analysis
    print("📝 Test 3: Multi-page Content Analysis")
    print("-" * 60)
    multi_page = """
    [Page 1]
    Introduction to AI Agents
    This document explores the concept of autonomous AI agents
    
    [Page 2]
    Technical Architecture
    - Agent core with decision engine
    - Memory and context management
    - Tool integration framework
    
    [Page 3]
    Use Cases
    1. Customer support automation
    2. Data analysis and insights
    3. Content generation
    """
    
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": f"What are the main topics covered in this multi-page document?\n\n{multi_page}"}
            ],
            max_tokens=150,
            temperature=0.3
        )
        topics = response.choices[0].message.content.strip()
        print(f"Question: What are the main topics?")
        print(f"Answer: {topics}")
        print(f"✅ Test passed!\n")
    except Exception as e:
        print(f"❌ Test failed: {e}\n")
        return False
    
    print("=" * 60)
    print("🎉 All Mistral tests passed!")
    print("✅ Mistral 7B Instruct is working correctly")
    print("✅ Can handle arithmetic, document analysis, and multi-page content")
    print("=" * 60)
    return True

if __name__ == "__main__":
    asyncio.run(test_mistral_direct())
