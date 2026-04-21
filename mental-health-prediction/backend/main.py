from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime
from textblob import TextBlob
from typing import Optional, List
import base64
import httpx
import os
from dotenv import load_dotenv
from bson import ObjectId

from fastapi.middleware.cors import CORSMiddleware
from services.emotion_analyzer import get_emotion_analyzer

load_dotenv(override=True)

app = FastAPI()

# OpenRouter API key will be read per-request to avoid caching issues
# app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-mental-health-mu.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "Mental_health")
client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_collection = db["users"]
analyses_collection = db["analyses"]
emotion_analyses_collection = db["emotion_analyses"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class TextAnalysis(BaseModel):
    text: str
    email: str

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return plain_password == hashed_password

def analyze_mental_health(text: str):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    # Classify mental state based on polarity
    if polarity > 0.3:
        status = "Positive"
        message = "You seem to be in a good mental state. Keep up the positive mindset!"
    elif polarity < -0.3:
        status = "Negative"
        message = "You might be experiencing some difficult emotions. Consider talking to someone or seeking professional help."
    else:
        status = "Neutral"
        message = "Your mental state seems balanced. Continue monitoring your feelings."
    
    return {
        "status": status,
        "polarity": round(polarity, 2),
        "message": message
    }

@app.post("/signup")
async def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already taken")

    user_data = {
        "username": user.username if user.username else user.email,
        "email": user.email,
        "password": user.password,
        "created_at": datetime.utcnow()
    }
    users_collection.insert_one(user_data)
    return {"message": "User created successfully"}

@app.post("/login")
async def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "message": "Login successful",
        "user": {
            "username": db_user["username"] if db_user["username"] != "" else db_user["email"],
            "email": db_user["email"]
        }
    }

