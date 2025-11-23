import io
import arff
import pandas as pd
from pathlib import Path
import yaml

def load_config(config_path="config/config.yaml"):
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

def load_data(config=None):
    """
    Loads the ARFF data into a pandas DataFrame.
    """
    if config is None:
        config = load_config()
    
    data_path = Path(config["data_path"])
    
    # Robust path resolution
    candidates = [
        Path.cwd() / data_path,
        Path.cwd().parent / data_path,
        Path.cwd() / "nebula" / data_path,
        Path.cwd().parent / "nebula" / data_path,
        data_path,
    ]
    
    arff_file = None
    for p in candidates:
        if p.exists():
            arff_file = str(p)
            break
            
    if arff_file is None:
        raise FileNotFoundError(f"ARFF file not found. Tried: {[str(p) for p in candidates]}")
        
    print(f"Loading data from: {arff_file}")
    
    with io.open(arff_file, "r", encoding="utf-8", errors="ignore") as f:
        arff_obj = arff.load(f)
        
    attr_names = [a[0] for a in arff_obj["attributes"]]
    data = arff_obj["data"]
    
    df = pd.DataFrame(data, columns=attr_names)
    
    # Ensure class is numeric
    if df["Class"].dtype != int:
        df["Class"] = df["Class"].astype(int)
        
    # Map class names
    class_map = config.get("class_map", {})
    if class_map:
        # Convert keys to int if they are loaded as strings
        class_map = {int(k): v for k, v in class_map.items()}
        df["ClassName"] = df["Class"].map(class_map)
        
    return df
