import os
import numpy as np
import torch
from PIL import Image
import torchvision.transforms as transforms

device = "cuda" if torch.cuda.is_available() else "cpu"


def build_database(model, fingerprint_dir, face_dir):
    model.eval()

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])

    fingerprint_files = sorted(
        file_name for file_name in os.listdir(fingerprint_dir)
        if os.path.isfile(os.path.join(fingerprint_dir, file_name))
    )
    face_files = sorted(
        file_name for file_name in os.listdir(face_dir)
        if os.path.isfile(os.path.join(face_dir, file_name))
    )

    if not fingerprint_files:
        raise ValueError(f"No fingerprint images found in {fingerprint_dir}")
    if not face_files:
        raise ValueError(f"No face images found in {face_dir}")

    if len(fingerprint_files) != len(face_files):
        raise ValueError(
            "Fingerprint and face dataset counts do not match: "
            f"{len(fingerprint_files)} fingerprints vs {len(face_files)} faces"
        )

    database = []

    for fp, face in zip(fingerprint_files, face_files):
        img_path = os.path.join(fingerprint_dir, fp)
        img = Image.open(img_path).convert("RGB")
        img = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            emb = model(img).cpu().numpy()[0]

        database.append({
            "embedding": emb,
            "face_path": os.path.abspath(os.path.join(face_dir, face))
        })

    return database
