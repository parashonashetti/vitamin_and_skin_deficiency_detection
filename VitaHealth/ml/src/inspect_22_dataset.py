from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_ROOT = Path("data/raw/SkinDisease22")


# ============================================================
# IMAGE EXTENSIONS
# ============================================================

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


# ============================================================
# COUNT IMAGES
# ============================================================

def count_images(folder):
    return sum(
        1
        for path in folder.rglob("*")
        if path.is_file()
        and path.suffix.lower() in IMAGE_EXTENSIONS
    )


# ============================================================
# MAIN
# ============================================================

def main():

    if not DATASET_ROOT.exists():
        print("Dataset folder not found:")
        print(DATASET_ROOT)
        return

    print("=" * 70)
    print("VitaHealth - SkinDisease22 Dataset Inspection")
    print("=" * 70)

    for split in ["train", "test"]:

        split_path = DATASET_ROOT / split

        print(f"\n{split.upper()} DATASET")
        print("-" * 70)

        total = 0

        class_folders = sorted(
            [
                folder
                for folder in split_path.iterdir()
                if folder.is_dir()
            ],
            key=lambda x: x.name.lower(),
        )

        for folder in class_folders:

            count = count_images(folder)
            total += count

            print(
                f"{folder.name:<25} : {count}"
            )

        print("-" * 70)
        print(f"Total {split} images: {total}")


if __name__ == "__main__":
    main()