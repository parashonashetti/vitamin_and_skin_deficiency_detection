"""
VitaHealth - 22 Class Skin Disease Model Training

Model:
    MobileNetV3-Small

Dataset:
    data/raw/SkinDisease22

Classes:
    22 classes including Unknown_Normal

Training:
    - Pretrained MobileNetV3-Small
    - Training augmentation
    - ImageNet normalization
    - Class-weighted CrossEntropyLoss
    - 80/20 validation split from TRAIN data
    - Original TEST data remains untouched
    - Best model selected using validation accuracy
"""

import os
import random
from collections import Counter
from pathlib import Path

import torch
import torch.nn as nn
from PIL import ImageFile
from torch.utils.data import DataLoader, Subset
from torchvision import datasets, models, transforms


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_ROOT = Path("data/raw/SkinDisease22")

TRAIN_DIR = DATASET_ROOT / "train"
TEST_DIR = DATASET_ROOT / "test"

MODEL_DIR = Path("models")
MODEL_PATH = MODEL_DIR / "skin_classifier_22_mobilenet.pth"

IMAGE_SIZE = 224
BATCH_SIZE = 32

NUM_EPOCHS = 15
LEARNING_RATE = 1e-4

VALIDATION_RATIO = 0.20

RANDOM_SEED = 42

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# BASIC SETTINGS
# ============================================================

ImageFile.LOAD_TRUNCATED_IMAGES = True

random.seed(RANDOM_SEED)
torch.manual_seed(RANDOM_SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)


# ============================================================
# IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=10
    ),

    transforms.ColorJitter(
        brightness=0.15,
        contrast=0.15,
        saturation=0.10,
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


eval_transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ============================================================
# CREATE DATASETS
# ============================================================

print("=" * 70)
print("VitaHealth - 22 Class Skin Disease Training")
print("=" * 70)

print(f"\nDevice: {DEVICE}")
print(f"Training directory: {TRAIN_DIR}")
print(f"Testing directory:  {TEST_DIR}")


if not TRAIN_DIR.exists():
    raise FileNotFoundError(
        f"Training directory not found: {TRAIN_DIR}"
    )


if not TEST_DIR.exists():
    raise FileNotFoundError(
        f"Testing directory not found: {TEST_DIR}"
    )


# We create two versions of the same TRAIN dataset:
# one with augmentation and one without augmentation.
full_train_augmented = datasets.ImageFolder(
    root=str(TRAIN_DIR),
    transform=train_transform,
)


full_train_eval = datasets.ImageFolder(
    root=str(TRAIN_DIR),
    transform=eval_transform,
)


test_dataset = datasets.ImageFolder(
    root=str(TEST_DIR),
    transform=eval_transform,
)


# ============================================================
# CLASS INFORMATION
# ============================================================

class_names = full_train_augmented.classes

num_classes = len(class_names)

print(f"\nNumber of classes: {num_classes}")

print("\nClass mapping:")

for index, class_name in enumerate(class_names):
    print(
        f"  {index:2d} -> {class_name}"
    )


if num_classes != 22:
    raise RuntimeError(
        f"Expected 22 classes, but found {num_classes}."
    )


# Make sure train and test have the same classes.
if full_train_augmented.classes != test_dataset.classes:
    raise RuntimeError(
        "\nTrain and test class folders do not match."
        "\nTrain classes:"
        f"\n{full_train_augmented.classes}"
        "\n\nTest classes:"
        f"\n{test_dataset.classes}"
    )


print(
    f"\nTotal training images: "
    f"{len(full_train_augmented)}"
)

print(
    f"Total test images: "
    f"{len(test_dataset)}"
)


# ============================================================
# CREATE STRATIFIED VALIDATION SPLIT
# ============================================================

print("\nCreating 80/20 validation split...")


# Store indices belonging to each class.
class_to_indices = {}

for class_index in range(num_classes):

    indices = [
        i
        for i, (_, label) in enumerate(
            full_train_augmented.samples
        )
        if label == class_index
    ]

    random.shuffle(indices)

    class_to_indices[class_index] = indices


train_indices = []
val_indices = []


for class_index, indices in class_to_indices.items():

    validation_count = max(
        1,
        int(
            len(indices)
            * VALIDATION_RATIO
        )
    )

    val_class_indices = indices[
        :validation_count
    ]

    train_class_indices = indices[
        validation_count:
    ]

    train_indices.extend(
        train_class_indices
    )

    val_indices.extend(
        val_class_indices
    )


random.shuffle(train_indices)
random.shuffle(val_indices)


train_dataset = Subset(
    full_train_augmented,
    train_indices,
)


val_dataset = Subset(
    full_train_eval,
    val_indices,
)


print(
    f"Training images:   {len(train_dataset)}"
)

print(
    f"Validation images: {len(val_dataset)}"
)

print(
    f"Test images:       {len(test_dataset)}"
)


# ============================================================
# DATALOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=torch.cuda.is_available(),
)


