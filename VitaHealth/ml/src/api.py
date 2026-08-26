"""
VitaHealth - FastAPI Skin Condition Prediction API
"""

import os
import io

import torch
import torch.nn as nn

from PIL import Image

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from torchvision import models, transforms

from src.dataset import CLASS_NAMES
from src.recommendations import get_recommendation
from src.vitamin_recommendations import get_vitamin_recommendation


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
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="VitaHealth Skin Condition API",
    description="AI-based skin condition image classification API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

    return model


model = load_model()


# =========================================================
# HOME ENDPOINT
# =========================================================

@app.get("/")
def home():

    return {
        "message": "VitaHealth Skin Condition API is running",
        "status": "OK"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "device": str(DEVICE),
        "model": "MobileNetV3-Small"
    }


# =========================================================
# PREDICT ENDPOINT
# =========================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # -----------------------------------------------------
    # Check file type
    # -----------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/jpg"
    }

    if file.content_type not in allowed_types:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Please upload a JPG or PNG image."
            }
        )


    # -----------------------------------------------------
    # Read image
    # -----------------------------------------------------

    image_bytes = await file.read()

    try:

        image = Image.open(
            io.BytesIO(image_bytes)
        ).convert("RGB")

    except Exception:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Invalid image file."
            }
        )


    # -----------------------------------------------------
    # Preprocess
    # -----------------------------------------------------

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
    # Prediction
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


    # -----------------------------------------------------
    # All probabilities
    # -----------------------------------------------------

    probabilities_dict = {}

    for i, class_name in enumerate(
        CLASS_NAMES
    ):

        probabilities_dict[class_name] = round(
            probabilities[0][i].item() * 100,
            2
        )


    # =====================================================
    # SKIN CONDITION RECOMMENDATION
    # =====================================================

    recommendation = get_recommendation(
        predicted_class
    )


    # =====================================================
    # ONE NUTRITIONAL CONSIDERATION
    # =====================================================

    vitamin_recommendation = get_vitamin_recommendation(
        predicted_class
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {

        "prediction": predicted_class,

        "confidence": round(
            confidence * 100,
            2
        ),

        "probabilities": probabilities_dict,

        "recommendations": {

            "diet": recommendation["diet"],

            "lifestyle": recommendation["lifestyle"],

            "medical_note": recommendation["medical_note"]

        },

        "vitamin_recommendation": vitamin_recommendation,

        "model": "MobileNetV3-Small",

        "message": (
            "This is an AI prediction and "
            "not a medical diagnosis. "
            "The nutritional information is "
            "general guidance and does not "
            "confirm a vitamin deficiency."
        )
    }