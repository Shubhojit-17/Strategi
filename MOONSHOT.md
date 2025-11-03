# Moonshot AI (Kimi) Integration Guide

## Overview
This project now supports **Moonshot AI (Kimi)** as an AI provider alongside Ollama and OpenAI. Moonshot AI offers powerful Chinese and English language models with competitive pricing.

## Quick Start

### 1. API Key Configuration
Add your Moonshot API key to `.env`:

```bash
# AI Provider Selection
AI_PROVIDER=moonshot  # Options: ollama, openai, moonshot

# Moonshot AI Configuration
MOONSHOT_API_KEY=sk-WsubxwwLDBOSeR68fwkleCS44OZ95Lz4Zra9AHZullvxY4nc
MOONSHOT_BASE_URL=https://api.moonshot.ai/v1
MOONSHOT_MODEL=moonshot-v1-8k
```

### 2. Available Models

| Model | Context Window | Best For |
|-------|---------------|----------|
| `moonshot-v1-8k` | 8,192 tokens | Short documents, quick responses |
| `moonshot-v1-32k` | 32,768 tokens | Medium documents, detailed analysis |
| `moonshot-v1-128k` | 131,072 tokens | Large documents, comprehensive analysis |
| `kimi-latest` | Variable | Latest model version |

### 3. Using Moonshot AI

The integration is automatic - just set `AI_PROVIDER=moonshot` in your `.env` file:

```python
# In your code (automatic)
from app.agent import AIAgent

# Automatically uses Moonshot based on .env configuration
agent = AIAgent()

# Execute query
response = await agent.execute(
    prompt="What is this document about?",
    context=document_text
)
```

## API Compatibility

Moonshot AI uses an **OpenAI-compatible API**, which means:
- Same request/response format as OpenAI
- Compatible with OpenAI SDK
- Easy migration between providers

### API Endpoint Structure

```python
Base URL: https://api.moonshot.ai/v1

Endpoints:
- GET  /models                    # List available models
- POST /chat/completions          # Chat completion
- POST /embeddings                # Text embeddings (if supported)
```

### Request Format (OpenAI Compatible)

```json
{
  "model": "moonshot-v1-8k",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

### Response Format

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "moonshot-v1-8k",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## Implementation Details

### Code Changes

#### 1. Updated `agent.py`

```python
class AIAgent:
    def __init__(self, provider=None, model=None, api_key=None):
        self.provider = provider or os.getenv("AI_PROVIDER", "ollama")
        
        if self.provider == "moonshot":
            # Moonshot uses OpenAI-compatible client
            api_key = api_key or os.getenv("MOONSHOT_API_KEY")
            base_url = os.getenv("MOONSHOT_BASE_URL", "https://api.moonshot.ai/v1")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url  # Override base URL
            )
```

#### 2. Unified Execution

```python
async def execute(self, prompt, context, **kwargs):
    if self.provider == "ollama":
        return await self._execute_ollama(...)
    elif self.provider in ["openai", "moonshot"]:
        # Same method for both (OpenAI compatible)
        return await self._execute_openai_compatible(...)
```

### Logging Integration

All Moonshot API calls are logged with full details:

```json
{
  "timestamp": "2025-11-01T20:00:00.000000",
  "level": "INFO",
  "logger": "app.agent",
  "message": "AI execution completed",
  "provider": "moonshot",
  "model": "moonshot-v1-8k",
  "prompt_length": 150,
  "response_length": 450,
  "duration_ms": 1250
}
```

## Testing

### Test Moonshot API Connection

```bash
cd agent
python test_moonshot.py
```

Expected output:
```
✅ SUCCESS! Available Models:
  - moonshot-v1-8k
  - moonshot-v1-32k
  - moonshot-v1-128k
  - kimi-latest

✅ Working configuration:
   Base URL: https://api.moonshot.ai/v1
   API Key: sk-Wsubxww...
```

### Test AI Execution

```python
import asyncio
from app.agent import AIAgent
import os

os.environ['AI_PROVIDER'] = 'moonshot'
os.environ['MOONSHOT_API_KEY'] = 'sk-...'
os.environ['MOONSHOT_MODEL'] = 'moonshot-v1-8k'

agent = AIAgent()
response = asyncio.run(agent.execute(
    prompt="What is artificial intelligence?",
    context="AI is the simulation of human intelligence..."
))

