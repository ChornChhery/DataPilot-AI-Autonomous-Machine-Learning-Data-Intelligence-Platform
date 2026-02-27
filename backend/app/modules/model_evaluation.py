import time
import numpy as np
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, mean_squared_error, r2_score
from app.core.config import settings

def evaluate_and_select(trained_models, X, y, feature_names, problem_type):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=settings.TEST_SIZE, random_state=settings.RANDOM_STATE
    )
    
    scoring = "f1_weighted" if problem_type == "classification" else "r2"
    metrics_list = []

    # Adjust CV folds based on dataset size to avoid cross-validation errors
    cv_folds = min(settings.CV_FOLDS, max(2, len(X_train) // 2))  # Ensure at least 2 samples per fold
    
    for name, model in trained_models.items():
        t0 = time.time()
        try:
            cv_scores = cross_val_score(model, X_train, y_train, cv=cv_folds, scoring=scoring)
        except ValueError as e:
            # Handle case where dataset is too small for cross-validation
            print(f"Cross-validation failed: {e}")
            # Use a simple score instead of cross-validation
            model.fit(X_train, y_train)
            y_pred_cv = model.predict(X_train)
            if problem_type == "classification":
                cv_scores_list = [f1_score(y_train, y_pred_cv, average="weighted")] if len(np.unique(y_train)) > 1 else [0.0]
            else:
                cv_scores_list = [r2_score(y_train, y_pred_cv)]
            cv_scores = np.array(cv_scores_list)
        elapsed = round(time.time() - t0, 3)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        entry = {
            "model_name": name,
            "cv_mean": round(float(cv_scores.mean()), 4),
            "cv_std": round(float(cv_scores.std()), 4),
            "train_time_sec": elapsed,
        }

        if problem_type == "classification":
            entry["accuracy"] = round(float(accuracy_score(y_test, y_pred)), 4)
            entry["f1_score"] = round(float(f1_score(y_test, y_pred, average="weighted")), 4)
            try:
                proba = model.predict_proba(X_test)
                if len(np.unique(y)) == 2:
                    entry["roc_auc"] = round(float(roc_auc_score(y_test, proba[:, 1])), 4)
                else:
                    entry["roc_auc"] = round(float(roc_auc_score(y_test, proba, multi_class="ovr")), 4)
            except Exception:
                entry["roc_auc"] = None
        else:
            entry["rmse"] = round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 4)
            entry["r2"] = round(float(r2_score(y_test, y_pred)), 4)

        metrics_list.append(entry)

    best_entry = max(metrics_list, key=lambda x: x["cv_mean"])
    best_name = best_entry["model_name"]
    best_model = trained_models[best_name]

    feature_importance = []
    if hasattr(best_model, "feature_importances_"):
        importances = best_model.feature_importances_
        feature_importance = sorted(
            [{"feature": fn, "importance": round(float(imp), 4)} for fn, imp in zip(feature_names, importances)],
            key=lambda x: x["importance"], reverse=True
        )[:15]
    elif hasattr(best_model, "coef_"):
        coef = np.abs(best_model.coef_).flatten() if best_model.coef_.ndim > 1 else np.abs(best_model.coef_)
        feature_importance = sorted(
            [{"feature": fn, "importance": round(float(imp), 4)} for fn, imp in zip(feature_names, coef)],
            key=lambda x: x["importance"], reverse=True
        )[:15]

    return best_name, metrics_list, feature_importance