import optuna
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, f1_score
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
import joblib
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from .models import RobustMLP, get_stacking_classifier
from .domain_adaptation import coral_alignment

def objective_mlp(trial, X_train, y_train, X_val, y_val, device='cpu'):
    """
    Optuna objective for RobustMLP.
    """
    # Hyperparameters
    hidden_dim = trial.suggest_int('hidden_dim', 64, 512)
    dropout_rate = trial.suggest_float('dropout_rate', 0.1, 0.5)
    lr = trial.suggest_float('lr', 1e-4, 1e-2, log=True)
    batch_size = trial.suggest_categorical('batch_size', [32, 64, 128])
    epochs = 20 # Fixed for tuning speed

    # Data setup
    train_ds = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train))
    val_ds = TensorDataset(torch.FloatTensor(X_val), torch.LongTensor(y_val))
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    # Model
    model = RobustMLP(input_dim=X_train.shape[1], num_classes=6, hidden_dim=hidden_dim, dropout_rate=dropout_rate)
    model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    # Training loop (simplified for tuning)
    for epoch in range(epochs):
        model.train()
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
        # Pruning (optional, check validation accuracy)
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        val_acc = correct / total
        trial.report(val_acc, epoch)

        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()

    return val_acc

def tune_mlp(X_train, y_train, X_val, y_val, n_trials=20):
    """
    Runs Optuna optimization for MLP.
    """
    study = optuna.create_study(direction='maximize')
    study.optimize(lambda trial: objective_mlp(trial, X_train, y_train, X_val, y_val), n_trials=n_trials, n_jobs=1) # Torch handles parallelism internally often better
    return study.best_params, study.best_value

def objective_stacking(trial, X, y, cv=5):
    """
    Optuna objective for Stacking Classifier.
    """
    rf_n_estimators = trial.suggest_int('rf_n_estimators', 10, 100)
    svc_C = trial.suggest_float('svc_C', 0.1, 10.0, log=True)
    meta_C = trial.suggest_float('meta_C', 0.1, 10.0, log=True)
    
    estimators = [
        ('rf', RandomForestClassifier(n_estimators=rf_n_estimators, random_state=42, n_jobs=1)), # n_jobs=1 to avoid oversubscription
        ('svc', SVC(C=svc_C, probability=True, random_state=42))
    ]
    clf = StackingClassifier(estimators=estimators, final_estimator=LogisticRegression(C=meta_C))
    
    # Parallel Cross-Validation using Joblib
    scores = cross_val_score(clf, X, y, cv=cv, n_jobs=-1, scoring='accuracy')
    return scores.mean()

def tune_stacking(X, y, n_trials=20, cv=5):
    """
    Runs Optuna optimization for Stacking.
    """
    study = optuna.create_study(direction='maximize')
    study.optimize(lambda trial: objective_stacking(trial, X, y, cv=cv), n_trials=n_trials, n_jobs=1) # Optuna loop serial, CV parallel
    return study.best_params, study.best_value
