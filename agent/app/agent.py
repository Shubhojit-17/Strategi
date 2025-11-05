"""
AI Agent - LLM execution with trace logging
Supports OpenAI API, Moonshot AI (Kimi), Google Gemini, or local models (Ollama)
"""

import os
import logging
from typing import Optional, Dict, Any, List
import asyncio
import httpx

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

logger = logging.getLogger(__name__)


class AIAgent:
    """AI agent that executes LLM queries with verifiable logging"""
    
    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        provider: Optional[str] = None,
        local_endpoint: str = "http://localhost:11434"
    ):
        # Determine provider from env or parameter
        self.provider = provider or os.getenv("AI_PROVIDER", "ollama").lower()
        self.model = model or os.getenv("AI_MODEL", "phi")
        
        logger.info(f"Initializing AI Agent: provider={self.provider}, model={self.model}")
        
        if self.provider == "ollama":
            self.local_endpoint = local_endpoint or os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
            self.client = None
            logger.info(f"Using Ollama at {self.local_endpoint}")
            
        elif self.provider == "openai":
            if not OPENAI_AVAILABLE:
                raise ImportError("openai package not installed. Run: pip install openai")
            
            api_key = api_key or os.getenv("OPENAI_API_KEY")
            if not api_key or api_key == "your_openai_api_key_here":
                raise ValueError("OpenAI API key not configured")
            
            self.client = AsyncOpenAI(api_key=api_key)
            logger.info(f"Using OpenAI with model {self.model}")
            
        elif self.provider == "moonshot":
            if not OPENAI_AVAILABLE:
                raise ImportError("openai package not installed. Run: pip install openai")
            
            # Moonshot uses OpenAI-compatible API
            api_key = api_key or os.getenv("MOONSHOT_API_KEY")
            base_url = os.getenv("MOONSHOT_BASE_URL", "https://api.moonshot.ai/v1")
            
            if not api_key:
                raise ValueError("Moonshot API key not configured. Set MOONSHOT_API_KEY in .env")
            
            # Override model with Moonshot model if not specified
            if not model:
                self.model = os.getenv("MOONSHOT_MODEL", "moonshot-v1-8k")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url
            )
            logger.info(f"Using Moonshot AI (Kimi) with model {self.model} at {base_url}")
            
        elif self.provider == "gemini":
            if not GEMINI_AVAILABLE:
                raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")
            
            api_key = api_key or os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise ValueError("Gemini API key not configured. Set GEMINI_API_KEY in .env")
            
            # Configure Gemini
            genai.configure(api_key=api_key)
            
            # Override model with Gemini model if not specified
            if not model:
                self.model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")
            
            self.client = None  # Will create on first use
            logger.info(f"Using Google Gemini with model {self.model}")
            
        elif self.provider == "deepseek":
            if not OPENAI_AVAILABLE:
                raise ImportError("openai package not installed. Run: pip install openai")
            
            # DeepSeek uses OpenAI-compatible API via OpenRouter
            api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
            base_url = os.getenv("DEEPSEEK_BASE_URL", "https://openrouter.ai/api/v1")
            
            if not api_key:
                raise ValueError("DeepSeek API key not configured. Set DEEPSEEK_API_KEY in .env")
            
            # Override model with DeepSeek model if not specified
            if not model:
                self.model = os.getenv("DEEPSEEK_MODEL", "deepseek/deepseek-r1:free")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url
            )
            logger.info(f"Using DeepSeek R1 via OpenRouter with model {self.model} at {base_url}")
            
        elif self.provider == "mistral":
            if not OPENAI_AVAILABLE:
                raise ImportError("openai package not installed. Run: pip install openai")
            
            # Mistral uses OpenAI-compatible API via OpenRouter
            api_key = api_key or os.getenv("MISTRAL_API_KEY")
            base_url = os.getenv("MISTRAL_BASE_URL", "https://openrouter.ai/api/v1")
            
            if not api_key:
                raise ValueError("Mistral API key not configured. Set MISTRAL_API_KEY in .env")
            
            # Override model with Mistral model if not specified
            if not model:
                self.model = os.getenv("MISTRAL_MODEL", "mistralai/mistral-7b-instruct:free")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url
            )
            logger.info(f"Using Mistral 7B Instruct via OpenRouter with model {self.model} at {base_url}")
            
        elif self.provider == "mai":
            if not OPENAI_AVAILABLE:
                raise ImportError("openai package not installed. Run: pip install openai")
            
            # Microsoft Mai-DS-R1 uses OpenAI-compatible API via OpenRouter
            api_key = api_key or os.getenv("MAI_API_KEY")
            base_url = os.getenv("MAI_BASE_URL", "https://openrouter.ai/api/v1")
            
            if not api_key:
                raise ValueError("Mai API key not configured. Set MAI_API_KEY in .env")
            
            # Override model with Mai model if not specified
            if not model:
                self.model = os.getenv("MAI_MODEL", "microsoft/mai-ds-r1:free")
            
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url
            )
            logger.info(f"Using Microsoft Mai-DS-R1 via OpenRouter with model {self.model} at {base_url}")
            
        else:
            raise ValueError(f"Unknown AI provider: {self.provider}. Options: ollama, openai, moonshot, gemini, deepseek, mistral, mai")
    
    async def execute(
        self,
        prompt: str,
        context: str,
        verifiable_agent: Optional[Any] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        """
        Execute LLM query with optional verifiable logging
        
        Args:
            prompt: User prompt
            context: Document context
            verifiable_agent: Optional VerifiableAgent for step logging
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
        
        Returns:
            LLM response text
        """
        
        logger.info(f"Executing AI query: provider={self.provider}, model={self.model}")
        logger.debug(f"Prompt: {prompt[:100]}...")
        
        # Build messages
        messages = [
            {
                "role": "system",
                "content": "You are a helpful AI assistant analyzing documents. Provide accurate, concise answers based on the given context."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {prompt}"
            }
        ]
        
        # Log prompt step
        if verifiable_agent:
            verifiable_agent.log_step("llm_call", {
                "provider": self.provider,
                "model": self.model,
                "prompt": prompt,
                "context_length": len(context),
                "max_tokens": max_tokens,
                "temperature": temperature
            })
        
        # Route to appropriate provider
        if self.provider == "ollama":
            response_text = await self._execute_ollama(messages, max_tokens, temperature)
        elif self.provider in ["openai", "moonshot", "deepseek", "mistral", "mai"]:
            response_text = await self._execute_openai_compatible(messages, max_tokens, temperature)
        elif self.provider == "gemini":
            response_text = await self._execute_gemini(prompt, context, max_tokens, temperature)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
        
        # Log response step
        if verifiable_agent:
            verifiable_agent.log_step("llm_response", {
                "provider": self.provider,
                "model": self.model,
                "response": response_text,
                "response_length": len(response_text)
            })
        
        logger.info(f"AI execution completed: {len(response_text)} chars")
        return response_text
    
    async def _execute_openai_compatible(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Execute via OpenAI-compatible API (OpenAI or Moonshot)"""
        
        logger.debug(f"Calling {self.provider} API with model {self.model}")
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            result = response.choices[0].message.content
            logger.info(f"{self.provider} API call successful")
            return result
            
        except Exception as e:
            logger.error(f"{self.provider} API call failed: {e}")
            raise
    
    async def _execute_ollama(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int,
        temperature: float
    ) -> str:
        """Execute via local Ollama"""
        
        logger.debug(f"Calling Ollama at {self.local_endpoint}")
        
        try:
            # Format messages for Ollama
            prompt = "\n\n".join([f"{m['role']}: {m['content']}" for m in messages])
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.local_endpoint}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature,
                            "num_predict": max_tokens
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()["response"]
                    logger.info("Ollama inference successful")
                    return result
                else:
                    raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Ollama inference failed: {e}")
            raise Exception(
                f"Local model inference failed: {str(e)}\n"
                f"Make sure Ollama is running: 'ollama serve'\n"
                f"And model is pulled: 'ollama pull {self.model}'"
            )
    
    async def summarize(
        self,
        text: str,
        verifiable_agent: Optional[Any] = None,
        max_length: int = 200
    ) -> str:
        """Summarize text"""
        
        prompt = f"Summarize the following text in {max_length} words or less:"
        return await self.execute(prompt, text, verifiable_agent)
    
    async def qa(
        self,
        question: str,
        context: str,
        verifiable_agent: Optional[Any] = None
    ) -> str:
        """Question answering"""
        
        return await self.execute(question, context, verifiable_agent)
    
    async def extract_entities(
        self,
        text: str,
        verifiable_agent: Optional[Any] = None
    ) -> List[str]:
        """Extract named entities"""
        
        prompt = "Extract all named entities (people, organizations, locations) from this text. Return as a JSON array."
        
        response = await self.execute(prompt, text, verifiable_agent)
        
        # Try to parse JSON
        try:
            import json
            entities = json.loads(response)
            if isinstance(entities, list):
                return entities
        except:
            pass
        
        # Fallback: split by newlines
        return [line.strip() for line in response.split('\n') if line.strip()]
    
    async def _execute_gemini(
        self,
        prompt: str,
        context: str,
        max_tokens: int,
        temperature: float
    ) -> str:
        """Execute via Google Gemini API"""
        
        logger.debug(f"Calling Gemini API with model {self.model}")
        
        try:
            # Create model instance
            model = genai.GenerativeModel(self.model)
            
            # Combine context and prompt for Gemini
            full_prompt = f"""Context:
{context}

Question: {prompt}

Please provide a clear, accurate answer based on the context provided."""
            
            # Generate content
            response = await asyncio.to_thread(
                model.generate_content,
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=max_tokens,
                )
            )
            
            result = response.text
            logger.info(f"Gemini API call successful")
            return result
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise


# ============ Example Usage ============

async def example_usage():
    """Demonstrate AI agent"""
    
    from .verifiable import VerifiableAgent, DIDKey
    
    # Create agents
    verifiable_agent = VerifiableAgent(DIDKey())
    ai_agent = AIAgent(model="gpt-4")
    
    # Commit inputs
    document = "The quick brown fox jumps over the lazy dog. This is a test document."
    verifiable_agent.commit_inputs(
        document_cid="QmTest123",
        chunks=[document],
        metadata={}
    )
    
    # Execute AI
    result = await ai_agent.summarize(document, verifiable_agent)
    
    print(f"Summary: {result}")
    print(f"\nExecution Root: {verifiable_agent.compute_execution_root()}")
    print(f"Step Count: {len(verifiable_agent.execution_steps)}")


if __name__ == "__main__":
    asyncio.run(example_usage())
