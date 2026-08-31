import { useState } from "react";

// ============================================================
// SKIN CONDITION INFORMATION
// ============================================================

const skinConditions = {
  "Atopic Dermatitis": {
    short:
      "A common inflammatory skin condition that often causes dry and itchy skin.",
    what:
      "Atopic dermatitis is a common skin condition that can make the skin dry, itchy, and irritated.",
    causes:
      "It can be associated with genetics, skin-barrier problems, immune responses, and environmental triggers.",
    symptoms:
      "Dry skin, itching, redness, irritation, and sometimes areas of thicker skin caused by repeated scratching.",
    occurrence:
      "It is not generally contagious. Symptoms can appear or become worse when exposed to personal triggers.",
    areas:
      "It can affect different areas of the body, including the face, hands, arms, and skin folds.",
  },

  "Contact Dermatitis": {
    short:
      "Skin irritation or inflammation caused by contact with an irritating or allergenic substance.",
    what:
      "Contact dermatitis happens when the skin reacts after coming into contact with a particular substance.",
    causes:
      "Common triggers can include soaps, cosmetics, detergents, chemicals, fragrances, and certain metals.",
    symptoms:
      "Redness, itching, irritation, dryness, swelling, or a rash may occur in the affected area.",
    occurrence:
      "It is not usually contagious. Symptoms are related to exposure to an irritant or allergen.",
    areas:
      "It usually appears where the skin has been exposed to the triggering substance.",
  },

  Eczema: {
    short:
      "A group of inflammatory skin conditions that can cause itchy, dry, and irritated skin.",
    what:
      "Eczema is a general term used for several inflammatory skin conditions that commonly cause itching and irritation.",
    causes:
      "Possible factors include genetics, skin-barrier problems, immune responses, and environmental triggers.",
    symptoms:
      "Itching, dryness, redness, irritation, and sometimes scaling or thickened skin.",
    occurrence:
      "Eczema is not generally contagious.",
    areas:
      "It can occur on the face, hands, arms, legs, and other areas of the body.",
  },

  Scabies: {
    short:
      "A contagious skin infestation caused by microscopic mites.",
    what:
      "Scabies is a skin infestation caused by tiny mites that burrow into the outer layer of the skin.",
    causes:
      "It is caused by infestation with the scabies mite.",
    symptoms:
      "Intense itching, especially at night, along with a rash and small bumps or burrows.",
    occurrence:
      "Scabies can spread through prolonged close skin-to-skin contact and sometimes through shared clothing or bedding.",
    areas:
      "It commonly affects areas such as the hands, wrists, between the fingers, waist, and other body areas.",
  },

  "Seborrheic Dermatitis": {
    short:
      "A common inflammatory condition that often causes redness and flaky skin.",
    what:
      "Seborrheic dermatitis is a common skin condition that mainly affects areas where oil-producing glands are more active.",
    causes:
      "It is associated with oil-producing skin, skin inflammation, and the activity of naturally occurring skin yeast.",
    symptoms:
      "Redness, itching, greasy or dry flakes, and scaling.",
    occurrence:
      "It is not generally contagious.",
    areas:
      "It commonly affects the scalp, face, eyebrows, ears, and other oily areas.",
  },

  "Tinea Corporis": {
    short:
      "A fungal skin infection commonly known as ringworm.",
    what:
      "Tinea corporis is a fungal infection of the skin. Despite the name, it is caused by a fungus, not a worm.",
    causes:
      "It is caused by dermatophyte fungi.",
    symptoms:
      "It can cause an itchy, scaly rash that may have a ring-like appearance.",
    occurrence:
      "It can spread through direct contact with an infected person or animal and through contaminated items.",
    areas:
      "It can occur on many areas of the body, especially exposed skin.",
  },
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

      <section style={styles.hero}>
        <div style={styles.heroContent}>

          <div style={styles.heroText}>

            <p style={styles.eyebrow}>
              AI-POWERED SKIN HEALTH
            </p>

            <h1 style={styles.heroTitle}>
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

            <div style={styles.heroButtons}>

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


          <div style={styles.heroCard}>

            <div style={styles.heroIcon}>
              🩺
            </div>

            <h3 style={styles.heroCardTitle}>
              AI Skin Analysis
            </h3>

            <p style={styles.heroCardText}>
              Upload a skin image and receive a
              preliminary skin-condition prediction
              with useful educational information.
            </p>

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

      <section style={styles.featureSection}>

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


        <div style={styles.featureGrid}>

          <div style={styles.featureCard}>

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


          <div style={styles.featureCard}>

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


          <div style={styles.featureCard}>

            <div style={styles.featureIcon}>
              📷
            </div>

            <h3>
              Webcam Detection
            </h3>

            <p style={styles.featureDescription}>
              Real-time webcam-based skin analysis
              is planned as a future feature.
            </p>

            <button
              style={styles.disabledLink}
              disabled
            >
              Coming soon
            </button>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section style={styles.infoSection}>

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
    <section style={styles.pageSection}>

      <div style={styles.pageHeading}>

        <p style={styles.eyebrow}>
          AI ANALYSIS
        </p>

        <h2 style={styles.pageTitle}>
          Analyze Your Skin
        </h2>

        <p style={styles.pageDescription}>
          Upload a skin image and receive a
          preliminary AI-based prediction.
        </p>

      </div>


      <div style={styles.analysisGrid}>

        {/* UPLOAD CARD */}

        <div style={styles.analysisCard}>

          <h3>
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


        {/* RESULT CARD */}

        <div style={styles.analysisCard}>

          {!result ? (

            <div style={styles.emptyResult}>

              <div style={styles.emptyIcon}>
                🩺
              </div>

              <h3>
                Your result will appear here
              </h3>

              <p>
                Upload a skin image and click
                “Analyze Image” to get started.
              </p>

            </div>

          ) : (

            <div>

              <p style={styles.eyebrow}>
                ANALYSIS RESULT
              </p>

              <h3 style={styles.resultCondition}>
                {result.prediction}
              </h3>

              <p style={styles.resultIntro}>
                The AI model identified this as
                the predicted condition.
              </p>


              <div style={styles.resultDivider} />


              {/* CONDITION INFORMATION */}

              {skinConditions[result.prediction] && (

                <div style={styles.resultInfo}>

                  <h4>
                    About this condition
                  </h4>

                  <p>
                    {
                      skinConditions[
                        result.prediction
                      ].what
                    }
                  </p>


                  <h4>
                    Causes
                  </h4>

                  <p>
                    {
                      skinConditions[
                        result.prediction
                      ].causes
                    }
                  </p>


                  <h4>
                    Common symptoms
                  </h4>

                  <p>
                    {
                      skinConditions[
                        result.prediction
                      ].symptoms
                    }
                  </p>


                  <h4>
                    How it occurs
                  </h4>

                  <p>
                    {
                      skinConditions[
                        result.prediction
                      ].occurrence
                    }
                  </p>


                  <h4>
                    Commonly affected areas
                  </h4>

                  <p>
                    {
                      skinConditions[
                        result.prediction
                      ].areas
                    }
                  </p>

                </div>

              )}


              {/* DIET */}

              <div style={styles.recommendationBox}>

                <h4>
                  🥗 Diet Guidance
                </h4>

                <ul>

                  {result.recommendations.diet.map(
                    (item, index) => (

                      <li key={index}>
                        {item}
                      </li>

                    )
                  )}

                </ul>

              </div>


              {/* LIFESTYLE */}

              <div style={styles.recommendationBox}>

                <h4>
                  🌿 Lifestyle Guidance
                </h4>

                <ul>

                  {result.recommendations.lifestyle.map(
                    (item, index) => (

                      <li key={index}>
                        {item}
                      </li>

                    )
                  )}

                </ul>

              </div>


              {/* NUTRITION */}

              {result.vitamin_recommendation && (

                <div style={styles.nutritionBox}>

                  <h4>
                    💊 Nutritional Support
                  </h4>

                  <h3>
                    {
                      result.vitamin_recommendation
                        .nutrient
                    }
                  </h3>

                  <p>
                    <strong>
                      Role:
                    </strong>{" "}
                    {
                      result.vitamin_recommendation
                        .role
                    }
                  </p>

                  <p>
                    <strong>
                      Food Sources:
                    </strong>{" "}
                    {
                      result.vitamin_recommendation
                        .food_sources
                        .join(", ")
                    }
                  </p>

                </div>

              )}


              {/* MEDICAL NOTE */}

              <div style={styles.warning}>

                <strong>
                  Important
                </strong>

                <p>
                  {
                    result.recommendations
                      .medical_note
                  }
                </p>

                <p>
                  This is an AI-based preliminary
                  prediction and not a medical
                  diagnosis. Please consult a
                  qualified healthcare professional
                  for diagnosis and treatment.
                </p>

              </div>

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

    <section style={styles.pageSection}>

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
              Learn about the six conditions included
              in our current AI classification model.
            </p>

          </div>


          <div style={styles.conditionGrid}>

            {Object.entries(
              skinConditions
            ).map(([name, info]) => (

              <button
                key={name}
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
                  skinConditions[
                    selectedCondition
                  ].short
                }
              </p>

            </div>

          </div>


          <div style={styles.detailGrid}>

            <div style={styles.detailCard}>

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


            <div style={styles.detailCard}>

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


            <div style={styles.detailCard}>

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


            <div style={styles.detailCard}>

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


            <div style={styles.detailCard}>

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

    <section style={styles.pageSection}>

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


      <div style={styles.aboutGrid}>

        <div style={styles.aboutCard}>

          <h3>
            Our AI Model
          </h3>

          <p>
            We use MobileNetV3-Small, a lightweight
            deep-learning image-classification model,
            trained to classify images into six
            skin-condition categories.
          </p>

        </div>


        <div style={styles.aboutCard}>

          <h3>
            Technology
          </h3>

          <p>
            The current system uses PyTorch for the
            machine-learning model, FastAPI for the
            backend API, and React for the frontend.
          </p>

        </div>


        <div style={styles.aboutCard}>

          <h3>
            Future Development
          </h3>

          <p>
            We plan to add webcam-based real-time
            image capture and analysis as a future
            enhancement to the current system.
          </p>

        </div>

      </div>

    </section>

  );


  // ==========================================================
  // MAIN RENDER
  // ==========================================================

  return (

    <div style={styles.page}>

      {/* NAVBAR */}

      <header style={styles.header}>

        <div style={styles.navbar}>

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


          <nav style={styles.nav}>

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

        <div style={styles.footerInner}>

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
              style={styles.footerButton}
            >
              Home
            </button>

            <button
              onClick={() => goTo("analyze")}
              style={styles.footerButton}
            >
              Analyze
            </button>

            <button
              onClick={() => goTo("conditions")}
              style={styles.footerButton}
            >
              Conditions
            </button>

          </div>

        </div>


        <div style={styles.footerBottom}>

          <span>
            VitaHealth © 2026
          </span>

          <span>
            AI prediction is not a medical diagnosis.
          </span>

        </div>

      </footer>

    </div>

  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5faf8",
    color: "#17332e",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },


  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background:
      "rgba(255,255,255,0.96)",
    borderBottom:
      "1px solid #e3ece9",
    backdropFilter:
      "blur(10px)",
  },


  navbar: {
    width: "92%",
    maxWidth: "1180px",
    margin: "0 auto",
    minHeight: "78px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
  },


  logoButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
  },


  logoMark: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    background: "#167c68",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "21px",
  },


  logo: {
    fontSize: "21px",
    fontWeight: "800",
    color: "#123f37",
    lineHeight: 1,
    textAlign: "left",
  },


  logoSub: {
    fontSize: "10px",
    color: "#78918b",
    marginTop: "4px",
    textAlign: "left",
    letterSpacing: "0.5px",
  },


  nav: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },


  navButton: {
    border: "none",
    background: "transparent",
    color: "#5f7771",
    padding: "10px 13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },


  navButtonActive: {
    border: "none",
    background: "#e8f5f1",
    color: "#126b5b",
    padding: "10px 13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
  },


  navCTA: {
    border: "none",
    background: "#167c68",
    color: "#ffffff",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },


  // ----------------------------------------------------------
  // HERO
  // ----------------------------------------------------------

  hero: {
    background:
      "linear-gradient(135deg, #eaf6f2 0%, #f8fcfb 55%, #eef7f4 100%)",
    padding: "85px 0 75px",
  },


  heroContent: {
    width: "92%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "1.25fr 0.75fr",
    gap: "55px",
    alignItems: "center",
  },


  heroText: {
    maxWidth: "650px",
  },


  eyebrow: {
    color: "#16806b",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "2px",
    margin: "0 0 12px",
  },


  heroTitle: {
    fontSize: "52px",
    lineHeight: "1.08",
    margin: 0,
    color: "#143d35",
    letterSpacing: "-1.5px",
  },


  heroHighlight: {
    color: "#167c68",
  },


  heroDescription: {
    fontSize: "18px",
    lineHeight: "1.7",
    color: "#607872",
    maxWidth: "600px",
    marginTop: "22px",
  },


  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "30px",
  },


  primaryButton: {
    border: "none",
    background: "#167c68",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 23px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },


  secondaryButton: {
    border: "1px solid #a7cfc5",
    background: "#ffffff",
    color: "#176c5c",
    borderRadius: "10px",
    padding: "14px 23px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },


  heroCard: {
    background: "#ffffff",
    borderRadius: "22px",
    padding: "35px",
    border:
      "1px solid #dcebe7",
    boxShadow:
      "0 18px 50px rgba(30,85,73,0.10)",
  },


  heroIcon: {
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    background: "#e8f5f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "27px",
    marginBottom: "20px",
  },


  heroCardTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#193f38",
  },


  heroCardText: {
    color: "#6c827d",
    lineHeight: "1.65",
    marginTop: "10px",
  },


  heroSteps: {
    marginTop: "25px",
    display: "grid",
    gap: "10px",
  },


  step: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#45655e",
    fontSize: "14px",
  },


  stepNumber: {
    width: "27px",
    height: "27px",
    borderRadius: "50%",
    background: "#167c68",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
  },


  // ----------------------------------------------------------
  // FEATURES
  // ----------------------------------------------------------

  featureSection: {
    width: "92%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "85px 0",
  },


  sectionHeading: {
    textAlign: "center",
    marginBottom: "40px",
  },


  sectionTitle: {
    fontSize: "32px",
    margin: 0,
    color: "#183f37",
  },


  sectionSubtitle: {
    color: "#718681",
    marginTop: "9px",
  },


  featureGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "22px",
  },


  featureCard: {
    background: "#ffffff",
    border:
      "1px solid #dfebe8",
    borderRadius: "18px",
    padding: "27px",
    boxShadow:
      "0 8px 25px rgba(34,75,66,0.05)",
  },


  featureIcon: {
    fontSize: "28px",
    marginBottom: "17px",
  },


  featureDescription: {
    color: "#6e817d",
    lineHeight: "1.6",
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


  // ----------------------------------------------------------
  // HOW IT WORKS
  // ----------------------------------------------------------

  infoSection: {
    background: "#ffffff",
    padding: "75px 8%",
    borderTop:
      "1px solid #e4eeeb",
    borderBottom:
      "1px solid #e4eeeb",
    display: "grid",
    gridTemplateColumns:
      "minmax(280px, 0.8fr) minmax(500px, 1.2fr)",
    columnGap: "70px",
    alignItems: "start",
  },


  infoHeading: {
    maxWidth: "430px",
  },


  sectionTitleLeft: {
    fontSize: "38px",
    lineHeight: "1.2",
    color: "#183f37",
    margin: 0,
  },


  infoIntro: {
    color: "#718681",
    lineHeight: "1.7",
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
    gridTemplateColumns:
      "55px minmax(0, 1fr)",
    columnGap: "25px",
    alignItems: "start",
    paddingBottom: "30px",
  },


  workflowNumber: {
    color: "#16806b",
    fontWeight: "800",
    fontSize: "16px",
    paddingTop: "2px",
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


  // ----------------------------------------------------------
  // GENERAL PAGE
  // ----------------------------------------------------------

  pageSection: {
    width: "92%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "65px 0 90px",
  },


  pageHeading: {
    textAlign: "center",
    maxWidth: "750px",
    margin: "0 auto 45px",
  },


  pageTitle: {
    margin: 0,
    fontSize: "40px",
    color: "#173e36",
  },


  pageDescription: {
    color: "#6f817d",
    lineHeight: "1.7",
    fontSize: "16px",
    marginTop: "12px",
  },


  // ----------------------------------------------------------
  // ANALYZE
  // ----------------------------------------------------------

  analysisGrid: {
    display: "grid",
    gridTemplateColumns:
      "0.85fr 1.15fr",
    gap: "25px",
    alignItems: "start",
  },


  analysisCard: {
    background: "#ffffff",
    border:
      "1px solid #deebe7",
    borderRadius: "18px",
    padding: "28px",
    boxShadow:
      "0 8px 25px rgba(34,75,66,0.05)",
  },


  muted: {
    color: "#83938f",
    fontSize: "13px",
  },


  uploadArea: {
    marginTop: "20px",
    minHeight: "180px",
    border:
      "2px dashed #b9d8d0",
    borderRadius: "15px",
    background: "#f8fcfb",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    textAlign: "center",
    gap: "7px",
  },


  uploadIcon: {
    fontSize: "32px",
    marginBottom: "7px",
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
  },


  preview: {
    width: "100%",
    maxWidth: "320px",
    maxHeight: "320px",
    objectFit: "cover",
    borderRadius: "13px",
    marginTop: "10px",
    border:
      "1px solid #dbe8e5",
  },


  error: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "9px",
    background: "#fff0ef",
    color: "#a64239",
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
    padding: "30px",
  },


  emptyIcon: {
    fontSize: "45px",
    marginBottom: "15px",
  },


  resultCondition: {
    fontSize: "32px",
    color: "#167c68",
    margin: "5px 0 8px",
  },


  resultIntro: {
    color: "#71827e",
    lineHeight: "1.6",
  },


  resultDivider: {
    height: "1px",
    background: "#e4eeeb",
    margin: "25px 0",
  },


  resultInfo: {
    color: "#566f69",
    lineHeight: "1.65",
  },


  recommendationBox: {
    marginTop: "20px",
    padding: "19px",
    background: "#f7fbfa",
    border:
      "1px solid #e0ece9",
    borderRadius: "12px",
  },


  nutritionBox: {
    marginTop: "20px",
    padding: "20px",
    background: "#edf8f4",
    border:
      "1px solid #cfe7df",
    borderRadius: "12px",
  },


  warning: {
    marginTop: "20px",
    padding: "17px",
    background: "#fff8ed",
    borderLeft:
      "4px solid #e8a43b",
    borderRadius: "7px",
    color: "#765321",
    lineHeight: "1.55",
    fontSize: "13px",
  },


  // ----------------------------------------------------------
  // CONDITIONS
  // ----------------------------------------------------------

  conditionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "20px",
  },


  conditionCard: {
    textAlign: "left",
    border:
      "1px solid #deebe7",
    background: "#ffffff",
    borderRadius: "17px",
    padding: "25px",
    cursor: "pointer",
    boxShadow:
      "0 7px 23px rgba(34,75,66,0.05)",
  },


  conditionIcon: {
    fontSize: "27px",
    marginBottom: "12px",
  },


  learnMore: {
    display: "inline-block",
    marginTop: "10px",
    color: "#167c68",
    fontSize: "14px",
    fontWeight: "700",
  },


  detailPage: {
    maxWidth: "900px",
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
  },


  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, 1fr)",
    gap: "18px",
  },


  detailCard: {
    background: "#ffffff",
    border:
      "1px solid #deebe7",
    borderRadius: "15px",
    padding: "22px",
    lineHeight: "1.65",
  },


  infoBanner: {
    marginTop: "24px",
    padding: "20px",
    background: "#edf7f4",
    borderRadius: "13px",
    color: "#49665f",
    lineHeight: "1.6",
  },


  // ----------------------------------------------------------
  // ABOUT
  // ----------------------------------------------------------

  aboutGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "20px",
    maxWidth: "1050px",
    margin: "0 auto",
  },


  aboutCard: {
    background: "#ffffff",
    border:
      "1px solid #deebe7",
    borderRadius: "17px",
    padding: "27px",
    lineHeight: "1.65",
    color: "#607671",
  },


  // ----------------------------------------------------------
  // FOOTER
  // ----------------------------------------------------------

  footer: {
    background: "#143b34",
    color: "#ffffff",
    padding: "38px 8% 20px",
  },


  footerInner: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
  },


  footerLogo: {
    fontSize: "22px",
    fontWeight: "800",
  },


  footerText: {
    color: "#b9d0ca",
    fontSize: "13px",
    maxWidth: "320px",
    lineHeight: "1.6",
  },


  footerLinks: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
  },


  footerButton: {
    border: "none",
    background: "transparent",
    color: "#d7e7e2",
    cursor: "pointer",
  },


  footerBottom: {
    maxWidth: "1180px",
    margin: "30px auto 0",
    paddingTop: "18px",
    borderTop:
      "1px solid rgba(255,255,255,0.15)",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    color: "#a9c2bc",
    fontSize: "11px",
  },
};


export default App;