# 🚀 Quick Start: Moonshot AI

## 1-Minute Setup

### Step 1: Add API Key to .env
```bash
cd d:\strategi\agent
notepad .env
```

Add these lines:
```bash
AI_PROVIDER=moonshot
MOONSHOT_API_KEY=sk-WsubxwwLDBOSeR68fwkleCS44OZ95Lz4Zra9AHZullvxY4nc
MOONSHOT_BASE_URL=https://api.moonshot.ai/v1
MOONSHOT_MODEL=moonshot-v1-8k
```

### Step 2: Activate Account
⚠️ **Account currently suspended** - Add credits at:
https://platform.moonshot.ai/billing

### Step 3: Test
```bash
cd d:\strategi\agent
.\venv\Scripts\python.exe test_moonshot_integration.py
```

Expected output:
```
✅ Moonshot AI support successfully integrated
✅ Provider switching working
✅ OpenAI-compatible client configured
```

### Step 4: Use in Your Code
```python
from app.agent import AIAgent

# Auto-uses Moonshot (from .env)
agent = AIAgent()
response = await agent.execute(
    prompt="Your question",
    context="Your document"
)
```

## Switch Providers Anytime

### Use Ollama (Free, Local)
```bash
AI_PROVIDER=ollama
AI_MODEL=phi
```

### Use OpenAI (Premium)
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-3.5-turbo
```

### Use Moonshot (Balanced)
```bash
AI_PROVIDER=moonshot
MOONSHOT_API_KEY=sk-WsubxwwLDBOSeR68fwkleCS44OZ95Lz4Zra9AHZullvxY4nc
MOONSHOT_MODEL=moonshot-v1-8k
```

## Model Selection

| Model | Context | Best For | Cost |
|-------|---------|----------|------|
| moonshot-v1-8k | 8K tokens | Quick queries | $ |
| moonshot-v1-32k | 32K tokens | Medium docs | $$ |
| moonshot-v1-128k | 128K tokens | Large docs | $$$ |

## Troubleshooting

### "Account suspended"
➡️ Add credits at platform.moonshot.ai

### "Invalid authentication"
➡️ Check API key in .env file

### "Import error: openai"
➡️ Run: `pip install openai`

## Full Documentation

- **Complete Guide**: `MOONSHOT.md`
- **Integration Details**: `MOONSHOT_INTEGRATION_COMPLETE.md`
- **Main README**: `README.md`

---

**Status**: ✅ Ready to use once account is active  
**Support**: Check logs in `agent/logs/app.log`