print(response)
```

## Switching Between Providers

### Option 1: Environment Variable (Recommended)

```bash
# Use Moonshot AI
AI_PROVIDER=moonshot

# Use Ollama (local, free)
AI_PROVIDER=ollama

# Use OpenAI
AI_PROVIDER=openai
```

### Option 2: Code Override

```python
# Force Moonshot for specific agent
agent = AIAgent(provider="moonshot", model="moonshot-v1-128k")

# Force Ollama
agent = AIAgent(provider="ollama", model="phi")

# Force OpenAI
agent = AIAgent(provider="openai", model="gpt-4")
```

## Error Handling

### Common Errors

#### 1. Authentication Error (401)
```
Error: Invalid Authentication
```
**Solution**: Check API key is correct and active

#### 2. Quota Exceeded (429)
```
Error: Your account is suspended, please check your plan and billing
```
**Solution**: 
- Add credits to Moonshot account
- Check billing status at platform.moonshot.ai
- Temporarily switch to Ollama: `AI_PROVIDER=ollama`

#### 3. Model Not Found (404)
```
Error: Model 'xyz' not found
```
**Solution**: Use valid model name from available models list

### Fallback Strategy

The system automatically falls back to Ollama if Moonshot fails:

```python
try:
    agent = AIAgent(provider="moonshot")
    response = await agent.execute(prompt, context)
except Exception as e:
    logger.warning(f"Moonshot failed: {e}, falling back to Ollama")
    agent = AIAgent(provider="ollama")
    response = await agent.execute(prompt, context)
```

## Pricing Comparison

| Provider | Cost per 1M tokens | Speed | Quality | Local |
|----------|-------------------|-------|---------|-------|
| **Ollama** | Free | Medium | Good | ✅ Yes |
| **Moonshot (8k)** | ~$0.12 | Fast | Excellent | ❌ No |
| **Moonshot (32k)** | ~$0.24 | Fast | Excellent | ❌ No |
| **OpenAI GPT-3.5** | ~$0.50 | Fast | Excellent | ❌ No |
| **OpenAI GPT-4** | ~$30.00 | Slow | Best | ❌ No |

## Best Practices

### 1. Model Selection
- **8k model**: Quick responses, simple queries
- **32k model**: Detailed analysis, medium documents
- **128k model**: Comprehensive analysis, large documents

### 2. Cost Optimization
```python
# Use smaller model for summaries
agent = AIAgent(model="moonshot-v1-8k")
summary = await agent.summarize(long_text, max_length=200)

# Use larger model for complex analysis
agent = AIAgent(model="moonshot-v1-128k")
analysis = await agent.execute(complex_prompt, large_context)
```

### 3. Error Handling
```python
import asyncio

async def execute_with_retry(agent, prompt, context, max_retries=3):
    for attempt in range(max_retries):
        try:
            return await agent.execute(prompt, context)
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

### 4. Logging
All AI executions are automatically logged:
- Provider used
- Model name
- Token usage (if available)
- Execution time
- Success/failure status

Check logs:
```bash
cat logs/app.log | jq 'select(.logger == "app.agent")'
```

## API Documentation

Official Moonshot AI documentation: https://platform.moonshot.ai/docs/

Key sections:
- **Authentication**: API key management
- **Models**: Available models and capabilities
- **API Reference**: Endpoint documentation
- **Rate Limits**: Request quotas and limits
- **Billing**: Pricing and payment

## Troubleshooting

### Issue: "Account suspended"
**Cause**: Quota exceeded or billing issue  
**Fix**: Add credits or switch to Ollama

### Issue: Slow responses
**Cause**: Large context or complex query  
**Fix**: Use smaller model or reduce context size

### Issue: "Module openai not found"
**Cause**: Missing dependency  
**Fix**: `pip install openai`

### Issue: Inconsistent results
**Cause**: High temperature setting  
**Fix**: Lower temperature (0.3-0.5 for consistency)

## Future Enhancements

- [ ] Streaming responses for real-time output
- [ ] Token usage tracking and cost estimation
- [ ] Automatic model selection based on context size
- [ ] Response caching to reduce API calls
- [ ] Multi-provider load balancing

## Support

For issues with:
- **Moonshot API**: support@moonshot.ai
- **Integration**: Check logs in `logs/app.log`
- **Billing**: platform.moonshot.ai/billing

---

**Status**: ✅ Moonshot AI integration complete and tested
**Last Updated**: November 1, 2025
