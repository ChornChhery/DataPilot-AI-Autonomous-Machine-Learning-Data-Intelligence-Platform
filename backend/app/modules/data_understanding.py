import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

CLASSIFICATION_THRESHOLD = 20

def analyze_dataset(filepath: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    df = pd.read_csv(filepath)
    null_counts = df.isnull().sum().to_dict()
    dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
    dataset_info = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "dtypes": dtypes,
        "null_counts": {k: int(v) for k, v in null_counts.items()},
        "null_percentage": {k: round(v / df.shape[0] * 100, 2) for k, v in null_counts.items()},
        "problem_type": None,
    }
    return df, dataset_info

def detect_problem_type(df: pd.DataFrame, target_column: str) -> str:
    target = df[target_column]
    
    # Check if the target is categorical (object type - strings)
    if target.dtype == "object":
        return "classification"
    
    # Remove any NaN values for analysis
    target_clean = target.dropna()
    
    # Check if it has few unique values and they appear to be discrete classes
    n_unique = target_clean.nunique()
    if n_unique <= CLASSIFICATION_THRESHOLD:
        # Check if all values are essentially integers (even if stored as float)
        # This means they're likely discrete classes
        if pd.api.types.is_integer_dtype(target_clean):
            return "classification"
        else:
            # Check if float values are actually integers (e.g., 1.0, 2.0, 3.0)
            # but ignore NaN values
            is_integer_like = target_clean.apply(lambda x: pd.isna(x) or float(x).is_integer() if pd.notna(x) else True)
            if is_integer_like.all():
                return "classification"
            else:
                # Continuous values even if few unique values
                return "regression"
    
    # For many unique values, check the ratio of unique to total
    # If a high percentage of values are unique, it's likely regression
    unique_ratio = n_unique / len(target_clean)
    if unique_ratio > 0.5:  # More than half are unique - likely regression
        return "regression"
    
    # Additional check: if values are continuous floats, it's regression
    if pd.api.types.is_float_dtype(target_clean):
        return "regression"
    
    return "classification"