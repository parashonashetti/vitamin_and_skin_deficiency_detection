"""
VitaHealth - Phase 4
Single Image Skin Condition Prediction

Usage:
    python src/predict.py "path/to/image.jpg"

Example:
    python src/predict.py "C:/Users/paras/Desktop/test.jpg"
"""

import os
import sys

import torch
import torch.nn as nn
from PIL import Image
from torchvision import models, transforms

from dataset import CLASS_NAMES


# =========================================================
# CONFIGURATION
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

MODEL_PATH = "models/skin_classifier_mobilenet.pth"

IMAGE_SIZE = 224

IMAGENET_MEAN = [
    0.485,
    0.456,
    0.406
]

IMAGENET_STD = [
    0.229,
    0.224,
    0.225
]


# =========================================================
# IMAGE TRANSFORM
# =========================================================

transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=IMAGENET_MEAN,
        std=IMAGENET_STD
    )
])


# =========================================================
# LOAD MODEL
# =========================================================

def load_model():

    print(
        "\nLoading trained model..."
    )

    if not os.path.exists(MODEL_PATH):

        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    model = models.mobilenet_v3_small(
        weights=None
    )

    in_features = (
        model.classifier[-1].in_features
    )

    model.classifier[-1] = nn.Linear(
        in_features,
        len(CLASS_NAMES)
    )

    state_dict = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    model.load_state_dict(
        state_dict
    )

    model = model.to(
        DEVICE
    )

    model.eval()

    print(
        "Model loaded successfully."
    )

    return model


# =========================================================
# PREDICT IMAGE
# =========================================================

def predict_image(
    model,
    image_path
):

    if not os.path.exists(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    print(
        f"\nImage: {image_path}"
    )

    image = Image.open(
        image_path
    ).convert("RGB")

    image_tensor = transform(
        image
    )

    image_tensor = image_tensor.unsqueeze(
        0
    )

    image_tensor = image_tensor.to(
        DEVICE
    )


    # -----------------------------------------------------
    # MODEL PREDICTION
    # -----------------------------------------------------

    with torch.no_grad():

        outputs = model(
            image_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted_index = torch.max(
            probabilities,
            dim=1
        )


    predicted_index = predicted_index.item()

    confidence = confidence.item()

    predicted_class = CLASS_NAMES[
        predicted_index
    ]


    # =====================================================
    # RESULT
    # =====================================================

    print(
        "\n" + "=" * 70
    )

    print(
        "PREDICTION RESULT"
    )

    print(
        "=" * 70
    )

    print(
        f"\nPredicted condition:"
    )

    print(
        f"  {predicted_class}"
    )

    print(
        f"\nConfidence:"
    )

    print(
        f"  {confidence * 100:.2f}%"
    )


    # =====================================================
    # ALL CLASS PROBABILITIES
    # =====================================================

    print(
        "\nAll class probabilities:"
    )

    for i, class_name in enumerate(
        CLASS_NAMES
    ):

        probability = (
            probabilities[0][i].item()
            * 100
        )

        print(
            f"  {class_name:<25} "
            f"{probability:.2f}%"
        )


    print(
        "\n" + "=" * 70
    )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "=" * 70
    )

    print(
        "VitaHealth - Skin Condition Prediction"
    )

    print(
        "=" * 70
    )

    print(
        f"\nDevice: {DEVICE}"
    )


    # -----------------------------------------------------
    # CHECK ARGUMENT
    # -----------------------------------------------------

    if len(sys.argv) < 2:

        print(
            "\nUsage:"
        )

        print(
            'python src/predict.py "path/to/image.jpg"'
        )

        print(
            "\nExample:"
        )

        print(
            'python src/predict.py "C:/Users/paras/Desktop/test.jpg"'
        )

        return


    image_path = sys.argv[1]


    # -----------------------------------------------------
    # LOAD MODEL
    # -----------------------------------------------------

    model = load_model()


    # -----------------------------------------------------
    # PREDICT
    # -----------------------------------------------------

    predict_image(
        model,
        image_path
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    main()