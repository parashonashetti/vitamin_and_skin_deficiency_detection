"""
VitaHealth - Phase 3: Preprocessing Pipeline and Dataset Loader

Defines:
    - Image size and normalization
    - TRAIN-ONLY augmentation transforms
    - VAL/TEST preprocessing (resize + normalize only, no augmentation)
    - A PyTorch Dataset that reads from the split CSVs produced by
      split_dataset.py

No model or training loop lives here (Phase 4).
"""

from pathlib import Path

import pandas as pd
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

# --- Class list, fixed order (index <-> class name mapping used everywhere) ---
CLASS_NAMES = [
    "Atopic Dermatitis",
    "Contact Dermatitis",
    "Eczema",
    "Scabies",
    "Seborrheic Dermatitis",
    "Tinea Corporis",
]
CLASS_TO_IDX = {name: i for i, name in enumerate(CLASS_NAMES)}

# --- Image size and normalization ---
# 224x224 matches the input size expected by standard ImageNet-pretrained
# backbones (ResNet, EfficientNet-B0, MobileNetV2/V3) we'll choose between
# in Phase 4, so transfer learning weights line up without modification.
IMAGE_SIZE = 224

# ImageNet mean/std, since we plan to use ImageNet-pretrained transfer
# learning (per the original project spec). If Phase 4 instead trains a
# model from scratch, these should be recalculated from our own training
# set statistics instead of reused blindly.
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


# --- TRAIN-ONLY augmentation ---
# Applied only to the training split. Chosen conservatively: skin condition
# diagnosis depends on real visual features (color, texture, distribution
# pattern), so we avoid aggressive color distortion or extreme rotations
# that could erase or fabricate clinically meaningful signal.
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
    transforms.RandomAffine(degrees=0, translate=(0.05, 0.05)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])

# --- VAL/TEST preprocessing ---
# Deterministic only: resize + normalize. NO augmentation, ever.
# This is what makes validation/test metrics trustworthy - the model is
# evaluated on a fixed, unmodified view of each image, not a randomly
# perturbed one that changes between runs.
eval_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
])


class SkinConditionDataset(Dataset):
    """
    Reads a split CSV (train.csv / val.csv / test.csv produced by
    split_dataset.py) and serves (image_tensor, label_idx) pairs.

    IMPORTANT: this class does not decide which transform to use - the
    caller passes the correct one in, so it's impossible to accidentally
    apply train-only augmentation to val/test data by forgetting a flag.
    """

    def __init__(self, split_csv_path: str, transform):
        self.df = pd.read_csv(split_csv_path)
        self.transform = transform

        unknown = set(self.df["class"].unique()) - set(CLASS_NAMES)
        if unknown:
            raise ValueError(
                f"Split CSV contains class names not in CLASS_NAMES: {unknown}. "
                f"Expected exactly: {CLASS_NAMES}"
            )

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = Path(row["path"])
        image = Image.open(img_path).convert("RGB")
        image = self.transform(image)
        label = CLASS_TO_IDX[row["class"]]
        return image, label


def build_dataloaders(splits_dir: str, batch_size: int = 32, num_workers: int = 2):
    """
    Convenience factory. Returns (train_loader, val_loader, test_loader).
    Only imported/used from Phase 4 onward - not executed here.
    """
    from torch.utils.data import DataLoader

    splits_dir = Path(splits_dir)

    train_ds = SkinConditionDataset(splits_dir / "train.csv", transform=train_transform)
    val_ds = SkinConditionDataset(splits_dir / "val.csv", transform=eval_transform)
    test_ds = SkinConditionDataset(splits_dir / "test.csv", transform=eval_transform)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)
    test_loader = DataLoader(test_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    return train_loader, val_loader, test_loader
