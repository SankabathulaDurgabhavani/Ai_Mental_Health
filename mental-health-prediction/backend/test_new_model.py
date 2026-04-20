"""
Test script to verify the new model loads correctly
"""
from services.emotion_analyzer import get_emotion_analyzer
import os

print("Testing new model loading...")
print(f"Current directory: {os.getcwd()}")

# Get the emotion analyzer (this will load the new model)
analyzer = get_emotion_analyzer()

print("\n✅ Model loaded successfully!")
print(f"Device: {analyzer.device}")
print(f"Model class: {analyzer.model.__class__.__name__}")
print("\nEmotion labels:")
for i in range(7):
    print(f"  {i}: {analyzer.model.get_emotion_label(i)}")
