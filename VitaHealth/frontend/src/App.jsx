import { useState } from "react";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Image selection
  // --------------------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };


  // --------------------------------------------------
  // Prediction
  // --------------------------------------------------

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
      setError(
        "Unable to connect to the VitaHealth AI server. " +
        "Make sure FastAPI is running."
      );

      console.error(err);

    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div style={styles.page}>

      {/* HEADER */}

      <header style={styles.header}>

        <div>
          <h1 style={styles.logo}>
            VitaHealth
          </h1>

          <p style={styles.tagline}>
            AI-Based Skin Condition Analysis
          </p>
        </div>

      </header>


      {/* MAIN */}

      <main style={styles.container}>

        {/* UPLOAD CARD */}

        <section style={styles.card}>

          <h2 style={styles.title}>
            Skin Condition Analysis
          </h2>

          <p style={styles.description}>
            Upload a skin image to receive an
            AI-based prediction and general
            lifestyle guidance.
          </p>


          {/* UPLOAD */}

          <div style={styles.uploadBox}>

            <h3>
              Upload Skin Image
            </h3>

            <p style={styles.smallText}>
              JPG, JPEG or PNG
            </p>

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageChange}
              style={styles.fileInput}
            />

          </div>


          {/* PREVIEW */}

          {preview && (
            <div style={styles.previewContainer}>

              <h3>
                Selected Image
              </h3>

              <img
                src={preview}
                alt="Skin preview"
                style={styles.preview}
              />

            </div>
          )}


          {/* BUTTON */}

          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            style={{
              ...styles.button,
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


          {/* ERROR */}

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

        </section>


        {/* RESULTS */}

        {result && (

          <section style={styles.card}>

            <h2 style={styles.resultTitle}>
              Prediction Result
            </h2>


            {/* PREDICTION */}

            <div style={styles.predictionBox}>

              <p style={styles.resultLabel}>
                Predicted Condition
              </p>

              <h2 style={styles.prediction}>
                {result.prediction}
              </h2>

              <p style={styles.confidence}>
                Model confidence:{" "}
                <strong>
                  {result.confidence}%
                </strong>
              </p>

            </div>


            {/* PROBABILITIES */}

            <div style={styles.section}>

              <h3>
                Prediction Probabilities
              </h3>

              {Object.entries(
                result.probabilities
              ).map(([name, value]) => (

                <div
                  key={name}
                  style={styles.probabilityRow}
                >

                  <div style={styles.probabilityHeader}>

                    <span>
                      {name}
                    </span>

                    <span>
                      {value}%
                    </span>

                  </div>

                  <div style={styles.progressBackground}>

                    <div
                      style={{
                        ...styles.progress,
                        width: `${value}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>


            {/* DIET */}

            <div style={styles.section}>

              <h3>
                🥗 Diet Guidance
              </h3>

              <ul>

                {result.recommendations.diet.map(
                  (item, index) => (

                    <li
                      key={index}
                      style={styles.listItem}
                    >
                      {item}
                    </li>

                  )
                )}

              </ul>

            </div>


            {/* LIFESTYLE */}

            <div style={styles.section}>

              <h3>
                🌿 Lifestyle Guidance
              </h3>

              <ul>

                {result.recommendations.lifestyle.map(
                  (item, index) => (

                    <li
                      key={index}
                      style={styles.listItem}
                    >
                      {item}
                    </li>

                  )
                )}

              </ul>

            </div>


            {/* NUTRITIONAL SUPPORT */}

            <div style={styles.section}>

              <h3>
                💊 Nutritional Support
              </h3>

              {result.vitamin_recommendation && (

                <div style={styles.vitaminBox}>

                  <h4 style={styles.vitaminTitle}>
                    {result.vitamin_recommendation.nutrient}
                  </h4>

                  <p>
                    <strong>
                      Role:
                    </strong>{" "}
                    {result.vitamin_recommendation.role}
                  </p>

                  <p>
                    <strong>
                      Food Sources:
                    </strong>{" "}
                    {result.vitamin_recommendation.food_sources.join(
                      ", "
                    )}
                  </p>

                </div>

              )}

            </div>


            {/* MEDICAL NOTE */}

            <div style={styles.warning}>

              <strong>
                Important:
              </strong>

              <p style={{ marginTop: "8px" }}>
                {result.recommendations.medical_note}
              </p>

              <p style={{ marginTop: "8px" }}>
                This is an AI prediction and not
                a medical diagnosis. Please consult
                a qualified healthcare professional
                for diagnosis and treatment.
              </p>

            </div>

          </section>

        )}

      </main>


      {/* FOOTER */}

      <footer style={styles.footer}>
        VitaHealth © 2026
      </footer>

    </div>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f8f7",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    color: "#1f2937",
  },


  header: {
    background: "#ffffff",
    padding: "20px 8%",
    borderBottom:
      "1px solid #e5e7eb",
  },


  logo: {
    margin: 0,
    color: "#167c68",
    fontSize: "30px",
  },


  tagline: {
    margin: "5px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },


  container: {
    width: "90%",
    maxWidth: "900px",
    margin: "40px auto",
  },


  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "25px",
    boxShadow:
      "0 4px 20px rgba(0,0,0,0.08)",
  },


  title: {
    textAlign: "center",
    color: "#123c35",
    marginBottom: "10px",
  },


  description: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "30px",
  },


  uploadBox: {
    border: "2px dashed #91c9bd",
    borderRadius: "14px",
    padding: "35px",
    textAlign: "center",
    background: "#f7fcfa",
  },


  smallText: {
    color: "#6b7280",
    fontSize: "14px",
  },


  fileInput: {
    marginTop: "15px",
  },


  previewContainer: {
    textAlign: "center",
    marginTop: "25px",
  },


  preview: {
    width: "280px",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "12px",
    marginTop: "10px",
    border:
      "1px solid #d1d5db",
  },


  button: {
    display: "block",
    margin: "25px auto 0",
    padding: "13px 30px",
    border: "none",
    borderRadius: "8px",
    background: "#167c68",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },


  error: {
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    textAlign: "center",
  },


  resultTitle: {
    textAlign: "center",
    color: "#123c35",
    marginBottom: "20px",
  },


  predictionBox: {
    textAlign: "center",
    padding: "25px",
    background: "#eef8f5",
    borderRadius: "12px",
  },


  resultLabel: {
    color: "#6b7280",
    marginBottom: "5px",
  },


  prediction: {
    color: "#167c68",
    margin: "8px 0",
  },


  confidence: {
    fontSize: "17px",
  },


  section: {
    marginTop: "30px",
  },


  probabilityRow: {
    marginBottom: "14px",
  },


  probabilityHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    marginBottom: "5px",
  },


  progressBackground: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
  },


  progress: {
    height: "100%",
    background: "#167c68",
    borderRadius: "10px",
  },


  listItem: {
    marginBottom: "8px",
    color: "#4b5563",
  },


  // --------------------------------------------------
  // Nutritional Support
  // --------------------------------------------------

  vitaminBox: {
    marginTop: "15px",
    padding: "20px",
    background: "#f7fcfa",
    border: "1px solid #d5ebe5",
    borderRadius: "10px",
  },


  vitaminTitle: {
    color: "#167c68",
    fontSize: "20px",
    marginTop: 0,
    marginBottom: "15px",
  },


  warning: {
    marginTop: "30px",
    padding: "16px",
    background: "#fff7ed",
    borderLeft:
      "4px solid #f59e0b",
    borderRadius: "6px",
    color: "#7c4a03",
    fontSize: "14px",
  },


  footer: {
    textAlign: "center",
    padding: "25px",
    color: "#6b7280",
    fontSize: "13px",
  },

};


export default App;