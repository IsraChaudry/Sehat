import os
from groq import Groq
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env", override=True)

_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
]


_ENV_PATH = Path(__file__).parent.parent / ".env"

def call_gemini(system_prompt: str, user_message: str) -> str:
    """Call Groq API. Re-reads .env on every call to always use the current key."""
    load_dotenv(dotenv_path=_ENV_PATH, override=True)
    key = os.getenv("GROQ_API_KEY", "")
    print(f"[LLM] Using key: {key[:8]}... from {_ENV_PATH}")
    client = Groq(api_key=key)

    last_error = None
    for model in _MODELS:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            last_error = e
            err_str = str(e)
            if any(x in err_str for x in ["429", "rate_limit", "quota", "overloaded"]):
                print(f"[LLM] {model} rate limited, trying next model...")
                continue
            raise
    raise last_error
