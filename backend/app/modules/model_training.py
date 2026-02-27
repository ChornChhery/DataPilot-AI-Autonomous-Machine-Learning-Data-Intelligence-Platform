import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from app.core.config import settings

CLASSIFICATION_MODELS = {
    "Logistic Regression": LogisticRegression(max_iter=500, random_state=settings.RANDOM_STATE),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=settings.RANDOM_STATE),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=settings.RANDOM_STATE),
}

REGRESSION_MODELS = {
    "Linear Regression": LinearRegression(),
    "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=settings.RANDOM_STATE),
    "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, random_state=settings.RANDOM_STATE),
}

def train_models(X, y, problem_type):
    models = CLASSIFICATION_MODELS if problem_type == "classification" else REGRESSION_MODELS
    trained = {}
    for name, model in models.items():
        model.fit(X, y)
        trained[name] = model
    return trained