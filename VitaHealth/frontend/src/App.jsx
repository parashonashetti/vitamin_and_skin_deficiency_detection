import { useEffect, useRef, useState } from "react";

// ============================================================
// SKIN CONDITION INFORMATION
// ============================================================

const skinConditions = {
  Acne: {
    short: "A common skin condition that can cause pimples, blackheads, and whiteheads.",
    what: "Acne is a common skin condition involving blocked hair follicles and inflammation.",
    causes: "It can be associated with excess oil, blocked pores, skin bacteria, hormones, and other factors.",
    symptoms: "Common signs include pimples, blackheads, whiteheads, and inflamed spots.",
    occurrence: "Acne is not contagious.",
    areas: "It commonly affects the face, chest, back, and shoulders.",
  },

  Actinic_Keratosis: {
    short: "A rough, scaly skin change that commonly develops after long-term sun exposure.",
    what: "Actinic keratosis is a rough or scaly area of skin associated with cumulative ultraviolet exposure.",
    causes: "Long-term exposure to ultraviolet radiation is a major contributing factor.",
    symptoms: "A rough, dry, scaly, or crust-like patch may appear on sun-exposed skin.",
    occurrence: "It is not contagious.",
    areas: "It commonly occurs on sun-exposed areas such as the face, scalp, ears, hands, and forearms.",
  },

  Benign_tumors: {
    short: "Non-cancerous growths that can appear in or on the skin.",
    what: "Benign tumors are growths that are not cancerous.",
    causes: "Different benign growths can have different causes, including normal cell growth and inherited or acquired changes.",
    symptoms: "Appearance varies widely depending on the type of growth.",
    occurrence: "Benign tumors are not contagious.",
    areas: "They can occur on many parts of the skin and underlying tissue.",
  },

  Bullous: {
    short: "A category of skin conditions characterized by blister-like lesions.",
    what: "Bullous conditions are disorders in which fluid-filled blisters or blistering lesions can develop.",
    causes: "Causes vary and may include immune-related, inherited, infectious, or other factors.",
    symptoms: "Blisters, fluid-filled lesions, redness, irritation, or tenderness may occur.",
    occurrence: "Whether a specific bullous condition is contagious depends on its cause.",
    areas: "Blistering can occur on different parts of the body.",
  },

  Candidiasis: {
    short: "A fungal infection caused by Candida yeast.",
    what: "Cutaneous candidiasis is a fungal infection caused by Candida yeast affecting the skin.",
    causes: "Warm, moist skin areas can encourage Candida overgrowth.",
    symptoms: "Redness, irritation, itching, and moist or inflamed patches can occur.",
    occurrence: "It is usually related to yeast overgrowth rather than person-to-person spread.",
    areas: "It commonly affects warm, moist areas such as skin folds.",
  },

  DrugEruption: {
    short: "A skin reaction that can occur after taking or being exposed to a medicine.",
    what: "A drug eruption is a skin reaction associated with a medication.",
    causes: "It can happen when the body reacts to a particular medicine.",
    symptoms: "Rashes, redness, itching, swelling, or other skin changes may occur.",
    occurrence: "It is not generally contagious.",
    areas: "It can affect different parts of the body depending on the reaction.",
  },

  Eczema: {
    short: "A group of inflammatory skin conditions that can cause itchy, dry, and irritated skin.",
    what: "Eczema is a general term for several inflammatory skin conditions.",
    causes: "Possible factors include genetics, skin-barrier problems, immune responses, and environmental triggers.",
    symptoms: "Itching, dryness, redness, irritation, and sometimes scaling can occur.",
    occurrence: "Eczema is not generally contagious.",
    areas: "It can occur on the face, hands, arms, legs, and other areas.",
  },

  Infestations_Bites: {
    short: "A dataset category covering skin problems caused by infestations or bites.",
    what: "This category groups skin findings associated with insects, mites, or other external bites or infestations.",
    causes: "The cause depends on the specific insect, mite, or other external organism involved.",
    symptoms: "Possible signs include itchy bumps, redness, irritation, or localized swelling.",
    occurrence: "Spread and contagiousness depend on the specific underlying cause.",
    areas: "Affected areas depend on the type of bite or infestation.",
  },

  Lichen: {
    short: "A category of inflammatory skin disorders that can produce patches or plaques.",
    what: "Lichen is a dataset category containing inflammatory skin conditions with characteristic patches or plaques.",
    causes: "Causes vary by the specific condition represented in this category.",
    symptoms: "Possible signs include itching, discoloration, scaling, or thickened areas.",
    occurrence: "Contagiousness depends on the specific condition.",
    areas: "Different parts of the skin may be affected.",
  },

  Lupus: {
    short: "A category containing skin findings associated with lupus-related disease.",
    what: "Lupus is an autoimmune disease that can involve the skin as well as other body systems.",
    causes: "It is related to abnormal immune-system activity and can involve genetic and environmental factors.",
    symptoms: "Skin findings vary and may include rashes, redness, or sensitivity to sunlight.",
    occurrence: "Lupus is not contagious.",
    areas: "Skin findings can occur on different parts of the body.",
  },

  Moles: {
    short: "Common pigmented spots or growths on the skin.",
    what: "Moles are common skin growths formed by groups of pigment-producing cells.",
    causes: "They can develop naturally and may be influenced by genetics and sun exposure.",
    symptoms: "They are often small, pigmented spots or raised areas.",
    occurrence: "Moles are not contagious.",
    areas: "They can appear almost anywhere on the skin.",
  },

  Psoriasis: {
    short: "A long-term inflammatory skin condition that can cause well-defined, scaly patches.",
    what: "Psoriasis is an inflammatory skin condition in which skin cells build up too quickly.",
    causes: "It is associated with immune-system activity and genetic and environmental factors.",
    symptoms: "Common signs include raised, red or discolored patches with scaling and itching.",
    occurrence: "Psoriasis is not contagious.",
    areas: "It can affect the scalp, elbows, knees, trunk, and other areas.",
  },

  Rosacea: {
    short: "A chronic skin condition that commonly causes facial redness and flushing.",
    what: "Rosacea is a chronic inflammatory skin condition that mainly affects the face.",
    causes: "Triggers can vary and may include heat, sunlight, spicy foods, alcohol, or stress.",
    symptoms: "Facial redness, flushing, visible small blood vessels, and bumps may occur.",
    occurrence: "Rosacea is not contagious.",
    areas: "It mainly affects the central face, including the cheeks and nose.",
  },

  Seborrh_Keratoses: {
    short: "Common non-cancerous growths that can look waxy, rough, or stuck onto the skin.",
    what: "Seborrheic keratoses are common benign skin growths.",
    causes: "The exact cause is not fully understood, and they become more common with age.",
    symptoms: "They may appear as rough, waxy, or raised brown, black, or tan growths.",
    occurrence: "They are not contagious.",
    areas: "They can occur on many areas of the body, often on the trunk and head.",
  },

  SkinCancer: {
    short: "A category covering cancerous skin lesions.",
    what: "Skin cancer is a group of cancers that can develop from cells in the skin.",
    causes: "Major risk factors can include ultraviolet radiation, skin type, genetics, and other exposures.",
    symptoms: "Warning signs vary and can include a changing spot, unusual growth, sore, or non-healing lesion.",
    occurrence: "Skin cancer is not contagious.",
    areas: "It can occur on any area of skin, including sun-exposed areas.",
  },

  Sun_Sunlight_Damage: {
    short: "Skin changes associated with repeated or excessive sun exposure.",
    what: "This category covers visible skin changes associated with sun or ultraviolet exposure.",
    causes: "Repeated exposure to ultraviolet radiation can contribute to skin damage.",
    symptoms: "Changes can include uneven pigmentation, dryness, rough texture, or other visible changes.",
    occurrence: "It is not contagious.",
    areas: "It mainly affects areas that receive repeated sun exposure.",
  },

  Tinea: {
    short: "A group of fungal skin infections commonly known as ringworm.",
    what: "Tinea refers to fungal infections of the skin caused by dermatophyte fungi.",
    causes: "It is caused by dermatophyte fungi.",
    symptoms: "Symptoms can include itchy, scaly patches or ring-shaped rashes.",
    occurrence: "It can spread through direct contact and contaminated items.",
    areas: "Different tinea types can affect the skin, feet, groin, scalp, or nails.",
  },

  Unknown_Normal: {
    short: "An image category used for normal or otherwise unsupported skin appearances.",
    what: "The model uses this category when the image matches its Unknown/Normal class rather than one of the supported condition categories.",
    causes: "This prediction is a model classification, not a determination of the medical cause of a skin change.",
    symptoms: "No specific supported condition is identified by the model for this image.",
    occurrence: "This category itself does not represent a contagious disease.",
    areas: "No specific affected area is assigned by this category.",
  },

  Vascular_Tumors: {
    short: "A category covering growths involving blood vessels in or under the skin.",
    what: "Vascular tumors are growths related to cells forming or lining blood vessels.",
    causes: "Causes vary depending on the specific type of vascular growth.",
    symptoms: "They may appear as differently colored, raised, or otherwise noticeable skin lesions.",
    occurrence: "Most vascular growths are not contagious.",
    areas: "They can occur on different parts of the skin or underlying tissue.",
  },

  Vasculitis: {
    short: "A group of conditions involving inflammation of blood vessels.",
    what: "Vasculitis refers to inflammation affecting blood vessels and can produce skin findings.",
    causes: "Causes vary and may include immune reactions, infections, medicines, or other conditions.",
    symptoms: "Skin findings can include red or purple spots, patches, swelling, or other changes.",
    occurrence: "Vasculitis itself is not generally contagious.",
    areas: "Skin findings can occur on different areas, commonly the lower legs.",
  },

  Vitiligo: {
    short: "A condition that causes loss of pigment in patches of skin.",
    what: "Vitiligo is a condition in which areas of skin lose pigment, producing lighter patches.",
    causes: "It is commonly associated with an autoimmune process affecting pigment-producing cells.",
    symptoms: "The main visible sign is well-defined lighter or depigmented patches.",
    occurrence: "Vitiligo is not contagious.",
    areas: "It can affect many areas, including the face, hands, arms, and around body openings.",
  },

  Warts: {
    short: "Small skin growths commonly caused by human papillomavirus (HPV).",
    what: "Warts are common skin growths caused by certain types of human papillomavirus.",
    causes: "They are caused by HPV infection of the skin.",
    symptoms: "Warts can appear as rough or raised skin growths.",
    occurrence: "They can spread through direct contact or contact with contaminated surfaces.",
    areas: "They can occur on the hands, feet, face, and other areas.",
  },
};

