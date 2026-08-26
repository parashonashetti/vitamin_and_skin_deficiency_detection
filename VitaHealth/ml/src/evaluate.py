"""
VitaHealth - Phase 4
Model Evaluation

Evaluates the saved MobileNetV3-Small model on the
UNTOUCHED test set.

Outputs:
- Test accuracy
- Precision
- Recall
- F1-score
- Classification report
- Confusion matrix
"""

import os
import torch
import torch.nn as nn
from torchvision import models
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from dataset import build_dataloaders, CLASS_NAMES


# =========================================================
# CONFIGURATION
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

NUM_CLASSES = len(CLASS_NAMES)

BATCH_SIZE = 8

SPLITS_DIR = "data/splits"

MODEL_PATH = "models/skin_classifier_mobilenet.pth"


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 70)

    print(
        "VitaHealth Phase 4 - Model Evaluation"
    )

    print("=" * 70)

    print(
        f"\nDevice: {DEVICE}"
    )

    print(
        f"Model: {MODEL_PATH}"
    )


    # =====================================================
    # CHECK MODEL
    # =====================================================

    if not os.path.exists(MODEL_PATH):

        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )


    # =====================================================
    # LOAD DATA
    # =====================================================

    print(
        "\nLoading test dataset..."
    )

    _, _, test_loader = build_dataloaders(
        splits_dir=SPLITS_DIR,
        batch_size=BATCH_SIZE,
        num_workers=0
    )

    print(
        f"Test batches: {len(test_loader)}"
    )


    # =====================================================
    # LOAD MODEL
    # =====================================================

    print(
        "\nLoading MobileNetV3-Small..."
    )

    weights = (
        models.MobileNet_V3_Small_Weights.DEFAULT
    )

    model = models.mobilenet_v3_small(
        weights=None
    )


    # Replace classifier with 6 classes

    in_features = (
        model.classifier[-1].in_features
    )

    model.classifier[-1] = nn.Linear(
        in_features,
        NUM_CLASSES
    )


    # Load trained weights

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


    # =====================================================
    # TEST PREDICTIONS
    # =====================================================

    print(
        "\nEvaluating on TEST SET..."
    )

    all_labels = []

    all_predictions = []


    with torch.no_grad():

        for batch_index, (images, labels) in enumerate(
            test_loader
        ):

            print(
                f"  Test batch "
                f"{batch_index + 1}/{len(test_loader)}"
            )

            images = images.to(
                DEVICE
            )

            outputs = model(
                images
            )

            predictions = torch.argmax(
                outputs,
                dim=1
            )


            all_labels.extend(
                labels.numpy()
            )

            all_predictions.extend(
                predictions.cpu().numpy()
            )


    # =====================================================
    # ACCURACY
    # =====================================================

    accuracy = accuracy_score(
        all_labels,
        all_predictions
    )


    print(
        "\n" + "=" * 70
    )

    print(
        "TEST RESULTS"
    )

    print(
        "=" * 70
    )

    print(
        f"\nTest Accuracy: "
        f"{accuracy:.4f}"
    )

    print(
        f"Test Accuracy: "
        f"{accuracy * 100:.2f}%"
    )


    # =====================================================
    # CLASSIFICATION REPORT
    # =====================================================

    print(
        "\n" + "-" * 70
    )

    print(
        "CLASSIFICATION REPORT"
    )

    print(
        "-" * 70
    )

    report = classification_report(
        all_labels,
        all_predictions,
        labels=list(range(NUM_CLASSES)),
        target_names=CLASS_NAMES,
        zero_division=0
    )

    print(
        report
    )


    # =====================================================
    # CONFUSION MATRIX
    # =====================================================

    print(
        "-" * 70
    )

    print(
        "CONFUSION MATRIX"
    )

    print(
        "-" * 70
    )

    cm = confusion_matrix(
        all_labels,
        all_predictions,
        labels=list(range(NUM_CLASSES))
    )

    print()

    print(
        "Rows = Actual class"
    )

    print(
        "Columns = Predicted class"
    )

    print()

    print(
        "Classes:"
    )

    for i, name in enumerate(CLASS_NAMES):

        print(
            f"  {i}: {name}"
        )

    print()

    print(cm)


    # =====================================================
    # COMPLETE
    # =====================================================

    print(
        "\n" + "=" * 70
    )

    print(
        "EVALUATION COMPLETE"
    )

    print(
        "=" * 70
    )

    print(
        "\nThe test set was used ONLY here "
        "for final evaluation."
    )

    print(
        "=" * 70
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    main()