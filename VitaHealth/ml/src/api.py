import io
import os

import torch
import torch.nn as nn
from PIL import Image

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from torchvision import models, transforms

from src.recommendations import get_recommendation
from src.vitamin_recommendations import get_vitamin_recommendation


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    "models",
    "skin_classifier_22_mobilenet.pth",
)

IMAGE_SIZE = 224

# This is only an uncertainty filter.
# It does NOT prove that an image is healthy.
CONFIDENCE_THRESHOLD = 0.50

UNKNOWN_NORMAL_CLASS = "Unknown_Normal"


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# IMAGE PREPROCESSING
# ============================================================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ============================================================
# LOAD 22-CLASS MODEL
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
)

if not isinstance(checkpoint, dict):
    raise RuntimeError(
        "The 22-class model checkpoint is not in the expected format."
    )

if "model_state_dict" not in checkpoint:
    raise RuntimeError(
        "The checkpoint does not contain model_state_dict."
    )

if "class_names" not in checkpoint:
    raise RuntimeError(
        "The checkpoint does not contain class_names."
    )

CLASS_NAMES = checkpoint["class_names"]

if len(CLASS_NAMES) != 22:
    raise RuntimeError(
        f"Expected 22 classes, found {len(CLASS_NAMES)}."
    )

model = models.mobilenet_v3_small(
    weights=None
)

model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    len(CLASS_NAMES),
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)
model.eval()


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="VitaHealth AI API",
    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_safe_recommendation(predicted_class):
    # Keep existing recommendations for supported classes.
    # New classes receive generic guidance instead of crashing.
    try:
        return get_recommendation(predicted_class)
    except (KeyError, ValueError):
        return {
            "diet": [
                "Maintain a balanced diet with adequate fruits, vegetables, protein, and water."
            ],
            "lifestyle": [
                "Keep the affected area clean and avoid unnecessary scratching or irritation."
            ],
            "medical_note": (
                "This result is for preliminary educational support. "
                "Consult a qualified healthcare professional for diagnosis and treatment."
            ),
        }


def get_safe_vitamin_recommendation(predicted_class):
    # Only use a nutrient mapping when one already exists.
    try:
        return get_vitamin_recommendation(predicted_class)
    except (KeyError, ValueError):
        return None


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "message": "VitaHealth AI API is running.",
        "model": "MobileNetV3-Small",
        "classes": 22,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "MobileNetV3-Small",
        "classes": 22,
        "device": str(DEVICE),
    }


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        return JSONResponse(
            status_code=400,
            content={
                "error": (
                    "Please upload a JPG, JPEG, PNG, or WEBP image."
                )
            },
        )

    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    try:
        image_bytes = await file.read()

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception:
        return JSONResponse(
            status_code=400,
            content={
                "error": "The uploaded file is not a valid image."
            },
        )

    # --------------------------------------------------------
    # PREPROCESS
    # --------------------------------------------------------

    input_tensor = transform(
        image
    ).unsqueeze(0).to(DEVICE)

    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    with torch.no_grad():
        outputs = model(
            input_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

    confidence, predicted_index = torch.max(
        probabilities,
        dim=1
    )

    confidence_value = confidence.item()
    predicted_index = predicted_index.item()

    predicted_class = CLASS_NAMES[
        predicted_index
    ]

    # --------------------------------------------------------
    # NORMAL / UNKNOWN HANDLING
    # --------------------------------------------------------

    if predicted_class == UNKNOWN_NORMAL_CLASS:
        return {
            "prediction": "Unknown_Normal",
            "display_prediction": (
                "No visible supported skin condition detected."
            ),
            "is_normal_or_unknown": True,
            "confidence": round(
                confidence_value,
                4
            ),
            "model": "MobileNetV3-Small",
            "message": (
                "The model classified this image as Unknown/Normal. "
                "This does not rule out a medical condition and is not a diagnosis."
            ),
        }

    # --------------------------------------------------------
    # UNCERTAINTY FILTER
    # --------------------------------------------------------

    if confidence_value < CONFIDENCE_THRESHOLD:
        return JSONResponse(
            status_code=422,
            content={
                "error": (
                    "Unable to make a reliable prediction from this image."
                ),
                "message": (
                    "Please upload a clear image of the affected skin area."
                ),
                "confidence": round(
                    confidence_value,
                    4
                ),
                "threshold": CONFIDENCE_THRESHOLD,
                "is_normal_or_unknown": False,
            },
        )

    # --------------------------------------------------------
    # CLASS PROBABILITIES
    # --------------------------------------------------------

    probability_dict = {
        CLASS_NAMES[i]: round(
            probabilities[0][i].item(),
            4,
        )
        for i in range(len(CLASS_NAMES))
    }

    # --------------------------------------------------------
    # RECOMMENDATIONS
    # --------------------------------------------------------

    recommendation = get_safe_recommendation(
        predicted_class
    )

    vitamin_recommendation = (
        get_safe_vitamin_recommendation(
            predicted_class
        )
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "prediction": predicted_class,
        "display_prediction": predicted_class,
        "is_normal_or_unknown": False,
        "confidence": round(
            confidence_value,
            4,
        ),
        "probabilities": probability_dict,
        "recommendations": recommendation,
        "vitamin_recommendation": vitamin_recommendation,
        "model": "MobileNetV3-Small",
        "message": (
            "This is an AI-based preliminary prediction and not a medical diagnosis."
        ),
    }
