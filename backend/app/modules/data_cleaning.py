import pandas as pd
from sklearn.preprocessing import LabelEncoder

def clean_dataset(df: pd.DataFrame, target_column: str) -> pd.DataFrame:
    df = df.copy()
    df.drop_duplicates(inplace=True)
    feature_cols = [c for c in df.columns if c != target_column]
    numeric_cols = df[feature_cols].select_dtypes(include="number").columns.tolist()
    for col in numeric_cols:
        median_value = df[col].median()
        df[col] = df[col].fillna(median_value)
    cat_cols = df[feature_cols].select_dtypes(include="object").columns.tolist()
    for col in cat_cols:
        mode_value = df[col].mode()[0] if not df[col].mode().empty else "unknown"
        df[col] = df[col].fillna(mode_value)
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
    if df[target_column].dtype == "object":
        le = LabelEncoder()
        df[target_column] = le.fit_transform(df[target_column].astype(str))
    return df