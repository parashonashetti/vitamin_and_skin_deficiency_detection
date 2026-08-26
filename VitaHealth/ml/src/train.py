"""
VitaHealth - Phase 4
MobileNetV3-Small Training

Six-class skin condition classification.

Classes:
1. Atopic Dermatitis
2. Contact Dermatitis
3. Eczema
4. Scabies
5. Seborrheic Dermatitis
6. Tinea Corporis

Uses:
- Patient-level train/validation/test splits
- Training-only augmentation
- Class-weighted loss
- ImageNet pretrained MobileNetV3-Small
- Best validation model checkpoint

Test data is NOT used during training.
"""

import os
import sys
import traceback

import torch
import torch.nn as nn
from torchvision import models

from dataset import build_dataloaders, CLASS_NAMES


# =========================================================
# CONFIGURATION
# =========================================================

NUM_CLASSES = len(CLASS_NAMES)

NUM_EPOCHS = 10

BATCH_SIZE = 8

LEARNING_RATE = 0.0001

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

SPLITS_DIR = "data/splits"

MODEL_DIR = "models"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "skin_classifier_mobilenet.pth"
)


# =========================================================
# CLASS WEIGHTS
# =========================================================

def calculate_class_weights(train_loader):

    print(
        "\nCalculating class weights...",
        flush=True
    )

    class_counts = torch.zeros(
        NUM_CLASSES,
        dtype=torch.float32
    )

    for _, labels in train_loader:

        for label in labels:

            class_counts[label.item()] += 1

    print(
        "\nTraining class counts:",
        flush=True
    )

    for i, name in enumerate(CLASS_NAMES):

        print(
            f"  {i}: {name:<25} "
            f"{int(class_counts[i])}",
            flush=True
        )

    if (class_counts == 0).any():

        missing = [
            CLASS_NAMES[i]
            for i in range(NUM_CLASSES)
            if class_counts[i] == 0
        ]

        raise RuntimeError(
            f"Missing training classes: {missing}"
        )

    class_weights = (
        class_counts.sum()
        /
        (NUM_CLASSES * class_counts)
    )

    print(
        "\nClass weights:",
        flush=True
    )

    for i, name in enumerate(CLASS_NAMES):

        print(
            f"  {name:<25} "
            f"{class_weights[i]:.4f}",
            flush=True
        )

    return class_weights


# =========================================================
# TRAIN ONE EPOCH
# =========================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
    epoch
):

    model.train()

    running_loss = 0.0

    correct = 0

    total = 0

    total_batches = len(loader)

    print(
        f"\nTraining epoch {epoch}...",
        flush=True
    )

    for batch_index, (images, labels) in enumerate(loader):

        print(
            f"  Batch {batch_index + 1}/{total_batches}",
            flush=True
        )

        images = images.to(DEVICE)

        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item()
            *
            images.size(0)
        )

        _, predicted = torch.max(
            outputs,
            1
        )

        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()

    if total == 0:

        raise RuntimeError(
            "Training loader returned zero images."
        )

    train_loss = (
        running_loss / total
    )

    train_accuracy = (
        correct / total
    )

    return train_loss, train_accuracy


# =========================================================
# VALIDATION
# =========================================================

def validate(
    model,
    loader,
    criterion
):

    model.eval()

    running_loss = 0.0

    correct = 0

    total = 0

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(DEVICE)

            labels = labels.to(DEVICE)

            outputs = model(images)

            loss = criterion(
                outputs,
                labels
            )

            running_loss += (
                loss.item()
                *
                images.size(0)
            )

            _, predicted = torch.max(
                outputs,
                1
            )

            total += labels.size(0)

            correct += (
                predicted == labels
            ).sum().item()

    if total == 0:

        raise RuntimeError(
            "Validation loader returned zero images."
        )

    val_loss = (
        running_loss / total
    )

    val_accuracy = (
        correct / total
    )

    return val_loss, val_accuracy


# =========================================================
# MAIN
# =========================================================

