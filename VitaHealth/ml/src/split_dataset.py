"""
VitaHealth - Phase 3: Patient-Level Dataset Split

Splits SkinDisNet Preprocessed images into:
    Train: 70% patients
    Validation: 15% patients
    Test: 15% patients

IMPORTANT:
- Split is by patient_id, never by individual image.
- Augmented images are NOT used.
- Metadata Image_id values such as "AD (14)" are normalized to
  actual files such as "AD (14).jpg".
"""

import argparse
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

from inspect_dataset import (
    find_preprocessed_root,
    discover_class_folders,
    load_metadata,
    resolve_column,
)


RANDOM_SEED = 42

TRAIN_FRAC = 0.70
VAL_FRAC = 0.15
TEST_FRAC = 0.15


def normalize_filename(value):
    """
    Convert SkinDisNet metadata filename to the actual disk filename.

    Example:
        AD (14) -> AD (14).jpg
        AD (14).jpg -> AD (14).jpg
    """

    value = str(value).strip()

    # Remove any directory/path information.
    value = Path(value).name

    # SkinDisNet metadata normally has no extension.
    if not Path(value).suffix:
        value = value + ".jpg"

    return value


def build_patient_class_table(data_root: Path) -> pd.DataFrame:

    print("Locating Preprocessed dataset...")

    preprocessed_root = find_preprocessed_root(data_root)

    print(f"  Using: {preprocessed_root}")

    # ---------------------------------------------------------
    # Discover six class folders
    # ---------------------------------------------------------

    class_folders = discover_class_folders(preprocessed_root)

    if not class_folders:
        raise RuntimeError(
            "No recognizable class folders found."
        )

    print("\nClass folders:")

    for folder, cls in class_folders.items():
        print(f"  {folder.name} -> {cls}")

    # ---------------------------------------------------------
    # Collect actual images from disk
    # ---------------------------------------------------------

    file_records = []

    for folder, cls in class_folders.items():

        for f in sorted(folder.iterdir()):

            if f.suffix.lower() in {
                ".jpg",
                ".jpeg",
                ".png",
            }:

                file_records.append(
                    {
                        "filename": f.name,
                        "class": cls,
                        "path": str(f),
                    }
                )

    files_df = pd.DataFrame(file_records)

    print(f"\nImages found on disk: {len(files_df)}")

    if files_df.empty:
        raise RuntimeError(
            "No images were found in the Preprocessed folders."
        )

    # ---------------------------------------------------------
    # Load metadata
    # ---------------------------------------------------------

    meta_df = load_metadata(data_root)

    if meta_df is None:
        raise RuntimeError(
            "SkinDisNet_Metadata.csv could not be found."
        )

    print("\nMetadata columns:")
    print(list(meta_df.columns))

    # ---------------------------------------------------------
    # Resolve metadata columns
    # ---------------------------------------------------------

    patient_col = resolve_column(
        meta_df,
        "patient_id"
    )

    image_col = resolve_column(
        meta_df,
        "image_id"
    )

    if not patient_col or not image_col:

        raise RuntimeError(
            "Could not resolve Patient_id or Image_id."
        )

    print(f"\nPatient ID column: {patient_col}")
    print(f"Image ID column: {image_col}")

    # ---------------------------------------------------------
    # Rename columns
    # ---------------------------------------------------------

    meta_df = meta_df.rename(
        columns={
            patient_col: "patient_id",
            image_col: "filename",
        }
    )

    # ---------------------------------------------------------
    # Normalize filenames
    # ---------------------------------------------------------

    files_df["filename_normalized"] = (
        files_df["filename"]
        .apply(normalize_filename)
    )

    meta_df["filename_normalized"] = (
        meta_df["filename"]
        .apply(normalize_filename)
    )

    # ---------------------------------------------------------
    # Merge images with patient IDs
    # ---------------------------------------------------------

    merged = files_df.merge(
        meta_df[
            [
                "patient_id",
                "filename_normalized",
            ]
        ],
        on="filename_normalized",
        how="left",
    )

    unmatched = merged["patient_id"].isna().sum()

    matched = len(merged) - unmatched

    print("\nMetadata/image matching:")
    print(f"  Matched images:   {matched}")
    print(f"  Unmatched images: {unmatched}")

    # ---------------------------------------------------------
    # Stop if matching failed
    # ---------------------------------------------------------

    if unmatched > 0:

        examples = (
            merged.loc[
                merged["patient_id"].isna(),
                "filename",
            ]
            .head(10)
            .tolist()
        )

        print("\nUnmatched examples:")
        print(examples)

        raise RuntimeError(
            f"{unmatched} images could not be matched to "
            "patient IDs. Split stopped to prevent data leakage."
        )

    # ---------------------------------------------------------
    # Check patient IDs
    # ---------------------------------------------------------

    missing_patient_ids = (
        merged["patient_id"]
        .isna()
        .sum()
    )

    if missing_patient_ids > 0:

        raise RuntimeError(
            f"{missing_patient_ids} rows have missing patient IDs."
        )

    n_patients = merged["patient_id"].nunique()

    print(
        f"\nUnique patients: {n_patients}"
    )

    if n_patients < 3:

        raise RuntimeError(
            "Not enough patients for train/validation/test split."
        )

    return merged


