VitaHealth

AI-Based Skin Health Awareness & Preliminary Skin-Condition Classification System

VitaHealth is an academic project that explores how artificial intelligence can be used to support skin-health awareness through image classification.

The project is designed as a web application with a React frontend and a FastAPI backend. The system can accept a skin image, send it to the backend, and return a preliminary AI-based classification with educational information.

Important: VitaHealth is an academic decision-support/awareness project. Its predictions are preliminary and must not be treated as a medical diagnosis.

Project Overview

VitaHealth aims to provide a simple workflow for users:

Upload a skin image or capture an image using a webcam.

Send the image to the VitaHealth backend.

Process the image using the trained AI model.

Display the predicted skin-condition category.

Provide clear, educational information about the predicted category.

The current image-classification system uses a 22-class skin-disease dataset and a lightweight MobileNetV3-Small model.

Key Features

AI Skin Image Analysis

Upload a skin image and receive a preliminary classification from the trained image-classification model.

Webcam Capture

Use the browser camera to capture a skin image and send the captured frame for analysis.

Skin Condition Library

Browse supported skin-condition categories and read information about:

What the condition is

Possible causes

Common symptoms

How it occurs or spreads

Commonly affected areas

Unknown / Normal Classification

The system includes an Unknown/Normal category for images that do not match a supported condition strongly enough for a specific classification.

Educational Guidance

Depending on the available backend information, VitaHealth can display general lifestyle, diet, and nutritional guidance.

Technology Stack

Layer

Technology

Frontend

React

Backend

FastAPI

Machine Learning

PyTorch

Model

MobileNetV3-Small

Language

Python 3.11

Runtime

Node.js 20 LTS

Version Control

Git

Project Structure

VitaHealth/
│
├── backend/
│   └── app/
│       ├── main.py
│       └── core/
│           └── config.py
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── api/
│           └── client.js
│
├── ml/
│   ├── data/
│   │   └── raw/
│   │       └── SkinDisease22/       # Local dataset - not committed to Git
│   │
│   ├── models/
│   │   └── skin_classifier_22_mobilenet.pth
│   │
│   └── src/
│       ├── api.py
│       ├── classes22.py
│       ├── inspect_22_dataset.py
│       ├── predict.py
│       └── train_skin22.py
│
├── .gitignore
└── README.md

Requirements

Make sure the following are installed:

Python 3.11

Node.js 20 LTS

Git

Backend Setup

Open a terminal and move to the backend directory:

cd backend

Create a virtual environment:

Windows

python -m venv venv
venv\Scripts\Activate.ps1

macOS / Linux

python3 -m venv venv
source venv/bin/activate

Install the backend dependencies:

pip install -r requirements.txt

Start the FastAPI server:

uvicorn app.main:app --reload --port 8000

The backend will be available at:

http://localhost:8000

Verify the Backend

Health check:

http://localhost:8000/health

Swagger API documentation:

http://localhost:8000/docs

Frontend Setup

Open a new terminal and move to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Open:

http://localhost:5173

Running VitaHealth Locally

For normal local development, both the backend and frontend should be running.

Terminal 1 — Backend

cd backend
venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

Terminal 2 — Frontend

cd frontend
npm run dev

Then open the frontend in your browser:

http://localhost:5173

Machine Learning Pipeline

The current ML workflow consists of:

Skin Image
    ↓
Image Preprocessing
    ↓
MobileNetV3-Small
    ↓
22-Class Classification
    ↓
Prediction
    ↓
Educational Information

The trained model is designed for image classification across the supported dataset categories.

Current Dataset

The current project uses the SkinDisease22 dataset.

The dataset is kept locally and is intentionally excluded from Git commits because it contains a large number of image files.

Current Model

Model: MobileNetV3-Small
Input Size: 224 × 224
Classes: 22
Framework: PyTorch

Supported Image Categories

The current model contains 22 categories:

1. Acne
2. Actinic Keratosis
3. Benign Tumors
4. Bullous
5. Candidiasis
6. Drug Eruption
7. Eczema
8. Infestations / Bites
9. Lichen
10. Lupus
11. Moles
12. Psoriasis
13. Rosacea
14. Seborrheic Keratoses
15. Skin Cancer
16. Sun / Sunlight Damage
17. Tinea
18. Unknown / Normal
19. Vascular Tumors
20. Vasculitis
21. Vitiligo
22. Warts

API

The FastAPI service exposes endpoints for the application.

Health Check

GET /health

Used to verify that the backend is available.

Prediction

POST /predict

Accepts an image file and returns the model's preliminary classification and related response data.

Git & Repository Guidelines

Large or local-only files should not be committed to GitHub.

The project .gitignore excludes items such as:

# Python
__pycache__/
*.pyc
venv/
.venv/
.env

# Node
node_modules/
dist/

# Models
*.pth

# Dataset
ml/data/

# OS
.DS_Store

This keeps the GitHub repository focused on source code and project configuration instead of large datasets, generated files, and local environments.

Development Notes

The project is being developed incrementally. Current work includes:

React frontend

FastAPI backend

22-class skin image classification

MobileNetV3-Small model

Webcam image capture

Skin-condition information library

General educational and nutritional guidance

Limitations

VitaHealth has important limitations:

A skin image alone cannot establish a final medical diagnosis.

The model can make incorrect predictions.

The Unknown / Normal result does not guarantee that a person has no medical condition.

Nutritional information is intended as general educational guidance and does not establish a vitamin deficiency.

Users should consult a qualified healthcare professional for diagnosis and treatment.

Future Enhancements

Planned improvements may include:

Near-real-time webcam analysis

Improved model accuracy

Better image-quality validation

Expanded educational content

Improved deployment and hosting

Additional model evaluation and testing

Academic Project

Project: VitaHealth
Domain: Artificial Intelligence & Data Science
Application Area: Skin Health Awareness & Image Classification

This project is developed for academic and learning purposes.