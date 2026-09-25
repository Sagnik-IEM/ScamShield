"""
ScamShield ML Model Training Pipeline
Trains a calibrated TF-IDF + LogisticRegression model on training data
and saves the serialized artifact to app/models/classifier.pkl.
"""

import json
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "train_dataset.json"
MODELS_DIR = BASE_DIR / "app" / "models"
MODEL_OUTPUT_PATH = MODELS_DIR / "classifier.pkl"


def train_and_save_model() -> None:
    print("Loading training dataset from:", DATA_PATH)
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    texts = [item["text"] for item in data]
    labels = [item["label"] for item in data]

    print(f"Loaded {len(texts)} training samples ({sum(labels)} scam, {len(labels) - sum(labels)} ham).")

    # Build scikit-learn Pipeline
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=2500,
                sublinear_tf=True,
                strip_accents="unicode",
                lowercase=True,
            ),
        ),
        (
            "clf",
            LogisticRegression(
                C=2.0,
                class_weight="balanced",
                max_iter=500,
                random_state=42,
            ),
        ),
    ])

    print("Training TF-IDF + Logistic Regression model...")
    pipeline.fit(texts, labels)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL_OUTPUT_PATH)
    print(f"Model successfully saved to {MODEL_OUTPUT_PATH}!")


if __name__ == "__main__":
    train_and_save_model()