def patient_level_split(merged):

    """
    Split patients, NOT individual images.

    Every image belonging to one patient stays
    inside exactly one split.
    """

    # ---------------------------------------------------------
    # Determine each patient's primary class
    # ---------------------------------------------------------

    patient_primary_class = (
        merged
        .groupby("patient_id")["class"]
        .agg(
            lambda s:
            s.value_counts().idxmax()
        )
        .reset_index()
        .rename(
            columns={
                "class": "primary_class"
            }
        )
    )

    print(
        "\nPatients per primary class:"
    )

    print(
        patient_primary_class[
            "primary_class"
        ].value_counts()
    )

    # ---------------------------------------------------------
    # Check whether stratification is possible
    # ---------------------------------------------------------

    class_counts = (
        patient_primary_class[
            "primary_class"
        ]
        .value_counts()
    )

    can_stratify = (
        class_counts >= 3
    ).all()

    if can_stratify:

        stratify_col = (
            patient_primary_class[
                "primary_class"
            ]
        )

        print(
            "\nUsing stratified patient split."
        )

    else:

        stratify_col = None

        print(
            "\n[WARNING] Some classes have fewer "
            "than 3 patients."
        )

        print(
            "Using non-stratified patient split."
        )

    # ---------------------------------------------------------
    # TRAIN = 70%
    # TEMP = 30%
    # ---------------------------------------------------------

    train_p, temp_p = train_test_split(
        patient_primary_class,
        train_size=TRAIN_FRAC,
        random_state=RANDOM_SEED,
        stratify=stratify_col,
    )

    # ---------------------------------------------------------
    # TEMP -> VALIDATION + TEST
    # 15% + 15%
    # ---------------------------------------------------------

    if can_stratify:

        temp_stratify = (
            temp_p["primary_class"]
        )

    else:

        temp_stratify = None

    val_p, test_p = train_test_split(
        temp_p,
        train_size=0.5,
        random_state=RANDOM_SEED,
        stratify=temp_stratify,
    )

    # ---------------------------------------------------------
    # Assign split names
    # ---------------------------------------------------------

    train_p = train_p.assign(
        split="train"
    )

    val_p = val_p.assign(
        split="val"
    )

    test_p = test_p.assign(
        split="test"
    )

    split_assignment = pd.concat(
        [
            train_p,
            val_p,
            test_p,
        ]
    )[
        [
            "patient_id",
            "split",
        ]
    ]

    # ---------------------------------------------------------
    # Apply patient split to ALL images
    # ---------------------------------------------------------

    result = merged.merge(
        split_assignment,
        on="patient_id",
        how="inner",
    )

    return result


