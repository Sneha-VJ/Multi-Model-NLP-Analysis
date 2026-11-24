📌 Multi-Modal NLP Analysis API

A production-style Multi-Modal NLP System built using Transformer models (FLAN-T5 with LoRA fine-tuning) and FastAPI, capable of analyzing text, CSV, and audio inputs for sentiment, emotion, sarcasm, and aspect-based insights.


🔥 Features

✅ Sentiment Analysis (Positive / Negative / Neutral / Mixed)
✅ Emotion Detection (Happiness, Anger, Sadness, Neutral)
✅ Sarcasm Detection
✅ Aspect-Based Sentiment Analysis
✅ Multi-Modal Input Support
Text
CSV files
Audio (Speech-to-text using Whisper)
✅ Visualization of Sentiment Distribution
✅ Hybrid Intelligence System (ML + Rule-Based) for improved accuracy


🧠 Tech Stack

Backend: FastAPI
Model: FLAN-T5 (LoRA Fine-tuned)
Model Hosting: Hugging Face
Speech Recognition: OpenAI Whisper
Libraries: Transformers, PEFT, PyTorch, Pandas, Matplotlib


⚙️ System Architecture


User Input (Text / CSV / Audio)
        ↓
FastAPI Backend
        ↓
Hugging Face Model (FLAN-T5 + LoRA)
        ↓
Post-processing (Hybrid Logic)
        ↓
Structured JSON Output


🧪 API Endpoints

🔹 Analyze Text
POST /analyze-text

Request:

{
  "text": "The product quality is amazing but the price is too high"
}

Response:

{
  "overall_sentiment": "Mixed",
  "emotion": "Neutral",
  "sarcasm": "Not Sarcastic",
  "aspects": [
    {
      "aspect": "price",
      "sentiment": "Negative",
      "keywords": ["high"]
    },
    {
      "aspect": "quality",
      "sentiment": "Positive",
      "keywords": ["amazing"]
    }
  ]
}

🔹 Analyze CSV
POST /analyze-csv

🔹 Analyze Audio
POST /analyze-audio

🔹 Visualize Sentiment
POST /visualize

🔹 Health Check
GET /health


🚀 How to Run Locally

1. Clone repository
git clone <your-repo-link>
cd backend
2. Create virtual environment
python -m venv venv
venv\Scripts\activate
3. Install dependencies
pip install -r requirements.txt
4. Run server
uvicorn main:app --reload
5. Open API Docs
http://127.0.0.1:8000/docs

## 📸 Demo

screenshots\audio-analysis.png
screenshots\csv-sentiment-chart.png
screenshots\csv-batch-analysis.png
screenshots\ui-text-analysis.png


📊 Key Highlights

Built a real-world deployable NLP system
Integrated LLM with rule-based logic for reliability
Handled model deployment challenges (Git LFS, Hugging Face)
Designed for scalability and extensibility


💡 Future Improvements

Improve model accuracy with larger dataset
Add real-time streaming analysis
Deploy on cloud (AWS / GCP / Azure)
Add frontend dashboard



👩‍💻 Author
Sneha V J 
