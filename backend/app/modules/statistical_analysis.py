import pandas as pd
import numpy as np
from scipy.stats import pearsonr
from typing import Tuple, Dict, Any


def run_statistics(df: pd.DataFrame, target_column: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Run statistical analysis on the dataset
    
    Args:
        df: The cleaned dataset
        target_column: The target column for prediction
        
    Returns:
        Tuple containing statistics and correlation matrix
    """
    # Basic statistics for numerical columns
    numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    stats = {}
    
    for col in numerical_cols:
        stats[col] = {
            'mean': float(df[col].mean()),
            'std': float(df[col].std()),
            'min': float(df[col].min()),
            'max': float(df[col].max()),
            'median': float(df[col].median()),
            'q25': float(df[col].quantile(0.25)),
            'q75': float(df[col].quantile(0.75))
        }
    
    # Correlation matrix for numerical columns
    corr_matrix = {}
    if len(numerical_cols) > 1:
        corr_df = df[numerical_cols].corr()
        corr_matrix = corr_df.to_dict()
    
    return stats, corr_matrix