const normalizeConditionName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replaceAll("/", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const conditionAliases = {
  "actinic keratosis": "Actinic_Keratosis",
  "benign tumors": "Benign_tumors",
  "drug eruption": "DrugEruption",
  "infestations bites": "Infestations_Bites",
  "seborrheic keratoses": "Seborrh_Keratoses",
  "skin cancer": "SkinCancer",
  "sun sunlight damage": "Sun_Sunlight_Damage",
  "unknown normal": "Unknown_Normal",
  "vascular tumors": "Vascular_Tumors",
};

const getConditionKey = (prediction) => {
  if (!prediction) return null;

  if (skinConditions[prediction]) {
    return prediction;
  }

  const normalized = normalizeConditionName(prediction);

  const aliasMatch = Object.entries(conditionAliases).find(
    ([alias]) => normalizeConditionName(alias) === normalized
  );

  if (aliasMatch) {
    return aliasMatch[1];
  }

  const directMatch = Object.keys(skinConditions).find(
    (key) => normalizeConditionName(key) === normalized
  );

  return directMatch || null;
};

const conditionDisplayNames = {
  Acne: "Acne",
  Actinic_Keratosis: "Actinic Keratosis",
  Benign_tumors: "Benign Tumors",
  Bullous: "Bullous Skin Conditions",
  Candidiasis: "Candidiasis",
  DrugEruption: "Drug Eruption",
  Eczema: "Eczema",
  Infestations_Bites: "Infestations / Bites",
  Lichen: "Lichen",
  Lupus: "Lupus",
  Moles: "Moles",
  Psoriasis: "Psoriasis",
  Rosacea: "Rosacea",
  Seborrh_Keratoses: "Seborrheic Keratoses",
  SkinCancer: "Skin Cancer",
  Sun_Sunlight_Damage: "Sun / Sunlight Damage",
  Tinea: "Tinea",
  Unknown_Normal: "Unknown / Normal",
  Vascular_Tumors: "Vascular Tumors",
  Vasculitis: "Vasculitis",
  Vitiligo: "Vitiligo",
  Warts: "Warts",
};

const getDisplayConditionName = (prediction) => {
  const key = getConditionKey(prediction);
  return conditionDisplayNames[key] || prediction || "Unknown result";
};

const getCleanItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};



