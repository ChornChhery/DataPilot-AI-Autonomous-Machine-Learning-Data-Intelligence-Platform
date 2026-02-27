import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List

def engineer_features(df, target_column, problem_type) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    feature_cols = [c for c in df.columns if c != target_column]
    X = df[feature_cols].values
    y = df[target_column].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    return X_scaled, y, feature_cols