import numpy as np
from scipy.linalg import fractional_matrix_power
import torch
import torch.nn as nn
import torch.optim as optim
from torch.autograd import Function

# --- CORAL (Correlation Alignment) ---

def coral_alignment(source_data, target_data):
    """
    Aligns source_data to target_data using CORAL (Correlation Alignment).
    Returns the transformed source data.
    """
    n_source = source_data.shape[0]
    n_target = target_data.shape[0]
    d = source_data.shape[1]

    # Covariances
    cov_s = np.cov(source_data, rowvar=False) + np.eye(d) * 1e-5
    cov_t = np.cov(target_data, rowvar=False) + np.eye(d) * 1e-5

    # Whitening source
    cov_s_sqrt_inv = fractional_matrix_power(cov_s, -0.5)

    # Coloring with target
    cov_t_sqrt = fractional_matrix_power(cov_t, 0.5)

    # Transformation
    transform_matrix = np.dot(cov_s_sqrt_inv, cov_t_sqrt)
    source_aligned = np.dot(source_data, transform_matrix)

    # Real part only (in case of complex numbers from sqrt)
    return source_aligned.real

# --- DANN (Domain Adversarial Neural Network) ---

class GradientReversalLayer(Function):
    """
    Gradient Reversal Layer for DANN.
    """
    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x.view_as(x)

    @staticmethod
    def backward(ctx, grad_output):
        output = grad_output.neg() * ctx.alpha
        return output, None

def grad_reverse(x, alpha=1.0):
    return GradientReversalLayer.apply(x, alpha)

def coral_loss(source, target):
    """
    Correlation Alignment Loss (Deep CORAL).
    """
    d = source.size(1)
    
    # Source covariance
    xm = torch.mean(source, 0, keepdim=True) - source
    xc = xm.t() @ xm / (source.size(0) - 1)
    
    # Target covariance
    xmt = torch.mean(target, 0, keepdim=True) - target
    xct = xmt.t() @ xmt / (target.size(0) - 1)
    
    # Frobenius norm
    loss = torch.mean(torch.pow(xc - xct, 2))
    loss = loss * (4 * d * d)
    return loss

def train_dann(model, source_loader, target_loader, optimizer, epoch, device):
    """
    Training loop for DANN.
    """
    model.train()
    
    len_dataloader = min(len(source_loader), len(target_loader))
    data_source_iter = iter(source_loader)
    data_target_iter = iter(target_loader)
    
    total_loss = 0
    
    for i in range(len_dataloader):
        p = float(i + epoch * len_dataloader) / 50 / len_dataloader # simple annealing
        alpha = 2. / (1. + torch.exp(torch.tensor(-10 * p))) - 1
        
        # Get data
        try:
            s_data, s_label = next(data_source_iter)
            t_data, _ = next(data_target_iter)
        except StopIteration:
            break
            
        s_data, s_label = s_data.to(device), s_label.to(device)
        t_data = t_data.to(device)
        
        optimizer.zero_grad()
        
        # Forward pass source
        class_output, domain_output, _ = model(s_data, alpha=alpha)
        err_s_label = nn.CrossEntropyLoss()(class_output, s_label)
        err_s_domain = nn.BCELoss()(domain_output, torch.zeros(s_data.size(0), 1).to(device))
        
        # Forward pass target
        _, domain_output, _ = model(t_data, alpha=alpha)
        err_t_domain = nn.BCELoss()(domain_output, torch.ones(t_data.size(0), 1).to(device))
        
        # Total loss
        err = err_s_label + err_s_domain + err_t_domain
        err.backward()
        optimizer.step()
        
        total_loss += err.item()
        
    return total_loss / len_dataloader
