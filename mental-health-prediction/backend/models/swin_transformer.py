"""
Swin Transformer model for Facial Expression Recognition
Adapted from the FER project for mental health detection
"""

import torch
import torch.nn as nn
import timm


class CustomSwinTransformer(nn.Module):
    """
    Custom Swin Transformer for Facial Expression Recognition
    Detects 7 emotions: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
    """
    
    def __init__(self, pretrained=True, num_classes=7):
        super(CustomSwinTransformer, self).__init__()
        self.backbone = timm.create_model(
            'swin_base_patch4_window7_224', 
            pretrained=pretrained, 
            num_classes=0
        )
        self.classifier = nn.Sequential(
            nn.Linear(self.backbone.num_features, 512),
            nn.ReLU(),
            nn.Dropout(p=0.6),
            nn.Linear(512, num_classes)
        )
        
        # Emotion labels
        self.emotion_labels = [
            'Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral'
        ]
    
    def forward(self, x):
        x = self.backbone(x)
        return self.classifier(x)
    
    def get_emotion_label(self, class_idx):
        """Get emotion label from class index"""
        return self.emotion_labels[class_idx]
