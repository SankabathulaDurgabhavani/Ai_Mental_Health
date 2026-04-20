import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000"

# Sample users to create
SAMPLE_USERS = [
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "password123"
    },
    {
        "username": "jane_smith",
        "email": "jane@example.com",
        "password": "password123"
    },
    {
        "username": "alice_wonder",
        "email": "alice@example.com",
        "password": "password123"
    },
    {
        "username": "bob_builder",
        "email": "bob@example.com",
        "password": "password123"
    },
    {
        "username": "charlie_brown",
        "email": "charlie@example.com",
        "password": "password123"
    }
]

# Sample texts for mental health analysis
SAMPLE_TEXTS = {
    "positive": [
        "I feel amazing today! Everything is going so well and I'm really happy with my progress.",
        "Life is wonderful! I'm grateful for all the good things happening around me.",
        "I'm so excited about the future and all the opportunities ahead!"
    ],
    "negative": [
        "I feel so overwhelmed and stressed. Nothing seems to be going right.",
        "I'm feeling really down today. Everything feels hopeless and difficult.",
        "I can't seem to shake this feeling of sadness and anxiety."
    ],
    "neutral": [
        "Today was an ordinary day. I went to work and came back home.",
        "I had a meeting this morning and worked on some projects in the afternoon.",
        "The weather is nice today. I might go for a walk later."
    ]
}

def print_response(title, response):
    """Pretty print API responses"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def signup_users():
    """Create all sample users"""
    print("\n🔵 CREATING USERS...")
    created_users = []
    
    for user in SAMPLE_USERS:
        try:
            response = requests.post(f"{BASE_URL}/signup", json=user)
            print_response(f"Signup: {user['username']}", response)
            if response.status_code == 200:
                created_users.append(user)
        except Exception as e:
            print(f"❌ Error creating user {user['username']}: {str(e)}")
    
    return created_users

def login_users(users):
    """Test login for all users"""
    print("\n🔵 TESTING LOGIN...")
    logged_in_users = []
    
    for user in users:
        try:
            login_data = {
                "email": user["email"],
                "password": user["password"]
            }
            response = requests.post(f"{BASE_URL}/login", json=login_data)
            print_response(f"Login: {user['email']}", response)
            print(response.json())
            if response.status_code == 200:
                logged_in_users.append(user)
        except Exception as e:
            print(f"❌ Error logging in {user['email']}: {str(e)}")
    
    return logged_in_users

def get_user_info(users):
    """Get user information"""
    print("\n🔵 GETTING USER INFORMATION...")
    
    for user in users:
        try:
            response = requests.get(f"{BASE_URL}/user/{user['email']}")
            print_response(f"Get User: {user['email']}", response)
        except Exception as e:
            print(f"❌ Error getting user info for {user['email']}: {str(e)}")

def update_users(users):
    """Test updating user information"""
    print("\n🔵 UPDATING USERS...")
    
    # Update first user's username
    if len(users) > 0:
        try:
            update_data = {"username": "john_updated"}
            response = requests.put(
                f"{BASE_URL}/user/{users[0]['email']}", 
                json=update_data
            )
            print_response(f"Update User: {users[0]['email']}", response)
        except Exception as e:
            print(f"❌ Error updating user: {str(e)}")

def analyze_texts(users):
    """Test mental health analysis for different text types"""
    print("\n🔵 ANALYZING MENTAL HEALTH TEXTS...")
    
    for i, user in enumerate(users):
        # Cycle through different sentiment types
        if i % 3 == 0:
            texts = SAMPLE_TEXTS["positive"]
            sentiment_type = "POSITIVE"
        elif i % 3 == 1:
            texts = SAMPLE_TEXTS["negative"]
            sentiment_type = "NEGATIVE"
        else:
            texts = SAMPLE_TEXTS["neutral"]
            sentiment_type = "NEUTRAL"
        
        # Analyze one text for each user
        try:
            analysis_data = {
                "text": texts[0],
                "email": user["email"]
            }
            response = requests.post(f"{BASE_URL}/analyze", json=analysis_data)
            print_response(
                f"Analyze ({sentiment_type}): {user['username']}", 
                response
            )
        except Exception as e:
            print(f"❌ Error analyzing text for {user['email']}: {str(e)}")

def get_user_analyses(users):
    """Get analysis history for users"""
    print("\n🔵 GETTING USER ANALYSIS HISTORY...")
    
    for user in users:
        try:
            response = requests.get(f"{BASE_URL}/analyses/{user['email']}")
            print_response(f"Get Analyses: {user['email']}", response)
        except Exception as e:
            print(f"❌ Error getting analyses for {user['email']}: {str(e)}")

def test_error_cases():
    """Test error handling"""
    print("\n🔵 TESTING ERROR CASES...")
    
    # Test duplicate email signup
    try:
        duplicate_user = {
            "username": "duplicate_test",
            "email": "john@example.com",  # Already exists
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/signup", json=duplicate_user)
        print_response("Duplicate Email Test (should fail)", response)
    except Exception as e:
        print(f"❌ Error in duplicate test: {str(e)}")
    
    # Test invalid login
    try:
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/login", json=invalid_login)
        print_response("Invalid Login Test (should fail)", response)
    except Exception as e:
        print(f"❌ Error in invalid login test: {str(e)}")
    
    # Test get non-existent user
    try:
        response = requests.get(f"{BASE_URL}/user/nonexistent@example.com")
        print_response("Get Non-existent User (should fail)", response)
    except Exception as e:
        print(f"❌ Error in get non-existent user test: {str(e)}")

def main():
    """Main function to run all seeding operations"""
    print("\n" + "="*60)
    print("🚀 STARTING DATABASE SEEDING AND API TESTING")
    print("="*60)
    print(f"📍 API Base URL: {BASE_URL}")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # Test if API is running
        response = requests.get(f"{BASE_URL}/docs")
        print("✅ API is running and accessible")
    except Exception as e:
        print(f"❌ ERROR: Cannot connect to API at {BASE_URL}")
        print(f"   Make sure the server is running with: python main.py")
        print(f"   Error: {str(e)}")
        return
    
    # Run all seeding operations
    created_users = signup_users()
    
    if created_users:
        logged_in_users = login_users(created_users)
        get_user_info(created_users)
        update_users(created_users)
        analyze_texts(created_users)
        get_user_analyses(created_users)
        test_error_cases()
    else:
        print("⚠️  No users were created. They might already exist in the database.")
        print("   Testing with existing users...")
        login_users(SAMPLE_USERS)
        get_user_info(SAMPLE_USERS)
        analyze_texts(SAMPLE_USERS)
        get_user_analyses(SAMPLE_USERS)
    
    print("\n" + "="*60)
    print("✅ SEEDING AND TESTING COMPLETED")
    print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
