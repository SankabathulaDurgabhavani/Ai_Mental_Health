import torch
import os

model_path = "/Users/pranav/Desktop/Pranav/abc/full-stack-ml-projects/mental-health-prediction/backend/models/best_model.pth"
if os.path.exists(model_path):
    try:
        checkpoint = torch.load(model_path, map_location='cpu', weights_only=False)
        if isinstance(checkpoint, dict):
            print("Keys in checkpoint:", checkpoint.keys())
            if 'state_dict' in checkpoint:
                keys = list(checkpoint['state_dict'].keys())
            else:
                keys = list(checkpoint.keys())
            print("\nFirst 20 keys in state_dict:")
            for k in keys[:20]:
                print(k)
        else:
            print("Checkpoint is not a dict, it is a", type(checkpoint))
    except Exception as e:
        print("Error loading model:", e)
else:
    print("Model file not found")