// ============================================================
// MAIN APP
// ============================================================

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activePage, setActivePage] = useState("home");
  const [selectedCondition, setSelectedCondition] = useState(null);

  // ==========================================================
  // WEBCAM
  // ==========================================================

  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access the camera.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !cameraActive) {
      setError("Please start the camera first.");
      return;
    }

    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError("The camera is still starting. Please try again in a moment.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Unable to capture the camera image.");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Unable to capture the camera image.");
        return;
      }

      const capturedFile = new File(
        [blob],
        "webcam-image.jpg",
        { type: "image/jpeg" }
      );

      setImage(capturedFile);
      setPreview(URL.createObjectURL(blob));
      setResult(null);
      setError("");
    }, "image/jpeg", 0.9);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);


  // ==========================================================
  // IMAGE SELECTION
  // ==========================================================

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
    setActivePage("analyze");
  };


  // ==========================================================
  // IMAGE ANALYSIS
  // ==========================================================

  const analyzeImage = async () => {
    if (!image) {
      setError("Please select a skin image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", image);

      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            data.error ||
            "Prediction failed."
        );
      }

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the VitaHealth AI server. " +
          "Please make sure FastAPI is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goTo = (page) => {
    setActivePage(page);
    setSelectedCondition(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ==========================================================
  // HOME PAGE
  // ==========================================================

  const renderHome = () => (
    <>
      {/* HERO */}

      <section className="vh-hero" style={styles.hero}>
        <div className="vh-hero-content" style={styles.heroContent}>

          <div style={styles.heroText}>

            <p style={styles.eyebrow}>
              AI-POWERED SKIN HEALTH
            </p>

            <h1 className="vh-hero-title" style={styles.heroTitle}>
              Understand your skin.
              <br />

              <span style={styles.heroHighlight}>
                Take better care.
              </span>
            </h1>

            <p style={styles.heroDescription}>
              VitaHealth uses artificial intelligence
              to analyze a skin image and provide
              preliminary information about possible
              skin conditions.
            </p>

            <div className="vh-hero-buttons" style={styles.heroButtons}>

              <button
                style={styles.primaryButton}
                onClick={() => goTo("analyze")}
              >
                Analyze Skin
              </button>

              <button
                style={styles.secondaryButton}
                onClick={() => goTo("conditions")}
              >
                Explore Conditions
              </button>

            </div>

          </div>


          <div className="vh-card" style={styles.heroCard}>

            <div style={styles.heroIcon}>
              🩺
            </div>

            <h3 style={styles.heroCardTitle}>
              AI Skin Analysis
            </h3>

            <p style={styles.heroCardText}>
              Upload a skin image and receive a preliminary skin-condition
              classification with clear, educational information.
            </p>

            <div style={styles.heroTrustRow}>
              <span style={styles.heroTrustBadge}>✓ 22 classes</span>
              <span style={styles.heroTrustBadge}>✓ Webcam capture</span>
              <span style={styles.heroTrustBadge}>✓ No diagnosis</span>
            </div>

            <div style={styles.heroSteps}>

              <div style={styles.step}>

                <span style={styles.stepNumber}>
                  1
                </span>

                Upload image

              </div>


              <div style={styles.step}>

                <span style={styles.stepNumber}>
                  2
                </span>

                AI analysis

              </div>


              <div style={styles.step}>

                <span style={styles.stepNumber}>
                  3
                </span>

                Get information

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* FEATURES */}

      <section className="vh-feature-section" style={styles.featureSection}>

        <div style={styles.sectionHeading}>

          <p style={styles.eyebrow}>
            VITAHEALTH
          </p>

          <h2 style={styles.sectionTitle}>
            Simple. Informative. Accessible.
          </h2>

          <p style={styles.sectionSubtitle}>
            Explore the main features of VitaHealth.
          </p>

        </div>


        <div className="vh-feature-grid" style={styles.featureGrid}>

          <div className="vh-card" style={styles.featureCard}>

            <div style={styles.featureIcon}>
              🔍
            </div>

            <h3>
              Skin Analysis
            </h3>

            <p style={styles.featureDescription}>
              Upload a skin image and let the
              trained AI model provide a preliminary
              prediction.
            </p>

            <button
              style={styles.linkButton}
              onClick={() => goTo("analyze")}
            >
              Analyze now →
            </button>

          </div>


          <div className="vh-card" style={styles.featureCard}>

            <div style={styles.featureIcon}>
              📚
            </div>

            <h3>
              Skin Conditions
            </h3>

            <p style={styles.featureDescription}>
              Learn about common skin conditions,
              their causes, symptoms, and occurrence.
            </p>

            <button
              style={styles.linkButton}
              onClick={() => goTo("conditions")}
            >
              Learn more →
            </button>

          </div>


          <div className="vh-card" style={styles.featureCard}>

            <div style={styles.featureIcon}>
              📷
            </div>

            <h3>
              Webcam Detection
            </h3>

            <p style={styles.featureDescription}>
              Capture a skin image with your webcam and analyze it using the VitaHealth AI model.
            </p>

            <button
              style={styles.linkButton}
              onClick={() => goTo("analyze")}
            >
              Open Analyze
            </button>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section className="vh-info-section" style={styles.infoSection}>

        {/* LEFT COLUMN */}

        <div style={styles.infoHeading}>

          <p style={styles.eyebrow}>
            HOW IT WORKS
          </p>

          <h2 style={styles.sectionTitleLeft}>
            From image to information
          </h2>

          <p style={styles.infoIntro}>
            VitaHealth follows a simple process to
            turn a skin image into useful preliminary
            information.
          </p>

        </div>


        {/* RIGHT COLUMN */}

        <div style={styles.workflow}>

          <div style={styles.workflowItem}>

            <span style={styles.workflowNumber}>
              01
            </span>

            <div>

              <h3 style={styles.workflowHeading}>
                Upload
              </h3>

              <p style={styles.workflowDescription}>
                Select a clear image of the affected
                skin area.
              </p>

            </div>

          </div>


          <div style={styles.workflowItem}>

            <span style={styles.workflowNumber}>
              02
            </span>

            <div>

              <h3 style={styles.workflowHeading}>
                Analyze
              </h3>

              <p style={styles.workflowDescription}>
                The trained MobileNetV3-Small model
                analyzes the image.
              </p>

            </div>

          </div>


          <div style={styles.workflowItem}>

            <span style={styles.workflowNumber}>
              03
            </span>

            <div>

              <h3 style={styles.workflowHeading}>
                Understand
              </h3>

              <p style={styles.workflowDescription}>
                View the predicted condition and
                related educational information.
              </p>

            </div>

          </div>

        </div>

      </section>
    </>
  );


  // ==========================================================
  // ANALYZE PAGE
  // ==========================================================

  const renderAnalyze = () => (
    <section className="vh-page-section" style={styles.pageSection}>

      <div className="vh-analyze-heading" style={styles.pageHeading}>

        <div>
          <span className="vh-page-tag">✦ AI-assisted skin analysis</span>

          <p style={{ ...styles.eyebrow, marginTop: "15px" }}>
            VITAHEALTH ANALYZER
          </p>

          <h2 className="vh-page-title" style={styles.pageTitle}>
            Analyze Your Skin
          </h2>

          <p style={styles.pageDescription}>
            Upload a clear skin image or capture one with your webcam.
            VitaHealth will provide a preliminary image-classification result
            with an easy-to-understand explanation.
          </p>
        </div>

        <div style={styles.analyzeMeta}>
          <span className="vh-step-pill">
            <span className="vh-step-dot"></span>
            Image input
          </span>
          <span style={styles.metaArrow}>→</span>
          <span className="vh-step-pill">
            <span className="vh-step-dot"></span>
            AI analysis
          </span>
          <span style={styles.metaArrow}>→</span>
          <span className="vh-step-pill">
            <span className="vh-step-dot"></span>
            Explanation
          </span>
        </div>

      </div>


      <div className="vh-analysis-grid" style={styles.analysisGrid}>

        {/* UPLOAD CARD */}

        <div className="vh-card" style={styles.analysisCard}>

          <p className="vh-section-label">Step 01 · Image</p>
          <h3 style={styles.cardTitle}>
            Upload an Image
          </h3>

          <p style={styles.muted}>
            Supported formats: JPG, JPEG, PNG
          </p>


          <label style={styles.uploadArea}>

            <div style={styles.uploadIcon}>
              📁
            </div>

            <strong>
              Choose a skin image
            </strong>

            <span style={styles.uploadHint}>
              Click here to browse files
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              style={{
                display: "none",
              }}
            />

          </label>


          {preview && (

            <div style={styles.previewContainer}>

              <h4>
                Selected Image
              </h4>

              <img
                src={preview}
                alt="Skin preview"
                style={styles.preview}
              />

            </div>

          )}


          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            style={{
              ...styles.primaryButton,
              ...styles.fullButton,
              opacity:
                !image || loading
                  ? 0.6
                  : 1,
            }}
          >

            {loading
              ? "Analyzing..."
              : "Analyze Image"}

          </button>


          {error && (

            <div style={styles.error}>
              {error}
            </div>

          )}

        </div>


        {/* WEBCAM CARD */}

        <div className="vh-card" style={styles.analysisCard}>

          <p className="vh-section-label">Step 02 · Camera</p>
          <h3 style={styles.cardTitle}>
            Webcam Detection
          </h3>

          <p style={styles.muted}>
            Use your webcam to capture a skin image for analysis.
          </p>

          <div style={styles.cameraContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.cameraPreview}
            />

            {!cameraActive && (
              <div style={styles.cameraPlaceholder}>
                <div style={styles.cameraIcon}>📷</div>
                <strong>Camera is not active</strong>
                <span style={styles.uploadHint}>
                  Click the button below to start your webcam.
                </span>
              </div>
            )}
          </div>

          {!cameraActive ? (
            <button
              onClick={startCamera}
              style={{
                ...styles.primaryButton,
                ...styles.fullButton,
              }}
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={captureImage}
                style={{
                  ...styles.primaryButton,
                  ...styles.fullButton,
                }}
              >
                Capture Image
              </button>

              <button
                onClick={stopCamera}
                style={{
                  ...styles.secondaryButton,
                  ...styles.fullButton,
                  marginTop: "10px",
                }}
              >
                Stop Camera
              </button>
            </>
          )}

          <div style={styles.cameraNote}>
            <strong>How it works:</strong> Start your camera, capture one
            frame, and then use the Analyze Image button to send the
            captured image to the VitaHealth AI model.
          </div>

        </div>


        {/* RESULT CARD */}

        <div
          style={{
            ...styles.analysisCard,
            ...styles.resultCard,
          }}
        >

          {!result ? (

            <div style={styles.emptyResult}>

              <div style={styles.emptyIcon}>
                🩺
              </div>

              <p style={styles.resultMiniLabel}>
                AI SKIN ANALYSIS
              </p>

              <h3 style={styles.emptyResultTitle}>
                Your result will appear here
              </h3>

              <p style={styles.emptyResultText}>
                Upload a clear image or capture one with the webcam.
                After analysis, VitaHealth will explain the predicted
                skin-condition category in simple language.
              </p>

              <div style={styles.resultHowItWorks}>
                <strong>What you will see</strong>
                <span>• Predicted condition</span>
                <span>• What the condition means</span>
                <span>• Common signs and affected areas</span>
                <span>• General guidance, when available</span>
              </div>

            </div>

          ) : (

            <div>

              <div style={styles.resultTopRow}>
                <div>
                  <p style={styles.eyebrow}>
                    STEP 03 · AI RESULT
                  </p>

                  <h3 style={styles.resultCondition}>
                    {result.is_normal_or_unknown
                      ? "No specific supported condition detected"
                      : getDisplayConditionName(result.prediction)}
                  </h3>
                </div>

                <span style={styles.resultStatus}>
                  PRELIMINARY
                </span>
              </div>

              {result.is_normal_or_unknown ? (
                <>

                  <p style={styles.resultIntro}>
                    The model classified this image as <strong>Unknown / Normal</strong>.
                  </p>

                  <div style={styles.explanationCard}>
                    <div style={styles.explanationIcon}>ℹ️</div>
                    <div>
                      <h4 style={styles.explanationTitle}>
                        What does this result mean?
                      </h4>
                      <p style={styles.explanationText}>
                        The image did not match one of the supported
                        skin-condition categories strongly enough for the
                        model to assign a specific condition. This can happen
                        when the skin appears normal, the image is unclear,
                        or the appearance is outside the categories learned
                        by the model.
                      </p>
                    </div>
                  </div>

                  <div style={styles.resultSection}>
                    <h4 style={styles.resultSectionTitle}>
                      What should you do?
                    </h4>
                    <p style={styles.resultSectionText}>
                      Use a clear, well-lit image focused on the affected skin
                      area and try again when appropriate. A medical condition
                      cannot be ruled out from this AI result alone.
                    </p>
                  </div>

                  <div style={styles.warning}>
                    <strong>Important</strong>
                    <p>
                      {result.message ||
                        "This is an AI classification result, not a medical diagnosis. Consult a qualified healthcare professional for a persistent or concerning skin problem."}
                    </p>
                  </div>

                </>
              ) : (
                <>

                  <p style={styles.resultIntro}>
                    The AI model found a visual pattern that best matches the
                    <strong> {getDisplayConditionName(result.prediction)}</strong> category.
                  </p>

                  {/* CLEAR EXPLANATION */}

                  {getConditionKey(result.prediction) && (
                    <>
                      <div style={styles.explanationCard}>
                        <div style={styles.explanationIcon}>🔎</div>
                        <div>
                          <h4 style={styles.explanationTitle}>
                            In simple words
                          </h4>
                          <p style={styles.explanationText}>
                            {skinConditions[getConditionKey(result.prediction)].short}
                          </p>
                        </div>
                      </div>

                      <div style={styles.resultSection}>
                        <h4 style={styles.resultSectionTitle}>
                          What is it?
                        </h4>
                        <p style={styles.resultSectionText}>
                          {skinConditions[getConditionKey(result.prediction)].what}
                        </p>
                      </div>

                      <div style={styles.resultTwoColumn}>
                        <div style={styles.resultMiniCard}>
                          <span style={styles.resultMiniHeading}>Causes</span>
                          <p>{skinConditions[getConditionKey(result.prediction)].causes}</p>
                        </div>

                        <div style={styles.resultMiniCard}>
                          <span style={styles.resultMiniHeading}>Common symptoms</span>
                          <p>{skinConditions[getConditionKey(result.prediction)].symptoms}</p>
                        </div>

                        <div style={styles.resultMiniCard}>
                          <span style={styles.resultMiniHeading}>How it occurs / spreads</span>
                          <p>{skinConditions[getConditionKey(result.prediction)].occurrence}</p>
                        </div>

                        <div style={styles.resultMiniCard}>
                          <span style={styles.resultMiniHeading}>Commonly affected areas</span>
                          <p>{skinConditions[getConditionKey(result.prediction)].areas}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* GENERAL GUIDANCE */}

                  {getCleanItems(result.recommendations?.diet).length > 0 && (
                    <div style={styles.recommendationBox}>
                      <h4 style={styles.boxHeading}>🥗 Diet Guidance</h4>
                      <ul style={styles.resultList}>
                        {getCleanItems(result.recommendations.diet).map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {getCleanItems(result.recommendations?.lifestyle).length > 0 && (
                    <div style={styles.recommendationBox}>
                      <h4 style={styles.boxHeading}>🌿 Lifestyle Guidance</h4>
                      <ul style={styles.resultList}>
                        {getCleanItems(result.recommendations.lifestyle).map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {result.vitamin_recommendation?.nutrient &&
                    getCleanItems(
                      result.vitamin_recommendation.food_sources
                    ).length > 0 && (
                      <div style={styles.nutritionBox}>
                        <h4 style={styles.boxHeading}>
                          🍎 General Nutritional Support
                        </h4>

                        <h3 style={styles.nutritionTitle}>
                          {result.vitamin_recommendation.nutrient}
                        </h3>

                        <p>
                          <strong>Role:</strong>{" "}
                          {result.vitamin_recommendation.role}
                        </p>

                        <p>
                          <strong>Food Sources:</strong>{" "}
                          {getCleanItems(
                            result.vitamin_recommendation.food_sources
                          ).join(", ")}
                        </p>

                        <p style={styles.nutritionNote}>
                          Nutrition guidance supports general health. It does
                          not mean that the predicted skin condition is caused
                          by a vitamin deficiency.
                        </p>
                      </div>
                    )}

                  {/* FINAL ACTION */}

                  <div style={styles.nextStepCard}>
                    <div style={styles.nextStepIcon}>✓</div>
                    <div>
                      <h4 style={styles.explanationTitle}>
                        What this result does — and does not — tell you
                      </h4>
                      <p style={styles.explanationText}>
                        VitaHealth provides a preliminary image classification
                        to help you understand a possible skin-condition category.
                        It does not confirm the condition, identify a definite
                        cause, or replace examination by a healthcare professional.
                      </p>
                    </div>
                  </div>

                  <div style={styles.warning}>
                    <strong>Important</strong>

                    {result.recommendations?.medical_note && (
                      <p>{result.recommendations.medical_note}</p>
                    )}

                    <p>
                      This is an AI-based preliminary prediction and not a
                      medical diagnosis. Please consult a qualified healthcare
                      professional for diagnosis and treatment.
                    </p>
                  </div>

                </>
              )}

            </div>

          )}

        </div>

      </div>

    </section>
  );


  // ==========================================================
  // SKIN CONDITIONS PAGE
  // ==========================================================

  const renderConditions = () => (

    <section className="vh-page-section" style={styles.pageSection}>

      {!selectedCondition ? (

        <>

          <div style={styles.pageHeading}>

            <p style={styles.eyebrow}>
              SKIN HEALTH LIBRARY
            </p>

            <h2 style={styles.pageTitle}>
              Explore Skin Conditions
            </h2>

            <p style={styles.pageDescription}>
              Learn about the 22 image categories included in our current AI classification model.
            </p>

          </div>


          <div className="vh-condition-grid" style={styles.conditionGrid}>

            {Object.entries(
              skinConditions
            ).map(([name, info]) => (

              <button
                key={name}
                className="vh-card"
                style={styles.conditionCard}
                onClick={() =>
                  setSelectedCondition(name)
                }
              >

                <div style={styles.conditionIcon}>
                  🩺
                </div>

                <h3>
                  {name}
                </h3>

                <p>
                  {info.short}
                </p>

                <span style={styles.learnMore}>
                  Learn more →
                </span>

              </button>

            ))}

          </div>

        </>

      ) : (

        <div style={styles.detailPage}>

          <button
            style={styles.backButton}
            onClick={() =>
              setSelectedCondition(null)
            }
          >
            ← Back to Skin Conditions
          </button>


          <div style={styles.detailHeader}>

            <div style={styles.detailIcon}>
              🩺
            </div>

            <div>

              <p style={styles.eyebrow}>
                SKIN CONDITION
              </p>

              <h2 style={styles.pageTitle}>
                {selectedCondition}
              </h2>

              <p style={styles.pageDescription}>
                {
                  skinConditions[selectedCondition].short
                }
              </p>

            </div>

          </div>


          <div style={styles.detailGrid}>

            <div className="vh-card" style={styles.detailCard}>

              <h3>
                What is it?
              </h3>

              <p>
                {
                  skinConditions[
                    selectedCondition
                  ].what
                }
              </p>

            </div>


            <div className="vh-card" style={styles.detailCard}>

              <h3>
                Causes
              </h3>

              <p>
                {
                  skinConditions[
                    selectedCondition
                  ].causes
                }
              </p>

            </div>


            <div className="vh-card" style={styles.detailCard}>

              <h3>
                Common symptoms
              </h3>

              <p>
                {
                  skinConditions[
                    selectedCondition
                  ].symptoms
                }
              </p>

            </div>


            <div className="vh-card" style={styles.detailCard}>

              <h3>
                How it occurs / spreads
              </h3>

              <p>
                {
                  skinConditions[
                    selectedCondition
                  ].occurrence
                }
              </p>

            </div>


            <div className="vh-card" style={styles.detailCard}>

              <h3>
                Commonly affected areas
              </h3>

              <p>
                {
                  skinConditions[
                    selectedCondition
                  ].areas
                }
              </p>

            </div>

          </div>


          <div style={styles.infoBanner}>

            <strong>
              VitaHealth Information
            </strong>

            <p>
              This information is provided for
              educational purposes. A skin image
              alone cannot establish a final
              medical diagnosis.
            </p>

          </div>

        </div>

      )}

    </section>

  );


  // ==========================================================
  // ABOUT PAGE
  // ==========================================================

  const renderAbout = () => (

    <section className="vh-page-section" style={styles.pageSection}>

      <div style={styles.pageHeading}>

        <p style={styles.eyebrow}>
          ABOUT VITAHEALTH
        </p>

        <h2 style={styles.pageTitle}>
          Building AI for skin-health awareness
        </h2>

        <p style={styles.pageDescription}>
          VitaHealth is an academic AI project
          focused on understanding how an
          image-classification system can support
          preliminary skin-condition awareness.
        </p>

      </div>


      <div className="vh-about-grid" style={styles.aboutGrid}>

        <div className="vh-card" style={styles.aboutCard}>

          <h3>
            Our AI Model
          </h3>

          <p>
            We use MobileNetV3-Small, a lightweight deep-learning image-classification model,
            trained for the 22 image categories included in the current dataset.
          </p>

        </div>


        <div className="vh-card" style={styles.aboutCard}>

          <h3>
            Technology
          </h3>

          <p>
            The current system uses PyTorch for the
            machine-learning model, FastAPI for the
            backend API, and React for the frontend.
          </p>

        </div>


        <div className="vh-card" style={styles.aboutCard}>

          <h3>
            Future Development
          </h3>

          <p>
            The current frontend supports webcam capture. A captured frame is sent to the
            same FastAPI prediction endpoint used for uploaded images.
          </p>

        </div>

      </div>

    </section>

  );


  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (
    <>
    <style>{`
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body {
        margin: 0;
        background: #f4f8f7;
        color: #102f2a;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", Arial, sans-serif;
      }
      button, input, label { font: inherit; }
      button:focus-visible, label:focus-visible {
        outline: 3px solid rgba(22,124,104,0.22);
        outline-offset: 3px;
      }
      ::selection {
        background: #cdebe2;
        color: #103a32;
      }

      .vh-shell {
        max-width: 1280px;
        margin: 0 auto;
      }

      .vh-nav-link {
        position: relative;
      }

      .vh-nav-link::after {
        content: "";
        position: absolute;
        left: 14px;
        right: 14px;
        bottom: 5px;
        height: 2px;
        background: #167c68;
        border-radius: 99px;
        transform: scaleX(0);
        transform-origin: center;
        transition: transform .2s ease;
      }

      .vh-nav-link:hover::after {
        transform: scaleX(1);
      }

      .vh-card {
        transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
      }

      .vh-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 18px 38px rgba(26,70,61,0.08) !important;
        border-color: #cde4dd !important;
      }

      .vh-analyze-heading {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
      }

      .vh-page-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 11px;
        border-radius: 999px;
        background: #e8f6f1;
        border: 1px solid #d1ebe3;
        color: #166e5d;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
      }

      .vh-step-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #68807a;
        font-size: 12px;
        font-weight: 700;
      }

      .vh-step-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #28a282;
        box-shadow: 0 0 0 4px #def3ec;
      }

      .vh-result-highlight {
        border: 1px solid #cfe7df;
        background: linear-gradient(135deg, #edf8f4 0%, #ffffff 100%);
        border-radius: 16px;
        padding: 18px;
        margin-top: 17px;
      }

      .vh-section-label {
        color: #16745f;
        font-size: 10px;
        letter-spacing: 1.8px;
        font-weight: 800;
        text-transform: uppercase;
        margin: 0 0 7px;
      }

      .vh-footer-link {
        transition: opacity .18s ease, transform .18s ease;
      }

      .vh-footer-link:hover {
        opacity: .78;
        transform: translateY(-1px);
      }

      @media (max-width: 1020px) {
        .vh-navbar { flex-wrap: wrap; padding: 13px 0; }
        .vh-nav { order: 3; width: 100%; justify-content: center; flex-wrap: wrap; }
        .vh-hero-content { grid-template-columns: 1fr !important; }
        .vh-feature-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .vh-analysis-grid { grid-template-columns: 1fr 1fr !important; }
        .vh-analysis-grid > :last-child { grid-column: 1 / -1; }
        .vh-info-section { grid-template-columns: 1fr !important; row-gap: 34px; }
        .vh-condition-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        .vh-about-grid { grid-template-columns: 1fr !important; }
        .vh-analyze-heading { align-items: flex-start; flex-direction: column; }
      }

      @media (max-width: 680px) {
        .vh-navbar { width: 94% !important; }
        .vh-nav { gap: 1px !important; }
        .vh-hero { padding: 58px 0 50px !important; }
        .vh-hero-title { font-size: 39px !important; }
        .vh-feature-grid, .vh-analysis-grid, .vh-condition-grid {
          grid-template-columns: 1fr !important;
        }
        .vh-analysis-grid > :last-child { grid-column: auto; }
        .vh-info-section { padding: 54px 6% !important; }
        .vh-page-title { font-size: 34px !important; }
        .vh-footer-inner, .vh-footer-bottom {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .vh-hero-buttons { flex-direction: column !important; }
      }
    `}</style>
    <div style={styles.page}>

      {/* NAVBAR */}

      <header className="vh-header" style={styles.header}>

        <div className="vh-navbar" style={styles.navbar}>

          <button
            style={styles.logoButton}
            onClick={() => goTo("home")}
          >

            <span style={styles.logoMark}>
              V
            </span>

            <div>

              <div style={styles.logo}>
                VitaHealth
              </div>

              <div style={styles.logoSub}>
                AI Skin Health
              </div>

            </div>

          </button>


          <nav className="vh-nav" style={styles.nav}>

            <button
              style={
                activePage === "home"
                  ? styles.navButtonActive
                  : styles.navButton
              }
              onClick={() => goTo("home")}
            >
              Home
            </button>


            <button
              style={
                activePage === "analyze"
                  ? styles.navButtonActive
                  : styles.navButton
              }
              onClick={() => goTo("analyze")}
            >
              Analyze
            </button>


            <button
              style={
                activePage === "conditions"
                  ? styles.navButtonActive
                  : styles.navButton
              }
              onClick={() => goTo("conditions")}
            >
              Skin Conditions
            </button>


            <button
              style={
                activePage === "about"
                  ? styles.navButtonActive
                  : styles.navButton
              }
              onClick={() => goTo("about")}
            >
              About
            </button>

          </nav>


          <button
            style={styles.navCTA}
            onClick={() => goTo("analyze")}
          >
            Analyze Skin
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <main>

        {activePage === "home" &&
          renderHome()}

        {activePage === "analyze" &&
          renderAnalyze()}

        {activePage === "conditions" &&
          renderConditions()}

        {activePage === "about" &&
          renderAbout()}

      </main>


      {/* FOOTER */}

      <footer style={styles.footer}>

        <div className="vh-footer-inner" style={styles.footerInner}>

          <div>

            <div style={styles.footerLogo}>
              VitaHealth
            </div>

            <p style={styles.footerText}>
              AI-based skin health awareness
              and educational support.
            </p>

          </div>


          <div style={styles.footerLinks}>

            <button
              onClick={() => goTo("home")}
              className="vh-footer-link" style={styles.footerButton}
            >
              Home
            </button>

            <button
              onClick={() => goTo("analyze")}
              className="vh-footer-link" style={styles.footerButton}
            >
              Analyze
            </button>

            <button
              onClick={() => goTo("conditions")}
              className="vh-footer-link" style={styles.footerButton}
            >
              Conditions
            </button>

          </div>

        </div>


        <div className="vh-footer-bottom" style={styles.footerBottom}>

          <span>
            VitaHealth © 2026
          </span>

          <span>
            AI prediction is not a medical diagnosis.
          </span>

        </div>

      </footer>

    </div>
    </>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(222,244,237,0.9) 0%, transparent 32%), #f3f8f6",
    color: "#163a34",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(255,255,255,0.92)",
    borderBottom: "1px solid rgba(217,232,227,0.9)",
    backdropFilter: "blur(16px)",
    boxShadow: "0 5px 24px rgba(15,61,52,0.05)",
  },

  navbar: {
    width: "92%",
    maxWidth: "1240px",
    margin: "0 auto",
    minHeight: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
  },

  logoButton: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },

  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #167c68, #0f6254)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "21px",
    boxShadow: "0 8px 18px rgba(22,124,104,0.20)",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#123f37",
    lineHeight: 1,
    textAlign: "left",
    letterSpacing: "-0.3px",
  },

  logoSub: {
    fontSize: "10px",
    color: "#7a928c",
    marginTop: "5px",
    textAlign: "left",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  navButton: {
    border: "1px solid transparent",
    background: "transparent",
    color: "#607873",
    padding: "10px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  navButtonActive: {
    border: "1px solid #cfe6df",
    background: "#e9f6f2",
    color: "#126b5b",
    padding: "10px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow: "0 5px 15px rgba(22,124,104,0.07)",
  },

  navCTA: {
    border: "none",
    background: "linear-gradient(135deg, #167c68, #116654)",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
    boxShadow: "0 8px 18px rgba(22,124,104,0.20)",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 80% 20%, rgba(173,224,211,0.42), transparent 27%), linear-gradient(135deg, #eaf7f2 0%, #f7fcfa 52%, #edf7f3 100%)",
    padding: "88px 0 78px",
    borderBottom: "1px solid #dfece8",
  },

  heroContent: {
    width: "92%",
    maxWidth: "1240px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "60px",
    alignItems: "center",
  },

  heroText: {
    maxWidth: "690px",
  },

  eyebrow: {
    color: "#16806b",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "2.2px",
    margin: "0 0 13px",
  },

  heroTitle: {
    fontSize: "54px",
    lineHeight: "1.05",
    margin: 0,
    color: "#153d36",
    letterSpacing: "-2px",
    fontWeight: "800",
  },

  heroHighlight: {
    color: "#167c68",
  },

  heroDescription: {
    fontSize: "18px",
    lineHeight: "1.75",
    color: "#617974",
    maxWidth: "630px",
    marginTop: "22px",
  },

  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "31px",
  },

  primaryButton: {
    border: "none",
    background: "linear-gradient(135deg, #167c68, #116654)",
    color: "#ffffff",
    borderRadius: "11px",
    padding: "14px 22px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(22,124,104,0.18)",
  },

  secondaryButton: {
    border: "1px solid #b9d8d0",
    background: "rgba(255,255,255,0.9)",
    color: "#176c5c",
    borderRadius: "11px",
    padding: "14px 22px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(33,77,68,0.06)",
  },

  heroCard: {
    background: "rgba(255,255,255,0.90)",
    borderRadius: "24px",
    padding: "35px",
    border: "1px solid #d8eae5",
    boxShadow: "0 25px 65px rgba(24,74,63,0.12)",
    backdropFilter: "blur(8px)",
  },

  heroIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "17px",
    background: "#e4f4ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    marginBottom: "20px",
    border: "1px solid #d0e9e2",
  },

  heroCardTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#193f38",
    letterSpacing: "-0.4px",
  },

  heroCardText: {
    color: "#6b817c",
    lineHeight: "1.7",
    marginTop: "10px",
  },

  heroTrustRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "18px",
  },

  heroTrustBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#f4faf8",
    border: "1px solid #dcebe7",
    color: "#5f7973",
    fontSize: "10px",
    fontWeight: "700",
  },

  heroSteps: {
    marginTop: "25px",
    display: "grid",
    gap: "11px",
  },

  step: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#45655e",
    fontSize: "14px",
    padding: "7px 0",
  },

  stepNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#167c68",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },

  featureSection: {
    width: "92%",
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "88px 0",
  },

  sectionHeading: {
    textAlign: "center",
    maxWidth: "760px",
    margin: "0 auto 44px",
  },

  sectionTitle: {
    fontSize: "34px",
    margin: 0,
    color: "#183f37",
    letterSpacing: "-0.8px",
  },

  sectionSubtitle: {
    color: "#718681",
    marginTop: "10px",
    lineHeight: "1.6",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "22px",
  },

  featureCard: {
    background: "#ffffff",
    border: "1px solid #dceae6",
    borderRadius: "19px",
    padding: "28px",
    boxShadow: "0 13px 35px rgba(34,75,66,0.06)",
  },

  featureIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: "#edf7f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "17px",
    border: "1px solid #dbeee8",
  },

  featureDescription: {
    color: "#6e817d",
    lineHeight: "1.65",
  },

  linkButton: {
    marginTop: "13px",
    border: "none",
    background: "transparent",
    color: "#167c68",
    cursor: "pointer",
    fontWeight: "700",
    padding: 0,
  },

  disabledLink: {
    marginTop: "13px",
    border: "none",
    background: "transparent",
    color: "#a0afac",
    cursor: "not-allowed",
    padding: 0,
    fontWeight: "700",
  },

  infoSection: {
    background: "#ffffff",
    padding: "80px 8%",
    borderTop: "1px solid #e4eeeb",
    borderBottom: "1px solid #e4eeeb",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 0.8fr) minmax(500px, 1.2fr)",
    columnGap: "80px",
    alignItems: "start",
  },

  infoHeading: {
    maxWidth: "430px",
  },

  sectionTitleLeft: {
    fontSize: "40px",
    lineHeight: "1.18",
    color: "#183f37",
    margin: 0,
    letterSpacing: "-1px",
  },

  infoIntro: {
    color: "#718681",
    lineHeight: "1.75",
    marginTop: "18px",
  },

  workflow: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "700px",
  },

  workflowItem: {
    display: "grid",
    gridTemplateColumns: "55px minmax(0, 1fr)",
    columnGap: "25px",
    alignItems: "start",
    padding: "3px 0 31px",
  },

  workflowNumber: {
    color: "#16806b",
    fontWeight: "800",
    fontSize: "15px",
    paddingTop: "2px",
    letterSpacing: "1px",
  },

  workflowHeading: {
    margin: "0 0 8px",
    color: "#183f37",
    fontSize: "21px",
    lineHeight: "1.2",
  },

  workflowDescription: {
    margin: 0,
    color: "#6f817d",
    lineHeight: "1.65",
    fontSize: "15px",
  },

  pageSection: {
    width: "92%",
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "68px 0 94px",
  },

  pageHeading: {
    textAlign: "center",
    maxWidth: "780px",
    margin: "0 auto 47px",
  },

  pageTitle: {
    margin: 0,
    fontSize: "42px",
    color: "#173e36",
    letterSpacing: "-1px",
  },

  pageDescription: {
    color: "#6f817d",
    lineHeight: "1.75",
    fontSize: "16px",
    marginTop: "12px",
  },

  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "22px",
    alignItems: "start",
  },

  analysisCard: {
    background: "rgba(255,255,255,0.97)",
    border: "1px solid #dceae6",
    borderRadius: "20px",
    padding: "29px",
    boxShadow: "0 14px 38px rgba(25,72,62,0.07)",
    overflow: "hidden",
  },

  cardTitle: {
    margin: 0,
    color: "#153d36",
    fontSize: "21px",
    letterSpacing: "-0.3px",
  },

  analyzeMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
    padding: "11px 13px",
    border: "1px solid #dfece8",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 7px 20px rgba(32,73,64,0.04)",
  },

  metaArrow: {
    color: "#9ab0aa",
    fontWeight: "800",
    fontSize: "12px",
  },

  muted: {
    color: "#81938e",
    fontSize: "13px",
  },

  uploadArea: {
    marginTop: "20px",
    minHeight: "188px",
    border: "2px dashed #afd0c7",
    borderRadius: "15px",
    background: "linear-gradient(180deg, #fbfefd 0%, #f5fbf8 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "center",
    gap: "8px",
    padding: "20px",
  },

  uploadIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "17px",
    background: "#e8f5f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    marginBottom: "5px",
    border: "1px solid #d3ebe4",
  },

  uploadHint: {
    color: "#7b8f8a",
    fontSize: "13px",
  },

  fullButton: {
    width: "100%",
    marginTop: "22px",
  },

  previewContainer: {
    textAlign: "center",
    marginTop: "25px",
    padding: "14px",
    borderRadius: "15px",
    background: "#f8fcfa",
    border: "1px solid #e0ece9",
  },

  preview: {
    width: "100%",
    maxWidth: "320px",
    maxHeight: "320px",
    objectFit: "cover",
    borderRadius: "13px",
    margin: "10px auto 0",
    border: "1px solid #dbe8e5",
    boxShadow: "0 10px 24px rgba(30,85,73,0.08)",
  },

  cameraContainer: {
    position: "relative",
    marginTop: "20px",
    width: "100%",
    aspectRatio: "4 / 3",
    background: "#eef5f3",
    borderRadius: "15px",
    overflow: "hidden",
    border: "1px solid #d7e8e3",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.7)",
  },

  cameraPreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transform: "scaleX(-1)",
  },

  cameraPlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px",
    color: "#566f69",
    gap: "8px",
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.8), rgba(238,245,243,0.98))",
  },

  cameraIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "18px",
    background: "#e8f5f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "29px",
    marginBottom: "6px",
  },

  cameraNote: {
    marginTop: "15px",
    padding: "13px",
    borderRadius: "10px",
    background: "#f6fbf9",
    border: "1px solid #e1ece9",
    color: "#718681",
    fontSize: "12px",
    lineHeight: "1.55",
  },

  error: {
    marginTop: "15px",
    padding: "13px",
    borderRadius: "10px",
    background: "#fff2f0",
    border: "1px solid #f2d0ca",
    color: "#9b4338",
    fontSize: "13px",
  },

  emptyResult: {
    minHeight: "550px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#738681",
    padding: "36px",
    background:
      "radial-gradient(circle at 50% 35%, rgba(232,245,241,0.9), transparent 33%)",
    borderRadius: "16px",
  },

  emptyIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "22px",
    background: "#eaf6f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "17px",
  },

  resultCondition: {
    fontSize: "31px",
    color: "#167c68",
    margin: "5px 0 8px",
    letterSpacing: "-0.6px",
    lineHeight: "1.15",
  },

  resultIntro: {
    color: "#71827e",
    lineHeight: "1.65",
  },

  resultDivider: {
    height: "1px",
    background: "#e4eeeb",
    margin: "25px 0",
  },

  resultInfo: {
    color: "#566f69",
    lineHeight: "1.7",
  },

  resultCard: {
    minHeight: "620px",
    overflow: "hidden",
  },

  resultTopRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "14px",
    marginBottom: "8px",
  },

  resultStatus: {
    flexShrink: 0,
    padding: "7px 9px",
    borderRadius: "999px",
    background: "#e9f6f2",
    border: "1px solid #cce5dd",
    color: "#14705f",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "1px",
  },

  resultMiniLabel: {
    color: "#16806b",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1.7px",
    margin: "0 0 8px",
  },

  emptyResultTitle: {
    fontSize: "23px",
    color: "#173f37",
    margin: "0 0 10px",
  },

  emptyResultText: {
    maxWidth: "410px",
    color: "#71827e",
    lineHeight: "1.7",
    margin: 0,
  },

  resultHowItWorks: {
    width: "100%",
    maxWidth: "420px",
    marginTop: "24px",
    padding: "15px 17px",
    borderRadius: "13px",
    background: "#f8fcfa",
    border: "1px solid #deebe7",
    display: "grid",
    gap: "6px",
    textAlign: "left",
    color: "#617873",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  explanationCard: {
    display: "grid",
    gridTemplateColumns: "42px minmax(0, 1fr)",
    gap: "13px",
    marginTop: "20px",
    padding: "17px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #edf8f4, #f8fcfa)",
    border: "1px solid #cfe7df",
  },

  explanationIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #d8ebe5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  explanationTitle: {
    margin: "0 0 5px",
    color: "#173f37",
    fontSize: "15px",
  },

  explanationText: {
    margin: 0,
    color: "#617873",
    lineHeight: "1.65",
    fontSize: "13px",
  },

  resultSection: {
    marginTop: "22px",
    paddingTop: "2px",
  },

  resultSectionTitle: {
    margin: "0 0 7px",
    color: "#173f37",
    fontSize: "16px",
  },

  resultSectionText: {
    margin: 0,
    color: "#617873",
    lineHeight: "1.7",
    fontSize: "13px",
  },

  resultTwoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginTop: "18px",
  },

  resultMiniCard: {
    padding: "14px",
    borderRadius: "12px",
    background: "#fbfdfc",
    border: "1px solid #e0ece9",
  },

  resultMiniHeading: {
    display: "block",
    marginBottom: "5px",
    color: "#226256",
    fontWeight: "800",
    fontSize: "12px",
  },

  resultList: {
    margin: "10px 0 0 18px",
    padding: 0,
    color: "#617873",
    lineHeight: "1.7",
    fontSize: "13px",
  },

  boxHeading: {
    margin: 0,
    color: "#173f37",
    fontSize: "15px",
  },

  nutritionTitle: {
    margin: "14px 0 9px",
    color: "#173f37",
    fontSize: "20px",
  },

  nutritionNote: {
    marginBottom: 0,
    color: "#6a817b",
    fontSize: "12px",
    lineHeight: "1.55",
  },

  nextStepCard: {
    display: "grid",
    gridTemplateColumns: "42px minmax(0, 1fr)",
    gap: "13px",
    marginTop: "22px",
    padding: "17px",
    borderRadius: "14px",
    background: "#f7fbfa",
    border: "1px solid #dceae6",
  },

  nextStepIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "#e7f5f0",
    color: "#15715f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
  },

  recommendationBox: {
    marginTop: "20px",
    padding: "19px",
    background: "#f7fbfa",
    border: "1px solid #e0ece9",
    borderRadius: "13px",
  },

  nutritionBox: {
    marginTop: "20px",
    padding: "20px",
    background: "linear-gradient(135deg, #edf8f4, #f4fbf8)",
    border: "1px solid #cfe7df",
    borderRadius: "13px",
  },

  warning: {
    marginTop: "20px",
    padding: "17px",
    background: "#fff8ed",
    borderLeft: "4px solid #e3a04a",
    borderRadius: "9px",
    color: "#765321",
    lineHeight: "1.6",
    fontSize: "13px",
    boxShadow: "0 6px 18px rgba(90,69,26,0.04)",
  },

  conditionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  conditionCard: {
    textAlign: "left",
    border: "1px solid #dceae6",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    cursor: "pointer",
    boxShadow: "0 10px 27px rgba(34,75,66,0.05)",
  },

  conditionIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "13px",
    background: "#edf7f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    marginBottom: "13px",
  },

  learnMore: {
    display: "inline-block",
    marginTop: "10px",
    color: "#167c68",
    fontSize: "14px",
    fontWeight: "700",
  },

  detailPage: {
    maxWidth: "960px",
    margin: "0 auto",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#167c68",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
    marginBottom: "30px",
  },

  detailHeader: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "35px",
    padding: "26px",
    background: "#ffffff",
    border: "1px solid #dceae6",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(34,75,66,0.05)",
  },

  detailIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "18px",
    background: "#e8f5f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "33px",
    flexShrink: 0,
    border: "1px solid #d3ebe4",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "18px",
  },

  detailCard: {
    background: "#ffffff",
    border: "1px solid #deebe7",
    borderRadius: "15px",
    padding: "22px",
    lineHeight: "1.7",
    boxShadow: "0 8px 22px rgba(34,75,66,0.04)",
  },

  infoBanner: {
    marginTop: "24px",
    padding: "20px",
    background: "linear-gradient(135deg, #edf7f4, #f6fbf9)",
    border: "1px solid #d7ebe5",
    borderRadius: "13px",
    color: "#49665f",
    lineHeight: "1.65",
  },

  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    maxWidth: "1050px",
    margin: "0 auto",
  },

  aboutCard: {
    background: "#ffffff",
    border: "1px solid #deebe7",
    borderRadius: "17px",
    padding: "27px",
    lineHeight: "1.7",
    color: "#607671",
    boxShadow: "0 10px 27px rgba(34,75,66,0.05)",
  },

  footer: {
    background:
      "linear-gradient(135deg, #123b34 0%, #0f312c 100%)",
    color: "#ffffff",
    padding: "42px 8% 21px",
  },

  footerInner: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
  },

  footerLogo: {
    fontSize: "23px",
    fontWeight: "800",
    letterSpacing: "-0.4px",
  },

  footerText: {
    color: "#b9d0ca",
    fontSize: "13px",
    maxWidth: "340px",
    lineHeight: "1.65",
  },

  footerLinks: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
  },

  footerButton: {
    border: "none",
    background: "transparent",
    color: "#d7e7e2",
    cursor: "pointer",
    padding: 0,
    fontWeight: "600",
  },

  footerBottom: {
    maxWidth: "1240px",
    margin: "30px auto 0",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    color: "#a9c2bc",
    fontSize: "11px",
  },
};


export default App;