@app.get("/user/{email}")
async def get_user(email: str):
    db_user = users_collection.find_one({"email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": db_user["username"],
        "email": db_user["email"],
        "created_at": db_user["created_at"]
    }

@app.put("/user/{email}")
async def update_user(email: str, user_update: UserUpdate):
    db_user = users_collection.find_one({"email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    if user_update.username:
        # Check if username is already taken by another user
        existing = users_collection.find_one({"username": user_update.username})
        if existing and existing["email"] != email:
            raise HTTPException(status_code=400, detail="Username already taken")
        update_data["username"] = user_update.username
    
    if user_update.email:
        # Check if email is already taken by another user
        existing = users_collection.find_one({"email": user_update.email})
        if existing and existing["email"] != email:
            raise HTTPException(status_code=400, detail="Email already registered")
        update_data["email"] = user_update.email
    
    if update_data:
        users_collection.update_one({"email": email}, {"$set": update_data})
    
    return {"message": "User updated successfully"}

@app.post("/analyze")
async def analyze_text(analysis: TextAnalysis):
    result = analyze_mental_health(analysis.text)
    
    # Store analysis in database
    analysis_data = {
        "email": analysis.email,
        "text": analysis.text,
        "status": result["status"],
        "polarity": result["polarity"],
        "message": result["message"],
        "created_at": datetime.utcnow()
    }
    analyses_collection.insert_one(analysis_data)
    
    return result

@app.get("/analyses/{email}")
async def get_analyses(email: str):
    analyses = list(analyses_collection.find({"email": email}).sort("created_at", -1).limit(10))
    
    # Convert ObjectId to string for JSON serialization
    for analysis in analyses:
        analysis["_id"] = str(analysis["_id"])
        analysis["created_at"] = analysis["created_at"].isoformat()
    
    return {"analyses": analyses}

@app.post("/analyze-emotion")
async def analyze_emotion(file: UploadFile = File(...), email: str = Form(None)):
    """
    Analyze facial expression from uploaded image
    
    Args:
        file: Uploaded image file
        email: User email (optional)
    
    Returns:
        Emotion analysis results
    """
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Get emotion analyzer
        analyzer = get_emotion_analyzer()
        
        # Analyze emotion
        result = analyzer.analyze_emotion(image_bytes)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Analysis failed'))
        
        # Store analysis in database if email is provided
        if email:
            # Convert image to base64 for storage (optional - you may want to store in file system instead)
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            
            analysis_data = {
                "email": email,
                "predicted_emotion": result["predicted_emotion"],
                "confidence": result["confidence"],
                "emotion_distribution": result["emotion_distribution"],
                "mental_health_score": result["mental_health_score"],
                "recommendation": result["recommendation"],
                "image_base64": image_base64,
                "created_at": datetime.utcnow()
            }
            emotion_analyses_collection.insert_one(analysis_data)
        
        return result
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in analyze_emotion: {str(e)}")
        print(f"Full traceback:\n{error_details}")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/emotion-analyses/{email}")
async def get_emotion_analyses(email: str, limit: int = 10):
    """
    Get emotion analysis history for a user
    
    Args:
        email: User email
        limit: Number of records to return (default: 10)
    
    Returns:
        List of emotion analyses
    """
    try:
        analyses = list(
            emotion_analyses_collection
            .find({"email": email}, {"image_base64": 0})  # Exclude image data
            .sort("created_at", -1)
            .limit(limit)
        )
        
        # Convert ObjectId and datetime to string for JSON serialization
        for analysis in analyses:
            analysis["_id"] = str(analysis["_id"])
            analysis["created_at"] = analysis["created_at"].isoformat()
        
        return {"analyses": analyses}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analyses: {str(e)}")

@app.get("/emotion-stats/{email}")
async def get_emotion_stats(email: str):
    """
    Get emotion statistics for a user
    
    Args:
        email: User email
    
    Returns:
        Emotion statistics and trends
    """
    try:
        analyses = list(
            emotion_analyses_collection
            .find({"email": email}, {"predicted_emotion": 1, "confidence": 1, "mental_health_score": 1, "created_at": 1})
            .sort("created_at", -1)
            .limit(50)
        )
        
        if not analyses:
            return {
                "total_analyses": 0,
                "emotion_counts": {},
                "average_confidence": 0,
                "average_mental_health_score": 0,
                "recent_trend": "No data available"
            }
        
        # Calculate statistics
        emotion_counts = {}
        total_confidence = 0
        total_mh_score = 0
        
        for analysis in analyses:
            emotion = analysis["predicted_emotion"]
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            total_confidence += analysis["confidence"]
            total_mh_score += analysis["mental_health_score"]["score"]
        
        avg_confidence = total_confidence / len(analyses)
        avg_mh_score = total_mh_score / len(analyses)
        
        # Determine trend
        if avg_mh_score >= 70:
            trend = "Positive - Your emotional state has been generally positive"
        elif avg_mh_score >= 40:
            trend = "Neutral - Your emotional state has been balanced"
        else:
            trend = "Concerning - Consider seeking support for your emotional well-being"
        
        return {
            "total_analyses": len(analyses),
            "emotion_counts": emotion_counts,
            "average_confidence": round(avg_confidence, 4),
            "average_mental_health_score": round(avg_mh_score, 2),
            "recent_trend": trend,
            "most_common_emotion": max(emotion_counts, key=emotion_counts.get) if emotion_counts else None
        }
        
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating statistics: {str(e)}")

# Therapist Routes
therapists_collection = db["therapists"]

class TherapistCreate(BaseModel):
    name: str
    email: str
    password: str
    specialization: str
    experience: int
    bio: Optional[str] = None

class TherapistLogin(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    message: str
    email: Optional[str] = None
    history: Optional[List[dict]] = []

@app.post("/chat")
async def ai_chat(chat: ChatMessage):
    """
    Real AI chatbot endpoint using OpenRouter API.
    Falls back to a rule-based response if API key is not set.
    """
    # Build conversation history for context
    messages = [
        {
            "role": "system",
            "content": (
                "You are a compassionate mental health AI companion. "
                "Respond with empathy, provide helpful coping strategies, "
                "and gently encourage professional help when appropriate. "
                "Keep responses concise (2-4 sentences). "
                "Never diagnose. Always be supportive and non-judgmental."
            )
        }
    ]
    # Add conversation history
    for h in (chat.history or [])[-6:]:  # last 3 exchanges
        messages.append(h)
    messages.append({"role": "user", "content": chat.message})

    api_key = os.environ.get("OPENROUTER_API_KEY", "")
    print(f"[DEBUG] API Key present: {bool(api_key)}")

    if api_key:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Mental Health App"
                    },
                    json={
                       "model": "openrouter/free",
                        "messages": messages,
                        "max_tokens": 1200,
                        "temperature": 0.7
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content")
                    if content:
                        reply = content.strip()
                        return {"reply": reply, "source": "ai"}
                    else:
                        print(f"OpenRouter API returned no content. Data: {data}")
                else:
                    print(f"OpenRouter API Failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"OpenRouter API error: {e}")
    else:
        print("OPENROUTER_API_KEY is missing or empty!")

    # Fallback: rule-based empathetic responses
    text_lower = chat.message.lower()
    blob = TextBlob(chat.message)
    polarity = blob.sentiment.polarity

    if any(w in text_lower for w in ["anxious", "anxiety", "worried", "panic", "stress"]):
        reply = "It sounds like you're feeling anxious. Try taking slow, deep breaths — inhale for 4 counts, hold for 4, exhale for 4. Remember, anxiety is temporary and you can get through this. 💙"
    elif any(w in text_lower for w in ["sad", "depressed", "hopeless", "cry", "alone", "lonely"]):
        reply = "I hear you, and I'm sorry you're feeling this way. It's okay to feel sad sometimes. Reaching out — even to this chat — is a brave first step. Consider talking to someone you trust or a professional. 💜"
    elif any(w in text_lower for w in ["angry", "frustrated", "mad", "furious", "rage"]):
        reply = "Feeling angry is completely valid. Try stepping away from the situation for a moment and taking a few deep breaths. Physical activity like a short walk can also help release that tension. 🌿"
    elif any(w in text_lower for w in ["happy", "great", "good", "wonderful", "amazing", "excited"]):
        reply = "That's wonderful to hear! Positive emotions are so important for mental well-being. Keep doing what's working for you and celebrate these good moments! 😊"
    elif any(w in text_lower for w in ["tired", "exhausted", "sleep", "fatigue"]):
        reply = "Rest is so important for mental health. Try to maintain a consistent sleep schedule and wind down before bed. Even short breaks during the day can help recharge you. 🌙"
    elif polarity < -0.2:
        reply = "It sounds like things are tough right now. Remember that difficult feelings are temporary. Be gentle with yourself, and don't hesitate to reach out to a mental health professional if you need support. 💙"
    elif polarity > 0.2:
        reply = "I'm glad you're feeling positive! Maintaining good mental health is an ongoing journey. Keep nurturing those good feelings with self-care and connection with others. 🌟"
    else:
        reply = "Thank you for sharing with me. How are you feeling overall today? I'm here to listen and support you on your mental health journey. 💚"

    return {"reply": reply, "source": "fallback"}


@app.get("/therapists")
async def get_therapists():
    """Get all registered therapists from the database"""
    therapists = list(therapists_collection.find({}, {"password": 0}))
    for t in therapists:
        t["id"] = str(t["_id"])
        del t["_id"]
        if "created_at" in t:
            t["created_at"] = t["created_at"].isoformat()
        # Ensure default fields exist
        if "available" not in t:
            t["available"] = True
        if "rating" not in t:
            t["rating"] = 5.0
    return {"therapists": therapists}


@app.get("/therapists/{therapist_id}")
async def get_therapist(therapist_id: str):
    """Get a single therapist by ID"""
    try:
        obj_id = ObjectId(therapist_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid therapist ID")
    
    therapist = therapists_collection.find_one({"_id": obj_id}, {"password": 0})
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    
    therapist["id"] = str(therapist["_id"])
    del therapist["_id"]
    if "created_at" in therapist:
        therapist["created_at"] = therapist["created_at"].isoformat()
    if "available" not in therapist:
        therapist["available"] = True
    if "rating" not in therapist:
        therapist["rating"] = 5.0
    
    return therapist


@app.get("/report/{email}")
async def get_report(email: str):
    """Generate a comprehensive analysis report for a user"""
    # Fetch text analyses
    text_analyses = list(analyses_collection.find({"email": email}).sort("created_at", -1))
    for a in text_analyses:
        a["_id"] = str(a["_id"])
        a["created_at"] = a["created_at"].isoformat()

    # Fetch emotion analyses (exclude image data)
    emotion_analyses = list(
        emotion_analyses_collection
        .find({"email": email}, {"image_base64": 0})
        .sort("created_at", -1)
    )
    for a in emotion_analyses:
        a["_id"] = str(a["_id"])
        a["created_at"] = a["created_at"].isoformat()

    # Summary stats
    total_text = len(text_analyses)
    total_emotion = len(emotion_analyses)
    
    positive_count = sum(1 for a in text_analyses if a.get("status") == "Positive")
    negative_count = sum(1 for a in text_analyses if a.get("status") == "Negative")
    neutral_count = total_text - positive_count - negative_count

    avg_mh_score = 0
    if emotion_analyses:
        scores = [a["mental_health_score"]["score"] for a in emotion_analyses if "mental_health_score" in a]
        avg_mh_score = round(sum(scores) / len(scores), 2) if scores else 0

    return {
        "report": {
            "generated_at": datetime.utcnow().isoformat(),
            "email": email,
            "summary": {
                "total_text_analyses": total_text,
                "total_emotion_analyses": total_emotion,
                "text_sentiment_breakdown": {
                    "positive": positive_count,
                    "negative": negative_count,
                    "neutral": neutral_count
                },
                "average_mental_health_score": avg_mh_score
            },
            "text_analyses": text_analyses,
            "emotion_analyses": emotion_analyses
        }
    }


@app.post("/therapist/signup")
async def therapist_signup(therapist: TherapistCreate):
    if therapists_collection.find_one({"email": therapist.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    therapist_data = {
        "name": therapist.name,
        "email": therapist.email,
        "password": therapist.password,
        "specialization": therapist.specialization,
        "experience": therapist.experience,
        "bio": therapist.bio or "",
        "available": True,
        "rating": 5.0,
        "created_at": datetime.utcnow()
    }
    therapists_collection.insert_one(therapist_data)
    return {"message": "Therapist account created successfully"}

@app.post("/therapist/login")
async def therapist_login(therapist: TherapistLogin):
    db_therapist = therapists_collection.find_one({"email": therapist.email})
    if not db_therapist or not therapist.password == db_therapist["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "therapist": {
            "id": str(db_therapist["_id"]),
            "name": db_therapist["name"],
            "email": db_therapist["email"],
            "specialization": db_therapist["specialization"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