val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available(),
)


test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available(),
)


# ============================================================
# CALCULATE CLASS WEIGHTS
# ============================================================

print("\nCalculating class weights...")


train_label_counter = Counter()


for original_index in train_indices:

    _, label = full_train_augmented.samples[
        original_index
    ]

    train_label_counter[label] += 1


class_counts = torch.tensor(
    [
        train_label_counter[i]
        for i in range(num_classes)
    ],
    dtype=torch.float32,
)


print("\nTraining class counts:")

for i, class_name in enumerate(class_names):

    print(
        f"  {class_name:<25} "
        f": {int(class_counts[i])}"
    )


if (class_counts == 0).any():

    raise RuntimeError(
        "At least one class has zero training images."
    )


# Inverse-frequency weighting.
class_weights = (
    class_counts.sum()
    /
    (
        num_classes
        * class_counts
    )
)


class_weights = class_weights.to(
    DEVICE
)


# ============================================================
# CREATE MODEL
# ============================================================

print(
    "\nLoading MobileNetV3-Small..."
)


# Use pretrained ImageNet weights.
# If torchvision needs to download the weights,
# an internet connection is required for the first run.

weights = (
    models.MobileNet_V3_Small_Weights.DEFAULT
)


model = models.mobilenet_v3_small(
    weights=weights
)


# Replace the final classifier layer.
model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    num_classes,
)


model = model.to(DEVICE)


# ============================================================
# LOSS + OPTIMIZER
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE,
)


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_one_epoch(
    model,
    loader,
    criterion,
    optimizer,
):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:

        images = images.to(
            DEVICE,
            non_blocking=True,
        )

        labels = labels.to(
            DEVICE,
            non_blocking=True,
        )

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels,
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item()
            * labels.size(0)
        )

        predictions = outputs.argmax(
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)


    epoch_loss = (
        running_loss
        /
        max(total, 1)
    )

    epoch_accuracy = (
        correct
        /
        max(total, 1)
    )

    return (
        epoch_loss,
        epoch_accuracy,
    )


# ============================================================
# VALIDATION FUNCTION
# ============================================================

def evaluate_model(
    model,
    loader,
    criterion,
):

    model.eval()

    running_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in loader:

            images = images.to(
                DEVICE,
                non_blocking=True,
            )

            labels = labels.to(
                DEVICE,
                non_blocking=True,
            )

            outputs = model(images)

            loss = criterion(
                outputs,
                labels,
            )

            running_loss += (
                loss.item()
                * labels.size(0)
            )

            predictions = outputs.argmax(
                dim=1
            )

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)


    epoch_loss = (
        running_loss
        /
        max(total, 1)
    )

    epoch_accuracy = (
        correct
        /
        max(total, 1)
    )

    return (
        epoch_loss,
        epoch_accuracy,
    )


# ============================================================
# TRAIN MODEL
# ============================================================

print("\nStarting training...")
print("=" * 70)


best_val_accuracy = 0.0


MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


for epoch in range(NUM_EPOCHS):

    train_loss, train_accuracy = (
        train_one_epoch(
            model,
            train_loader,
            criterion,
            optimizer,
        )
    )


    val_loss, val_accuracy = (
        evaluate_model(
            model,
            val_loader,
            criterion,
        )
    )


    print(
        f"\nEpoch "
        f"{epoch + 1}/{NUM_EPOCHS}"
    )

    print(
        f"Train Loss: "
        f"{train_loss:.4f}"
    )

    print(
        f"Train Accuracy: "
        f"{train_accuracy * 100:.2f}%"
    )

    print(
        f"Val Loss: "
        f"{val_loss:.4f}"
    )

    print(
        f"Val Accuracy: "
        f"{val_accuracy * 100:.2f}%"
    )


    # Save the best validation model.
    if val_accuracy > best_val_accuracy:

        best_val_accuracy = (
            val_accuracy
        )

        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "class_names":
                    class_names,

                "image_size":
                    IMAGE_SIZE,

                "model":
                    "MobileNetV3-Small",
            },
            MODEL_PATH,
        )


        print(
            "✓ Best model saved."
        )


# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\nLoading best model...")


checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
)


model.load_state_dict(
    checkpoint["model_state_dict"]
)


model = model.to(DEVICE)


# ============================================================
# FINAL TEST EVALUATION
# ============================================================

print("\n" + "=" * 70)
print("FINAL TEST EVALUATION")
print("=" * 70)


test_loss, test_accuracy = (
    evaluate_model(
        model,
        test_loader,
        criterion,
    )
)


print(
    f"\nTest Loss: "
    f"{test_loss:.4f}"
)

print(
    f"Test Accuracy: "
    f"{test_accuracy * 100:.2f}%"
)


print(
    f"\nBest Validation Accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)


print(
    f"\nModel saved to:"
    f"\n{MODEL_PATH}"
)


print("\nTraining completed successfully.")