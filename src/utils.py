import os
import random
import numpy as np

def seed_everything(seed=42):
    """Seeds all random number generators."""
    random.seed(seed)
    os.environ['PYTHONHASHSEED'] = str(seed)
    np.random.seed(seed)