def report_split(result):

    print(
        "\n" + "=" * 70
    )

    print(
        "PATIENT-LEVEL SPLIT SUMMARY"
    )

    print(
        "=" * 70
    )

    total_patients = (
        result["patient_id"]
        .nunique()
    )

    total_images = len(result)

    print(
        f"\nTotal patients: {total_patients}"
    )

    print(
        f"Total images: {total_images}"
    )

    # ---------------------------------------------------------
    # Report each split
    # ---------------------------------------------------------

    for split_name in [
        "train",
        "val",
        "test",
    ]:

        subset = result[
            result["split"] == split_name
        ]

        n_patients = (
            subset["patient_id"]
            .nunique()
        )

        n_images = len(subset)

        patient_percentage = (
            n_patients /
            total_patients *
            100
        )

        print(
            f"\n{split_name.upper()}: "
            f"{n_patients} patients "
            f"({patient_percentage:.1f}%), "
            f"{n_images} images"
        )

        print(
            "\nClass distribution:"
        )

        print(
            subset["class"]
            .value_counts()
            .to_string()
        )

        missing_classes = (
            set(result["class"].unique())
            -
            set(subset["class"].unique())
        )

        if missing_classes:

            print(
                f"\n[WARNING] Missing classes: "
                f"{missing_classes}"
            )

        else:

            print(
                "\n[OK] All six classes "
                "are represented."
            )

    # ---------------------------------------------------------
    # Leakage check
    # ---------------------------------------------------------

    patient_split_counts = (
        result
        .groupby("patient_id")["split"]
        .nunique()
    )

    leaked = patient_split_counts[
        patient_split_counts > 1
    ]

    print(
        "\n" + "-" * 70
    )

    print(
        "LEAKAGE CHECK"
    )

    print(
        "-" * 70
    )

    print(
        "Patients appearing in "
        f">1 split: {len(leaked)}"
    )

    if len(leaked) > 0:

        print(
            "[ERROR] DATA LEAKAGE DETECTED!"
        )

        raise RuntimeError(
            "Patient leakage detected. "
            "Do not train the model."
        )

    else:

        print(
            "[OK] No patient appears "
            "in more than one split."
        )


def main():

    parser = argparse.ArgumentParser(
        description=(
            "Patient-level SkinDisNet "
            "train/validation/test split"
        )
    )

    parser.add_argument(
        "--data-root",
        type=str,
        default="../data/raw/SkinDisNet",
    )

    parser.add_argument(
        "--output",
        type=str,
        default="../data/splits",
    )

    args = parser.parse_args()

    data_root = (
        Path(args.data_root)
        .resolve()
    )

    output_dir = (
        Path(args.output)
        .resolve()
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(
        "=" * 70
    )

    print(
        "VitaHealth Phase 3 - "
        "Patient-Level Dataset Split"
    )

    print(
        "=" * 70
    )

    print(
        f"\nData root: {data_root}"
    )

    # ---------------------------------------------------------
    # Build image/patient table
    # ---------------------------------------------------------

    merged = build_patient_class_table(
        data_root
    )

    # ---------------------------------------------------------
    # Split patients
    # ---------------------------------------------------------

    print(
        "\nPerforming patient-level "
        "train/validation/test split..."
    )

    result = patient_level_split(
        merged
    )

    # ---------------------------------------------------------
    # Report results
    # ---------------------------------------------------------

    report_split(result)

    # ---------------------------------------------------------
    # Save CSV files
    # ---------------------------------------------------------

    print(
        "\nWriting split CSV files..."
    )

    for split_name in [
        "train",
        "val",
        "test",
    ]:

        subset = result[
            result["split"] == split_name
        ][
            [
                "patient_id",
                "filename",
                "class",
                "split",
                "path",
            ]
        ]

        out_path = (
            output_dir /
            f"{split_name}.csv"
        )

        subset.to_csv(
            out_path,
            index=False,
        )

        print(
            f"  {split_name}.csv -> "
            f"{len(subset)} images"
        )

    print(
        "\n" + "=" * 70
    )

    print(
        "PHASE 3 PATIENT SPLIT COMPLETE"
    )

    print(
        "=" * 70
    )


if __name__ == "__main__":
    main()