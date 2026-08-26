"""
VitaHealth - Phase 3: Dataset Inspection Script

Purpose:
    Inspect the RAW (Preprocessed-only) SkinDisNet images and metadata
    BEFORE any splitting, augmentation, or training happens.

    This script makes NO assumptions about class balance. It reports
    what is actually in the dataset so we can make informed decisions.

Usage:
    python inspect_dataset.py --data-root ../data/raw/skindisnet

What this script does NOT do:
    - It does not train anything.
    - It does not touch the Augmented/ folder (by design - augmented
      images must never be treated as independent samples).
    - It does not assume the metadata CSV's column names - it prints
      whatever it finds and tries common name variants.
"""

import argparse
import hashlib
import os
import sys
from collections import defaultdict
from pathlib import Path

import pandas as pd
from PIL import Image, UnidentifiedImageError

# The six official classes for this project, exactly as approved in Phase 2.
# Keys are the short codes seen in filenames (e.g. "AD (1).jpg"); values are
# the full class names we will standardize on everywhere else in the project.
CLASS_CODE_TO_NAME = {
    "AD": "Atopic Dermatitis",
    "CD": "Contact Dermatitis",
    "EC": "Eczema",
    "SC": "Scabies",
    "SD": "Seborrheic Dermatitis",
    "TC": "Tinea Corporis",
}
VALID_CLASS_NAMES = set(CLASS_CODE_TO_NAME.values())

# Actual SkinDisNet Preprocessed folder names.
CLASS_FOLDER_TO_NAME = {
    "Atopic Dermatitis (AD)": "Atopic Dermatitis",
    "Contact Dermatitis (CD)": "Contact Dermatitis",
    "Eczema (EC)": "Eczema",
    "Scabies (SC)": "Scabies",
    "Seborrheic Dermatitis (SD)": "Seborrheic Dermatitis",
    "Tinea Corporis (TC)": "Tinea Corporis",
}

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}

# Candidate column name variants we'll look for in the metadata CSV,
# since the exact header spelling could not be verified from public
# sources before download. We do NOT hard-fail if these don't match -
# we report what we find instead.
CANDIDATE_COLUMNS = {
    "patient_id": [
        "Patient_id",
        "patient_id",
        "Patient_ID",
        "PatientID",
        "patient",
        "Patient",
    ],

    "image_id": [
        "Image_id",
        "image_id",
        "Image_ID",
        "filename",
        "Filename",
        "image",
        "Image",
    ],

    "diagnosis": [
        "Diagnosis",
        "diagnosis",
        "class",
        "Class",
        "label",
        "Label",
    ],

    "age": [
        "Age",
        "age",
    ],

    "sex": [
        "Sex",
        "sex",
        "gender",
        "Gender",
    ],

    "lesion_location": [
        "Leision_location",
        "lesion_location",
        "Lesion_Location",
        "site",
        "Site",
        "body_part",
    ],
}


def find_preprocessed_root(data_root: Path) -> Path:
    """
    Locate the 'Preprocessed' folder under data_root, tolerant of
    naming variations (case, spacing). We deliberately do NOT walk
    into any folder with 'augment' in its name.
    """
    for child in data_root.rglob("*"):
        if child.is_dir() and "preprocess" in child.name.lower():
            return child
    raise FileNotFoundError(
        f"Could not find a 'Preprocessed' folder under {data_root}. "
        "Check the unzip location and folder names, and adjust "
        "find_preprocessed_root() if the dataset uses a different name."
    )


def discover_class_folders(preprocessed_root: Path) -> dict:
    """
    Discover class subfolders under Preprocessed/.

    Supports the exact SkinDisNet folder names, the standardized class
    names, and the short class codes.
    """
    resolved = {}
    for child in sorted(preprocessed_root.iterdir()):
        if not child.is_dir():
            continue

        name = child.name.strip()

        if name in CLASS_FOLDER_TO_NAME:
            resolved[child] = CLASS_FOLDER_TO_NAME[name]
        elif name in VALID_CLASS_NAMES:
            resolved[child] = name
        elif name.upper() in CLASS_CODE_TO_NAME:
            resolved[child] = CLASS_CODE_TO_NAME[name.upper()]
        else:
            print(
                f"  [WARN] Unrecognized folder '{name}' - skipping. "
                "If this IS one of our six classes under a different name, "
                "add it to CLASS_FOLDER_TO_NAME."
            )
    return resolved


def infer_class_from_filename(filename: str) -> str | None:
    """Fallback: infer class from the filename prefix, e.g. 'AD (1).jpg' -> Atopic Dermatitis."""
    prefix = filename.split(" ")[0].split("(")[0].strip().upper()
    return CLASS_CODE_TO_NAME.get(prefix)


def md5_of_file(path: Path, chunk_size: int = 8192) -> str:
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            h.update(chunk)
    return h.hexdigest()


