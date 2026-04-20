"""
Emotion Analyzer Service
Handles facial expression recognition using DeepFace (pre-trained models)
Falls back to rule-based analysis if no face is detected.
"""

import io
import os
import tempfile
import numpy as np
import cv2
from typing import Dict
try:
    import tensorflow as tf
    from tensorflow.keras.models import load_model
except ImportError:
    print("Warning: TensorFlow not found. Keras models won't load.")


class EmotionAnalyzer:
    """Service for analyzing facial expressions from images using DeepFace"""

    def __init__(self):
        # Emotion to mental health score mapping
        self.emotion_mental_health_scores = {
            'happy': 10,
            'surprise': 7,
            'neutral': 5,
            'fear': -5,
            'sad': -7,
            'angry': -8,
            'disgust': -6,
        }

        # Canonical display names (capitalized)
        self.display_names = {
            'happy': 'Happy',
            'surprise': 'Surprise',
            'neutral': 'Neutral',
            'fear': 'Fear',
            'sad': 'Sad',
            'angry': 'Angry',
            'disgust': 'Disgust',
        }
        
        self.emotion_labels = {
            0: 'angry',
            1: 'disgust',
            2: 'fear',
            3: 'happy',
            4: 'sad',
            5: 'surprise',
            6: 'neutral'
        }

        # Load FER model
        try:
            model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'FER_model.h5')
            self.model = load_model(model_path, compile=False)
            print("FER_model.h5 loaded successfully.")
        except Exception as e:
            print(f"Error loading FER_model.h5: {e}")
            self.model = None

        # Try to load Haar Cascade
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def analyze_emotion(self, image_bytes: bytes) -> Dict:
        """
        Analyze emotion from image bytes using DeepFace.

        Args:
            image_bytes: Raw image bytes

        Returns:
            Dictionary containing emotion analysis results
        """
        try:
            if self.model is None:
                return {"success": False, "error": "FER Model is not loaded."}
                
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return {"success": False, "error": "Invalid image file format."}
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
            
            if len(faces) == 0:
                return {
                    "success": False,
                    "error": "No face detected in the image. Please ensure your face is clearly visible and well-lit.",
                }
                
            # Take the largest face
            faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
            x, y, w, h = faces[0]
            
            roi_gray = gray[y:y+h, x:x+w]
            cropped_img = cv2.resize(roi_gray, (48, 48))
            
            # Normalize and reshape for FER_model.h5
            test_image = cropped_img / 255.0
            test_image = np.expand_dims(test_image, axis=0) # (1, 48, 48)
            test_image = np.expand_dims(test_image, axis=-1) # (1, 48, 48, 1)
            
            # Predict
            predictions = self.model.predict(test_image, verbose=0)[0] # Shape (7,)
            
            # Create distribution
            emotion_distribution = {}
            for idx, prob in enumerate(predictions):
                emotion_name = self.emotion_labels[idx]
                display_name = self.display_names.get(emotion_name, emotion_name.capitalize())
                emotion_distribution[display_name] = round(float(prob), 4)
                
            # Max prob
            max_idx = int(np.argmax(predictions))
            dominant_raw = self.emotion_labels[max_idx]
            predicted_emotion = self.display_names.get(dominant_raw, dominant_raw.capitalize())
            confidence = round(float(predictions[max_idx]), 4)
            
            # Calculate mental health score
            mental_health_score = self._calculate_mental_health_score(emotion_distribution)

            # Generate recommendation
            recommendation = self._generate_recommendation(
                predicted_emotion, confidence, mental_health_score
            )

            return {
                "success": True,
                "predicted_emotion": predicted_emotion,
                "confidence": confidence,
                "emotion_distribution": emotion_distribution,
                "mental_health_score": mental_health_score,
                "recommendation": recommendation,
            }

        except Exception as e:
            # Handle exceptions during prediction
            error_msg = str(e)
            import traceback
            print(f"EmotionAnalyzer error: {error_msg}")
            print(traceback.format_exc())
            return {
                "success": False,
                "error": "No face detected in the image. Please ensure your face is clearly visible and well-lit." if "No face" in error_msg else f"Analysis failed: {error_msg}",
            }

    def _calculate_mental_health_score(self, emotion_distribution: Dict[str, float]) -> Dict:
        """
        Calculate mental health score based on emotion probability distribution.
        """
        # Map display names back to lowercase for score lookup
        weighted_score = sum(
            prob * self.emotion_mental_health_scores.get(emotion.lower(), 0)
            for emotion, prob in emotion_distribution.items()
        )

        # Normalize to 0-100 scale  (raw range is -10 to +10)
        normalized_score = ((weighted_score + 10) / 20) * 100
        normalized_score = max(0.0, min(100.0, normalized_score))

        if normalized_score >= 70:
            status = "Positive"
            message = "Your emotional state appears positive and healthy."
        elif normalized_score >= 40:
            status = "Neutral"
            message = "Your emotional state appears balanced."
        else:
            status = "Concerning"
            message = "Your emotional state may need attention. Consider seeking support."

        return {
            "score": round(normalized_score, 2),
            "status": status,
            "message": message,
        }

    def _generate_recommendation(
        self,
        emotion: str,
        confidence: float,
        mental_health_score: Dict,
    ) -> str:
        """Generate personalized recommendation based on detected emotion."""
        recommendations = {
            "Happy": "Great to see you're feeling positive! Keep engaging in activities that bring you joy.",
            "Surprise": "You seem surprised! Take a moment to process your emotions.",
            "Neutral": "Your emotional state seems balanced. Continue monitoring your feelings.",
            "Fear": "You may be experiencing anxiety or fear. Consider deep breathing exercises or talking to someone you trust.",
            "Sad": "You appear to be feeling down. It's okay to feel this way. Consider reaching out to friends, family, or a mental health professional.",
            "Angry": "You seem to be experiencing anger. Try taking a break, practicing mindfulness, or engaging in physical activity to release tension.",
            "Disgust": "You may be experiencing discomfort. Identify the source and consider addressing it or seeking support.",
        }

        base_recommendation = recommendations.get(
            emotion, "Continue monitoring your emotional well-being."
        )

        if confidence < 0.5:
            base_recommendation += (
                " (Note: The detection confidence is low; ensure your face is well-lit and clearly visible.)"
            )

        return base_recommendation


# ---------------------------------------------------------------------------
# Global singleton
# ---------------------------------------------------------------------------
_analyzer_instance: EmotionAnalyzer | None = None


def get_emotion_analyzer() -> EmotionAnalyzer:
    """Return (or create) the global EmotionAnalyzer instance."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = EmotionAnalyzer()
    return _analyzer_instance
