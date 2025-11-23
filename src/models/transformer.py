import torch
import torch.nn as nn
import math

class SensorTokenEmbedding(nn.Module):
    """
    Projects 8 raw features per sensor into d_model embedding space.
    Input: (Batch, 128) -> Reshape (Batch, 16, 8) -> Linear -> (Batch, 16, d_model)
    """
    def __init__(self, input_dim_per_sensor=8, d_model=64):
        super().__init__()
        self.d_model = d_model
        self.proj = nn.Linear(input_dim_per_sensor, d_model)
        self.norm = nn.LayerNorm(d_model)
        self.activation = nn.GELU()

    def forward(self, x):
        # x shape: (Batch, 128)
        batch_size = x.shape[0]
        # Reshape to (Batch, 16 Sensors, 8 Features)
        x = x.view(batch_size, 16, 8)
        out = self.proj(x)
        out = self.norm(out)
        out = self.activation(out)
        return out

class PositionalEncoding(nn.Module):
    """
    Learnable positional encoding to distinguish sensors.
    """
    def __init__(self, num_sensors=16, d_model=64):
        super().__init__()
        self.pos_embed = nn.Parameter(torch.randn(1, num_sensors, d_model))

    def forward(self, x):
        return x + self.pos_embed

class DriftAwareTransformer(nn.Module):
    """
    Transformer Encoder for Gas Sensor Drift.
    Treats sensors as tokens and uses self-attention to weigh their importance.
    Includes a Domain Head for Adversarial Training (DANN).
    """
    def __init__(self, num_sensors=16, feats_per_sensor=8, num_classes=6, 
                 d_model=64, nhead=4, num_layers=2, dim_feedforward=128, dropout=0.1):
        super().__init__()
        
        # 1. Embedding
        self.embedding = SensorTokenEmbedding(feats_per_sensor, d_model)
        self.pos_encoding = PositionalEncoding(num_sensors, d_model)
        
        # 2. Transformer Encoder
        encoder_layer = nn.TransformerEncoderLayer(d_model=d_model, nhead=nhead, 
                                                   dim_feedforward=dim_feedforward, 
                                                   dropout=dropout, batch_first=True)
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # 3. Heads
        # We pool the output (e.g., mean of all sensor tokens)
        self.classifier = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, num_classes)
        )
        
        # Domain Discriminator (for DANN)
        self.domain_classifier = nn.Sequential(
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model // 2, 2) # Binary: Source vs Target
        )

    def forward(self, x, alpha=1.0):
        # x: (Batch, 128)
        
        # Embed: (Batch, 16, d_model)
        x = self.embedding(x)
        x = self.pos_encoding(x)
        
        # Transform: (Batch, 16, d_model)
        features = self.transformer(x)
        
        # Pool: (Batch, d_model) - Global Average Pooling over sensors
        # This aggregates information from all sensors, weighted by attention
        global_feat = features.mean(dim=1)
        
        # Class Prediction
        class_out = self.classifier(global_feat)
        
        # Domain Prediction (with Gradient Reversal Layer logic handled in training loop or here)
        # For simplicity, we return the raw features for the domain head to be used with GRL externally
        # or we can implement GRL here. Let's return the domain output directly.
        
        # Gradient Reversal (Manual implementation for simplicity)
        # If we are training domain head, we want to minimize domain loss.
        # If we are training encoder, we want to MAXIMIZE domain loss (confuse discriminator).
        # Standard DANN trick: reverse gradient during backprop.
        
        reverse_feature = ReverseLayerF.apply(global_feat, alpha)
        domain_out = self.domain_classifier(reverse_feature)
        
        return class_out, domain_out

from torch.autograd import Function

class ReverseLayerF(Function):
    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        output = grad_output.neg() * ctx.alpha
        return output, None
