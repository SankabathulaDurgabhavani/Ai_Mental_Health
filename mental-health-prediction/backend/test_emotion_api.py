"""
Test script for emotion analysis endpoints
"""

import requests
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"

def test_emotion_analysis():
    """Test emotion analysis endpoint"""
    print("=" * 60)
    print("Testing Emotion Analysis Integration")
    print("=" * 60)
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print("✓ Server is running")
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running. Please start the server first.")
        print("  Run: make run")
        return
    
    # Test 1: Analyze emotion without image (should fail)
    print("\n1. Testing endpoint without image (should fail)...")
    try:
        response = requests.post(f"{BASE_URL}/analyze-emotion")
        if response.status_code == 422:
            print("✓ Correctly rejects request without image")
        else:
            print(f"✗ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 2: Get emotion history (empty)
    print(f"\n2. Testing emotion history for {TEST_EMAIL}...")
    try:
        response = requests.get(f"{BASE_URL}/emotion-analyses/{TEST_EMAIL}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Retrieved {len(data.get('analyses', []))} analyses")
        else:
            print(f"✗ Failed with status: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Get emotion statistics
    print(f"\n3. Testing emotion statistics for {TEST_EMAIL}...")
    try:
        response = requests.get(f"{BASE_URL}/emotion-stats/{TEST_EMAIL}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Statistics retrieved:")
            print(f"   Total analyses: {data.get('total_analyses', 0)}")
            print(f"   Average MH score: {data.get('average_mental_health_score', 0)}")
            print(f"   Trend: {data.get('recent_trend', 'N/A')}")
        else:
            print(f"✗ Failed with status: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 4: Check if model file exists
    print("\n4. Checking for pre-trained model...")
    model_path = Path(__file__).parent / "models" / "best_model.pth"
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"✓ Model file found ({size_mb:.2f} MB)")
    else:
        print(f"✗ Model file not found at: {model_path}")
        print("  The model will use untrained weights (results will be inaccurate)")
    
    # Test 5: Test with sample image (if available)
    print("\n5. Testing with sample image...")
    sample_images_dir = Path(__file__).parent / "Facial-Expression-Recognition-FER-for-Mental-Health-Detection--main" / "images"
    
    if sample_images_dir.exists():
        image_files = list(sample_images_dir.glob("*.jpg")) + list(sample_images_dir.glob("*.png"))
        if image_files:
            test_image = image_files[0]
            print(f"   Using image: {test_image.name}")
            
            try:
                with open(test_image, 'rb') as f:
                    files = {'file': f}
                    data = {'email': TEST_EMAIL}
                    response = requests.post(f"{BASE_URL}/analyze-emotion", files=files, data=data)
                
                if response.status_code == 200:
                    result = response.json()
                    print("✓ Emotion analysis successful!")
                    print(f"   Predicted emotion: {result.get('predicted_emotion')}")
                    print(f"   Confidence: {result.get('confidence')}")
                    print(f"   Mental health score: {result.get('mental_health_score', {}).get('score')}")
                    print(f"   Status: {result.get('mental_health_score', {}).get('status')}")
                else:
                    print(f"✗ Analysis failed with status: {response.status_code}")
                    print(f"   Response: {response.text}")
            except Exception as e:
                print(f"✗ Error during analysis: {e}")
        else:
            print("   No sample images found in images directory")
    else:
        print("   Sample images directory not found")
        print("   You can test manually by uploading an image")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print("\nTo test with your own image:")
    print("curl -X POST 'http://localhost:8000/analyze-emotion' \\")
    print("  -F 'file=@path/to/your/image.jpg' \\")
    print(f"  -F 'email={TEST_EMAIL}'")
    print()

if __name__ == "__main__":
    test_emotion_analysis()