def main():

    print("=" * 70, flush=True)

    print(
        "VitaHealth Phase 4 - "
        "MobileNetV3-Small Training",
        flush=True
    )

    print("=" * 70, flush=True)

    print(
        f"\nDevice: {DEVICE}",
        flush=True
    )

    print(
        f"Classes: {NUM_CLASSES}",
        flush=True
    )

    print(
        f"Epochs: {NUM_EPOCHS}",
        flush=True
    )

    print(
        f"Batch size: {BATCH_SIZE}",
        flush=True
    )

    print(
        f"Learning rate: {LEARNING_RATE}",
        flush=True
    )


    # =====================================================
    # CHECK SPLIT FILES
    # =====================================================

    print(
        "\nChecking dataset split files...",
        flush=True
    )

    required_files = [
        "train.csv",
        "val.csv",
        "test.csv"
    ]

    for filename in required_files:

        path = os.path.join(
            SPLITS_DIR,
            filename
        )

        if not os.path.exists(path):

            raise FileNotFoundError(
                f"Missing split file: {path}"
            )

        print(
            f"  OK: {path}",
            flush=True
        )


    # =====================================================
    # LOAD DATA
    # =====================================================

    print(
        "\n" + "-" * 70,
        flush=True
    )

    print(
        "Loading datasets...",
        flush=True
    )

    print(
        "-" * 70,
        flush=True
    )

    train_loader, val_loader, test_loader = build_dataloaders(
        splits_dir=SPLITS_DIR,
        batch_size=BATCH_SIZE,
        num_workers=0
    )

    print(
        f"\nTrain batches: {len(train_loader)}",
        flush=True
    )

    print(
        f"Validation batches: {len(val_loader)}",
        flush=True
    )

    print(
        f"Test batches: {len(test_loader)}",
        flush=True
    )


    # =====================================================
    # CLASS WEIGHTS
    # =====================================================

    class_weights = calculate_class_weights(
        train_loader
    )

    class_weights = class_weights.to(
        DEVICE
    )


    # =====================================================
    # LOAD MOBILENETV3-SMALL
    # =====================================================

    print(
        "\n" + "-" * 70,
        flush=True
    )

    print(
        "Loading pretrained MobileNetV3-Small...",
        flush=True
    )

    print(
        "-" * 70,
        flush=True
    )

    weights = (
        models.MobileNet_V3_Small_Weights.DEFAULT
    )

    model = models.mobilenet_v3_small(
        weights=weights
    )


    # =====================================================
    # REPLACE CLASSIFIER
    # =====================================================

    in_features = (
        model.classifier[-1].in_features
    )

    model.classifier[-1] = nn.Linear(
        in_features,
        NUM_CLASSES
    )

    model = model.to(
        DEVICE
    )

    print(
        f"\nFinal classifier: "
        f"{in_features} -> {NUM_CLASSES}",
        flush=True
    )


    # =====================================================
    # LOSS
    # =====================================================

    criterion = nn.CrossEntropyLoss(
        weight=class_weights
    )


    # =====================================================
    # OPTIMIZER
    # =====================================================

    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=LEARNING_RATE
    )


    # =====================================================
    # MODEL DIRECTORY
    # =====================================================

    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )


    # =====================================================
    # TRAINING
    # =====================================================

    best_val_accuracy = 0.0

    print(
        "\n" + "=" * 70,
        flush=True
    )

    print(
        "STARTING TRAINING",
        flush=True
    )

    print(
        "=" * 70,
        flush=True
    )


    for epoch in range(
        1,
        NUM_EPOCHS + 1
    ):

        print(
            f"\n{'=' * 70}",
            flush=True
        )

        print(
            f"EPOCH {epoch}/{NUM_EPOCHS}",
            flush=True
        )

        print(
            f"{'=' * 70}",
            flush=True
        )


        # -------------------------------------------------
        # TRAIN
        # -------------------------------------------------

        train_loss, train_accuracy = train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
            epoch
        )


        # -------------------------------------------------
        # VALIDATION
        # -------------------------------------------------

        print(
            "\nValidating...",
            flush=True
        )

        val_loss, val_accuracy = validate(
            model,
            val_loader,
            criterion
        )


        # -------------------------------------------------
        # RESULTS
        # -------------------------------------------------

        print(
            "\nResults:",
            flush=True
        )

        print(
            f"  Train Loss:     {train_loss:.4f}",
            flush=True
        )

        print(
            f"  Train Accuracy: {train_accuracy:.4f}",
            flush=True
        )

        print(
            f"  Val Loss:       {val_loss:.4f}",
            flush=True
        )

        print(
            f"  Val Accuracy:   {val_accuracy:.4f}",
            flush=True
        )


        # -------------------------------------------------
        # SAVE BEST MODEL
        # -------------------------------------------------

        if val_accuracy > best_val_accuracy:

            best_val_accuracy = val_accuracy

            torch.save(
                model.state_dict(),
                MODEL_PATH
            )

            print(
                "\n  ✓ NEW BEST MODEL SAVED",
                flush=True
            )

            print(
                f"    {MODEL_PATH}",
                flush=True
            )


    # =====================================================
    # COMPLETE
    # =====================================================

    print(
        "\n" + "=" * 70,
        flush=True
    )

    print(
        "TRAINING COMPLETE",
        flush=True
    )

    print(
        "=" * 70,
        flush=True
    )

    print(
        f"\nBest validation accuracy: "
        f"{best_val_accuracy:.4f}",
        flush=True
    )

    print(
        "\nModel saved at:",
        flush=True
    )

    print(
        f"  {MODEL_PATH}",
        flush=True
    )

    print(
        "\nThe test set was NOT used during training.",
        flush=True
    )

    print(
        "=" * 70,
        flush=True
    )


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    try:

        main()

    except Exception as error:

        print(
            "\n" + "=" * 70,
            flush=True
        )

        print(
            "TRAINING FAILED",
            flush=True
        )

        print(
            "=" * 70,
            flush=True
        )

        print(
            f"\nError: {error}",
            flush=True
        )

        traceback.print_exc()

        sys.exit(1)