def load_metadata(data_root: Path) -> pd.DataFrame | None:
    csv_candidates = list(data_root.rglob("*.csv"))
    if not csv_candidates:
        print("  [WARN] No CSV file found under the data root. "
              "Patient-ID based splitting will not be possible until "
              "the metadata file location is confirmed.")
        return None
    if len(csv_candidates) > 1:
        print(f"  [WARN] Multiple CSV files found: {csv_candidates}. "
              f"Using the first one: {csv_candidates[0]}")
    csv_path = csv_candidates[0]
    print(f"  Found metadata CSV: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"  Columns found: {list(df.columns)}")
    return df


def resolve_column(df: pd.DataFrame, logical_name: str) -> str | None:
    """Find the actual column name in df matching one of our candidates."""
    for candidate in CANDIDATE_COLUMNS.get(logical_name, []):
        if candidate in df.columns:
            return candidate
    return None


def main():
    parser = argparse.ArgumentParser(description="Inspect the raw SkinDisNet dataset.")
    parser.add_argument(
        "--data-root",
        type=str,
        default="../data/raw/skindisnet",
        help="Path to the unzipped SkinDisNet dataset root.",
    )
    args = parser.parse_args()
    data_root = Path(args.data_root).resolve()

    print("=" * 70)
    print("VitaHealth Phase 3 - Dataset Inspection")
    print("=" * 70)
    print(f"Data root: {data_root}\n")

    if not data_root.exists():
        print(f"[ERROR] Data root does not exist: {data_root}")
        print("Check that you've downloaded and unzipped the dataset per the")
        print("Phase 3 instructions, and pass the correct --data-root path.")
        sys.exit(1)

    # --- Step 1: locate the raw (Preprocessed) folder only ---
    print("[1/7] Locating Preprocessed (raw) image folder...")
    preprocessed_root = find_preprocessed_root(data_root)
    print(f"  Using: {preprocessed_root}\n")

    # --- Step 2: discover class folders ---
    print("[2/7] Discovering class folders...")
    class_folders = discover_class_folders(preprocessed_root)
    for folder, cls in class_folders.items():
        print(f"  {folder.name}  ->  {cls}")
    if not class_folders:
        print("  [ERROR] No recognizable class folders found. Inspect the "
              "directory manually and update discover_class_folders().")
        sys.exit(1)
    print()

    # --- Step 3: count raw images per class + collect file records ---
    print("[3/7] Counting raw images per class...")
    records = []  # list of dicts: path, class, filename
    for folder, cls in class_folders.items():
        for f in sorted(folder.iterdir()):
            if f.suffix.lower() in IMAGE_EXTENSIONS:
                records.append({"path": f, "class": cls, "filename": f.name})

    class_counts = defaultdict(int)
    for r in records:
        class_counts[r["class"]] += 1

    total_images = len(records)
    print(f"  Total raw images found: {total_images}")
    for cls in sorted(VALID_CLASS_NAMES):
        count = class_counts.get(cls, 0)
        pct = (count / total_images * 100) if total_images else 0
        print(f"    {cls:<25} {count:>5} images  ({pct:5.1f}%)")

    # Explicit imbalance check - we do NOT assume balance.
    if class_counts:
        max_c, min_c = max(class_counts.values()), min(class_counts.values())
        ratio = (max_c / min_c) if min_c > 0 else float("inf")
        print(f"\n  Largest class / smallest class ratio: {ratio:.2f}x")
        if ratio > 1.5:
            print("  [FINDING] Classes are NOT balanced. This must be handled "
                  "explicitly in training (see Phase 3 write-up, section 12).")
        else:
            print("  [FINDING] Classes are roughly balanced, but still verify "
                  "per-split balance after patient-level splitting.")
    print()

    # --- Step 4: check for missing / unreadable files ---
    print("[4/7] Checking for missing or corrupt/invalid images...")
    corrupt = []
    unreadable = []
    for r in records:
        p = r["path"]
        if not p.exists():
            unreadable.append((p, "file does not exist"))
            continue
        try:
            with Image.open(p) as img:
                img.verify()  # cheap structural check
        except (UnidentifiedImageError, OSError) as e:
            corrupt.append((p, str(e)))

    print(f"  Missing files: {len(unreadable)}")
    print(f"  Corrupt/invalid images: {len(corrupt)}")
    for p, reason in corrupt[:10]:
        print(f"    [CORRUPT] {p.name}: {reason}")
    if len(corrupt) > 10:
        print(f"    ...and {len(corrupt) - 10} more (see full log if needed)")
    print()

    # --- Step 5: check for duplicate images (exact + near-duplicate) ---
    print("[5/7] Checking for duplicate images (exact MD5 match)...")
    hash_to_files = defaultdict(list)
    for r in records:
        p = r["path"]
        if not p.exists():
            continue
        try:
            file_hash = md5_of_file(p)
            hash_to_files[file_hash].append(p)
        except OSError:
            continue

    exact_dupe_groups = {h: paths for h, paths in hash_to_files.items() if len(paths) > 1}
    total_exact_dupes = sum(len(v) - 1 for v in exact_dupe_groups.values())
    print(f"  Exact duplicate files (by MD5): {total_exact_dupes} "
          f"across {len(exact_dupe_groups)} groups")
    for h, paths in list(exact_dupe_groups.items())[:5]:
        print(f"    Group: {[p.name for p in paths]}")

    # Optional near-duplicate check using perceptual hashing, if imagehash is installed.
    try:
        import imagehash

        print("\n  Checking near-duplicates (perceptual hash, tolerance <= 2)...")
        phashes = []
        for r in records:
            p = r["path"]
            if not p.exists():
                continue
            try:
                with Image.open(p) as img:
                    phashes.append((p, imagehash.phash(img)))
            except (UnidentifiedImageError, OSError):
                continue

        near_dupes = []
        # NOTE: O(n^2) - fine for ~1,710 images, would need a smarter
        # approach (e.g. hashing buckets / ANN) for much larger datasets.
        for i in range(len(phashes)):
            for j in range(i + 1, len(phashes)):
                p1, h1 = phashes[i]
                p2, h2 = phashes[j]
                if h1 - h2 <= 2:
                    near_dupes.append((p1.name, p2.name))
        print(f"  Near-duplicate pairs found: {len(near_dupes)}")
        for a, b in near_dupes[:10]:
            print(f"    {a}  ~=  {b}")
    except ImportError:
        print("\n  [SKIPPED] imagehash not installed - run "
              "'pip install imagehash' to also check near-duplicates.")
    print()

    # --- Step 6: load metadata, check patient IDs ---
    print("[6/7] Loading metadata and checking patient IDs...")
    df = load_metadata(data_root)
    patient_col = image_col = diagnosis_col = None
    if df is not None:
        patient_col = resolve_column(df, "patient_id")
        image_col = resolve_column(df, "image_id")
        diagnosis_col = resolve_column(df, "diagnosis")

        print(f"  Resolved patient ID column: {patient_col}")
        print(f"  Resolved image/filename column: {image_col}")
        print(f"  Resolved diagnosis column: {diagnosis_col}")

        if patient_col:
            n_patients = df[patient_col].nunique()
            n_rows = len(df)
            print(f"  Unique patients: {n_patients}")
            print(f"  Metadata rows: {n_rows}")
            print(f"  Average images per patient: {n_rows / n_patients:.2f}")

            # Check: does every metadata row have a non-null patient ID?
            missing_patient_id = df[patient_col].isna().sum()
            print(f"  Rows with missing patient ID: {missing_patient_id}")

            # Check: patients appearing in multiple classes (would complicate
            # a clean patient-level split if a patient has multiple diagnoses)
            if diagnosis_col:
                patient_class_counts = df.groupby(patient_col)[diagnosis_col].nunique()
                multi_class_patients = (patient_class_counts > 1).sum()
                print(f"  Patients with images across multiple classes: "
                      f"{multi_class_patients}")
                if multi_class_patients > 0:
                    print("  [FINDING] Some patients have images in more than one "
                          "class. Splitting must still be done by patient_id as a "
                          "whole (a patient's images stay together), which may mean "
                          "a patient contributes to more than one class within the "
                          "same split - this is expected and fine, as long as the "
                          "patient never appears in two DIFFERENT splits.")
        else:
            print("  [WARN] Could not resolve a patient ID column automatically. "
                  "Open the CSV and tell me the actual column name so the "
                  "CANDIDATE_COLUMNS mapping can be corrected.")

        if diagnosis_col:
            print(f"\n  Class distribution per metadata ({diagnosis_col}):")
            print(df[diagnosis_col].value_counts())
    else:
        print("  [WARN] No metadata loaded - patient-level split cannot proceed "
              "until the CSV is located.")
    print()

    # --- Step 7: cross-check metadata against actual image files ---
    print("[7/7] Cross-checking metadata rows against actual image files...")

    if df is not None and image_col is not None:
        actual_filenames = {r["filename"] for r in records}

        metadata_filenames = set()
        for value in df[image_col].astype(str):
            value = value.strip()
            if not Path(value).suffix:
                value = value + ".jpg"
            metadata_filenames.add(value)

        in_metadata_not_on_disk = metadata_filenames - actual_filenames
        on_disk_not_in_metadata = actual_filenames - metadata_filenames

        print(
            f"  Rows in metadata with no matching image file on disk: "
            f"{len(in_metadata_not_on_disk)}"
        )
        if in_metadata_not_on_disk:
            sample = list(in_metadata_not_on_disk)[:5]
            print(f"    Examples: {sample}")

        print(
            f"  Image files on disk with no matching metadata row: "
            f"{len(on_disk_not_in_metadata)}"
        )
        if on_disk_not_in_metadata:
            sample = list(on_disk_not_in_metadata)[:5]
            print(f"    Examples: {sample}")

    else:
        print(
            "  [SKIPPED] Cannot cross-check without both metadata and a "
            "resolved image/filename column."
        )

    print("\n" + "=" * 70)
    print("Inspection complete.")
    print("=" * 70)


if __name__ == "__main__":
    main()