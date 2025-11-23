import torch
import torch.nn as nn
import torch.nn.functional as F

class FeatureExtractor(nn.Module):
    """
    Extracts features from the input data.
    """
    def __init__(self, input_dim, hidden_dim=64):
        super(FeatureExtractor, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = F.relu(self.fc2(x))
        return x

class LabelPredictor(nn.Module):
    """
    Predicts class labels from extracted features.
    """
    def __init__(self, hidden_dim, num_classes):
        super(LabelPredictor, self).__init__()
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        return self.fc(x)

class DomainClassifier(nn.Module):
    """
    Predicts the domain (source vs target) from extracted features.
    """
    def __init__(self, hidden_dim):
        super(DomainClassifier, self).__init__()
        self.fc1 = nn.Linear(hidden_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, 1)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        return torch.sigmoid(self.fc2(x))

class DANN(nn.Module):
    """
    Domain-Adversarial Neural Network.
    """
    def __init__(self, input_dim, num_classes, hidden_dim=64):
        super(DANN, self).__init__()
        self.feature_extractor = FeatureExtractor(input_dim, hidden_dim)
        self.label_predictor = LabelPredictor(hidden_dim, num_classes)
        self.domain_classifier = DomainClassifier(hidden_dim)

    def forward(self, x, alpha=1.0):
        features = self.feature_extractor(x)
        
        # Label prediction
        class_logits = self.label_predictor(features)
        
        # Domain classification (with gradient reversal layer implemented manually or via hook)
        # For simplicity in forward pass we just return logits, reversal is handled in training loop
        domain_logits = self.domain_classifier(features)
        
        return class_logits, domain_logits, features

class MLP(nn.Module):
    """
    Simple MLP Baseline.
    """
    def __init__(self, input_dim, num_classes, hidden_dim=64):
        super(MLP, self).__init__()
        self.feature_extractor = FeatureExtractor(input_dim, hidden_dim)
        self.label_predictor = LabelPredictor(hidden_dim, num_classes)

    def forward(self, x):
        features = self.feature_extractor(x)
        logits = self.label_predictor(features)
        return logits
