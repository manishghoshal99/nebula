import pandas as pd
import numpy as np
from scipy.stats import gmean
from sklearn.linear_model import Ridge

def get_feature_cols(df):
    """Returns a list of feature columns (starting with V)."""
    feature_cols = [c for c in df.columns if c.startswith("V")]
    # Ensure sorted order V1..V128
    feature_cols = sorted(feature_cols, key=lambda x: int(x[1:]) if x[1:].isdigit() else x)
    return feature_cols

def get_sensor_block_cols(sensor_idx_1based, feature_cols, feats_per_sensor=8):
    """Returns the list of column names V? that belong to sensor #sensor_idx_1based (1..16)."""
    start = (sensor_idx_1based - 1) * feats_per_sensor
    end = start + feats_per_sensor
    return feature_cols[start:end]

def build_sensor_map(feature_cols):
    """
    Builds a dictionary mapping sensor ID (S1..S16) to its feature columns.
    """
    block_keys = [
        "DeltaR", "NormDeltaR",
        "EMA_rise_0.001", "EMA_rise_0.01", "EMA_rise_0.1",
        "EMAd_0.001", "EMAd_0.01", "EMAd_0.1"
    ]
    sensor_map = {}
    for s in range(1, 17):
        cols = get_sensor_block_cols(s, feature_cols)
        if len(cols) == 8:
            sensor_map[f"S{s}"] = {k: c for k, c in zip(block_keys, cols)}
    return sensor_map

def build_concentration_proxies(df):
    """
    Engineers concentration proxy features and sensor composites.
    """
    X = df.copy()
    feature_cols = get_feature_cols(X)
    sensor_map = build_sensor_map(feature_cols)
    
    delta_cols = [sensor_map[f"S{i}"]["DeltaR"] for i in range(1, 17)]
    
    # 1. Concentration Proxies
    # Sum of absolute DeltaR (primary proxy)
    X["conc_sum_abs_deltaR"] = X[delta_cols].abs().sum(axis=1)
    # L2 norm
    X["conc_l2_deltaR"] = np.sqrt((X[delta_cols]**2).sum(axis=1))
    # Max absolute response
    X["conc_max_deltaR"] = X[delta_cols].abs().max(axis=1)
    
    # 2. Relative Features (Shape)
    total_abs = X["conc_sum_abs_deltaR"] + 1e-9
    for i in range(1, 17):
        col = sensor_map[f"S{i}"]["DeltaR"]
        X[f"S{i}_DeltaR_rel"] = X[col].abs() / total_abs
        
    return X

def residualize_against_proxy(df, proxy_col="conc_sum_abs_deltaR", alpha=1.0):
    """
    Residualizes DeltaR features against the concentration proxy to remove dose effects.
    """
    X = df.copy()
    feature_cols = get_feature_cols(X)
    sensor_map = build_sensor_map(feature_cols)
    delta_cols = [sensor_map[f"S{i}"]["DeltaR"] for i in range(1, 17)]
    
    if proxy_col not in X.columns:
        raise ValueError(f"Proxy column {proxy_col} not found in DataFrame.")
        
    proxy = X[[proxy_col]].values
    
    for c in delta_cols:
        y = X[c].values
        reg = Ridge(alpha=alpha, fit_intercept=True)
        reg.fit(proxy, y)
        y_hat = reg.predict(proxy)
        X[f"{c}_resid"] = y - y_hat
        
    return X
