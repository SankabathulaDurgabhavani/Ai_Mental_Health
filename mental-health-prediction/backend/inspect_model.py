import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf
from tensorflow import keras
import h5py

model_path = "/Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/mental-health-prediction/backend/models/FER_model.h5"

print("Loading model...")
try:
    model = keras.models.load_model(model_path, compile=False)
    print("Model loaded successfully.")
    
    print("Model structure:")
    model.summary()
    
    # Check if compile config has anything
    print("Metrics in config?", model.compiled_metrics)
    
except Exception as e:
    print("Error loading model:", e)

# Also check h5py directly for any stored accuracy history
try:
    with h5py.File(model_path, 'r') as f:
        print("\nh5py keys:", list(f.keys()))
        if 'model_weights' in f:
            print("Contains model_weights")
        if 'training_config' in f:
            print("training_config exists")
            import json
            conf = json.loads(f.attrs.get('training_config', '{}'))
            print("Metrics:", conf.get('metrics', []))
except Exception as e:
    print("h5py error:", e)
