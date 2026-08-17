from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import json
import re

app = FastAPI()

# 👉 Your Hugging Face model
MODEL_NAME = "Sowjanya078/sentiment-lora-model"

print("Loading model from Hugging Face...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

print(f"Model loaded on {device}")


# =========================
# Request Schema
# =========================
class TextRequest(BaseModel):
    text: str


# =========================
# MODEL PREDICTION
# =========================
def predict(text):
    prompt = f"""
You are an advanced sentiment analysis system.

Analyze the review and return STRICT JSON:
{{
"overall_sentiment": "Positive/Negative/Neutral/Mixed",
"emotion": "Happiness/Anger/Sadness/Neutral",
"sarcasm": "Sarcastic/Not Sarcastic",
"aspects": [
    {{
        "aspect": "feature",
        "sentiment": "Positive/Negative/Neutral",
        "keywords": ["words"]
    }}
]
}}

Review:
{text}
"""

    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    outputs = model.generate(
        **inputs,
        max_length=256,
        temperature=0.3
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Try parsing JSON
    try:
        json_match = re.search(r"\{.*\}", response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
    except:
        pass

    # fallback
    return {
        "overall_sentiment": "Neutral",
        "emotion": "Neutral",
        "sarcasm": "Not Sarcastic",
        "aspects": []
    }


# =========================
# HYBRID FIX (IMPORTANT)
# =========================
def improve_result(text, result):
    text_lower = text.lower()

    aspects = []

    # PRICE
    if "price" in text_lower:
        sentiment = "Negative" if any(w in text_lower for w in ["high", "expensive", "costly"]) else "Neutral"
        aspects.append({
            "aspect": "price",
            "sentiment": sentiment,
            "keywords": ["high"] if "high" in text_lower else []
        })

    # QUALITY
    if "quality" in text_lower:
        sentiment = "Positive" if any(w in text_lower for w in ["amazing", "good", "excellent"]) else "Neutral"
        aspects.append({
            "aspect": "quality",
            "sentiment": sentiment,
            "keywords": ["amazing"] if "amazing" in text_lower else []
        })

    # DELIVERY
    if "delivery" in text_lower:
        sentiment = "Positive" if "fast" in text_lower else "Negative"
        aspects.append({
            "aspect": "delivery",
            "sentiment": sentiment,
            "keywords": ["fast"] if "fast" in text_lower else []
        })

    # OVERALL SENTIMENT FIX
    if len(aspects) >= 2:
        overall = "Mixed"
    elif any(a["sentiment"] == "Negative" for a in aspects):
        overall = "Negative"
    elif any(a["sentiment"] == "Positive" for a in aspects):
        overall = "Positive"
    else:
        overall = result.get("overall_sentiment", "Neutral")

    result["aspects"] = aspects
    result["overall_sentiment"] = overall

    return result


# =========================
# API ROUTES
# =========================

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_NAME
    }


@app.post("/analyze-text")
def analyze_text(request: TextRequest):
    raw_result = predict(request.text)
    final_result = improve_result(request.text, raw_result)

    return {
        "input": request.text,
        "result": final_result
    }