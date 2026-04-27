# -*- coding: utf-8 -*-
import argparse
import json
import os
import sys
from datetime import datetime

import joblib
import pandas as pd
from xgboost import XGBClassifier

TARGET_COLUMN = "CLASS_LABEL"
DEFAULT_FEATURE_VALUE = 0.0


def load_dataset(dataset_path):
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found: {dataset_path}")

    df = pd.read_csv(dataset_path)
    if "id" in df.columns:
        df = df.drop("id", axis=1)

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Missing required target column: {TARGET_COLUMN}")

    x = df.drop(TARGET_COLUMN, axis=1)
    y = df[TARGET_COLUMN]
    return x, y, list(x.columns)


def train_and_save(dataset_path, model_path):
    x, y, feature_columns = load_dataset(dataset_path)

    model = XGBClassifier(
        n_estimators=500,
        max_depth=8,
        learning_rate=0.05,
        eval_metric="logloss",
    )
    model.fit(x, y)

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    payload = {
        "model": model,
        "feature_columns": feature_columns,
        "trained_at": datetime.utcnow().isoformat() + "Z",
    }
    joblib.dump(payload, model_path)
    return payload


def load_or_train(dataset_path, model_path):
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return train_and_save(dataset_path, model_path)


def normalize_features(raw_features, feature_columns):
    normalized = {}
    for col in feature_columns:
        value = raw_features.get(col, DEFAULT_FEATURE_VALUE)
        try:
            normalized[col] = float(value)
        except (TypeError, ValueError):
            normalized[col] = DEFAULT_FEATURE_VALUE
    return normalized


def predict_one(raw_features, dataset_path, model_path):
    payload = load_or_train(dataset_path, model_path)
    model = payload["model"]
    feature_columns = payload["feature_columns"]

    normalized = normalize_features(raw_features, feature_columns)
    row_df = pd.DataFrame([normalized], columns=feature_columns)

    pred = int(model.predict(row_df)[0])
    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(row_df)[0]
        if len(probs) >= 2:
            confidence = float(probs[1] if pred == 1 else probs[0])

    return {
        "modelName": "XGBoost-Phishing-v1",
        "prediction": pred,
        "predictedLabel": "Phishing" if pred == 1 else "Legitimate",
        "confidence": round(confidence, 4) if confidence is not None else None,
        "featureCount": len(feature_columns),
        "trainedAt": payload.get("trained_at"),
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Train and run phishing model")
    parser.add_argument("--dataset-path", required=True)
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--train", action="store_true")
    parser.add_argument("--predict-json")
    return parser.parse_args()


def main():
    args = parse_args()

    if args.train:
        train_and_save(args.dataset_path, args.model_path)
        print(json.dumps({"status": "trained", "modelPath": args.model_path}))
        return

    if args.predict_json is not None:
        features = json.loads(args.predict_json)
        if not isinstance(features, dict):
            raise ValueError("--predict-json must decode to an object")
        result = predict_one(features, args.dataset_path, args.model_path)
        print(json.dumps(result))
        return

    raise ValueError("No action selected. Use --train or --predict-json")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
