# Local AI Setup (Free Alternative)

## Quick Setup with Ollama

### 1. Install Ollama
Download from: https://ollama.ai/download
- Windows installer available
- ~200 MB download

### 2. Install a model
```bash
ollama pull llama2
# Or smaller/faster:
ollama pull phi
```

### 3. Update agent/app/agent.py
Replace OpenAI calls with Ollama endpoint

### 4. Test
```bash
ollama run llama2 "Hello from Somnia AI!"
```

## Pros vs Cons

**Ollama (Local):**
- ✅ Free
- ✅ No rate limits  
- ✅ Works offline
- ❌ Requires ~4GB RAM
- ❌ Slower inference
- ❌ Lower quality than GPT-4

**OpenAI (Cloud):**
- ✅ Best quality
- ✅ Fast inference
- ✅ No setup needed
- ❌ Costs ~$2 for hackathon
- ❌ Rate limits
- ❌ Requires internet

## Recommendation

For Somnia AI Hackathon:
- **Use OpenAI** for demo/submission ($2 is worth it)
- **Use Ollama** for development/testing (saves costs)

Want me to set up Ollama integration?
