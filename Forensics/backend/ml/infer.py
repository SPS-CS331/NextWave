import argparse
import json
import os
import sys

import numpy as np
import torch
from PIL import Image
import torchvision.transforms as transforms

from models.embedding_model import EmbeddingNet
from utils.database import build_database
from utils.similarity import cosine_similarity

device = "cuda" if torch.cuda.is_available() else "cpu"


def normalize_database_entries(database, face_dir):
    normalized = []

    for entry in database:
        item = dict(entry.item() if hasattr(entry, "item") else entry)
        face_path = item.get("face_path")

        if face_path:
            candidate = os.path.abspath(face_path)
            if not os.path.exists(candidate):
                candidate = os.path.abspath(os.path.join(face_dir, os.path.basename(face_path)))
            item["face_path"] = candidate

        normalized.append(item)

    return np.array(normalized, dtype=object)


def ensure_database(model, database_path, fingerprint_dir, face_dir):
    if os.path.exists(database_path):
        loaded = np.load(database_path, allow_pickle=True)
        normalized = normalize_database_entries(loaded, face_dir)
        np.save(database_path, normalized)
        return normalized

    database = build_database(model, fingerprint_dir, face_dir)
    np.save(database_path, database)
    return np.array(database, dtype=object)


def find_match(input_path, model_path, database_path, fingerprint_dir, face_dir, threshold=0.7):
    model = EmbeddingNet().to(device)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()

    database = ensure_database(model, database_path, fingerprint_dir, face_dir)

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])

    img = Image.open(input_path).convert("RGB")
    img = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        query_emb = model(img).cpu().numpy()[0]

    best_score = -1.0
    best_match = None
    scores = []

    for entry in database:
        score = cosine_similarity(query_emb, entry["embedding"])
        scores.append(score)

        if score > best_score:
            best_score = score
            best_match = entry

    sorted_scores = sorted(scores, reverse=True)
    second_best = sorted_scores[1] if len(sorted_scores) > 1 else -1.0
    confidence = round(((best_score + 1.0) / 2.0) * 100.0, 2)
    match_found = bool(best_score > threshold and (best_score - second_best) > 0.05)

    result = {
        "inputPath": os.path.abspath(input_path),
        "similarityScore": round(float(best_score), 4),
        "confidence": confidence,
        "facePath": os.path.abspath(best_match["face_path"]) if best_match else None,
        "matchFound": match_found,
        "threshold": float(threshold),
        "databaseSize": int(len(database)),
    }
    return result


def parse_args():
    parser = argparse.ArgumentParser(description="Fingerprint to face matching inference")
    parser.add_argument("--input-path", required=True)
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--database-path", required=True)
    parser.add_argument("--fingerprint-dir", required=True)
    parser.add_argument("--face-dir", required=True)
    parser.add_argument("--threshold", type=float, default=0.7)
    return parser.parse_args()


def main():
    args = parse_args()
    result = find_match(
        input_path=args.input_path,
        model_path=args.model_path,
        database_path=args.database_path,
        fingerprint_dir=args.fingerprint_dir,
        face_dir=args.face_dir,
        threshold=args.threshold,
    )
    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
