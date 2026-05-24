import { useState } from "react";
import axios from "axios";
import { identities } from "./data/identities";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("API_BASE_URL:", API_BASE_URL);
const BASE_FACE_SRC = "/images/base_face.png";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read uploaded image."));
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Could not read uploaded image."));
    };

    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [selectedIdentity, setSelectedIdentity] = useState(identities[0]);
  const [displayImage, setDisplayImage] = useState(identities[0].image);
  const [displaySource, setDisplaySource] = useState("curated");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [promptUsed, setPromptUsed] = useState("");
  const [compareView, setCompareView] = useState(false);
  const [savedHistory, setSavedHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [customAnalysis, setCustomAnalysis] = useState(null);
  const [uploadedFaceBase64, setUploadedFaceBase64] = useState(null);
  const [targetPresentation, setTargetPresentation] = useState("feminine");
  const [baseFacePreview, setBaseFacePreview] = useState(BASE_FACE_SRC);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  function handleSelectIdentity(identity) {
    setSelectedIdentity(identity);
    setDisplayImage(identity.image);
    setDisplaySource("curated");
    setErrorMessage("");
    setPromptUsed("");
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setErrorMessage("");
    setPromptUsed("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        identityId: selectedIdentity.id,
        customAnalysis,
        referenceImageBase64: uploadedFaceBase64,
        genderOptions:
          selectedIdentity.id === "gender" ? { targetPresentation } : null
      });
      const generatedImage = response.data.imageUrl || response.data.image;

      if (response.data.success && generatedImage) {
        setDisplayImage(generatedImage);
        setPromptUsed(response.data.promptUsed || "");
        setDisplaySource("api");
      } else {
        setDisplayImage(selectedIdentity.image);
        setDisplaySource("curated");
        setErrorMessage(
          response.data.error ||
            "Live generation is unavailable. Showing the curated portrait instead."
        );
      }
    } catch (error) {
      console.error(error);
      setDisplayImage(selectedIdentity.image);
      setDisplaySource("curated");
      setErrorMessage(
        "Live generation is unavailable. Showing the curated portrait instead."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleFaceUpload(event) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setAnalysisMessage("");
    setAnalysisError("");

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setCustomAnalysis(null);
      setUploadedFaceBase64(null);
      setBaseFacePreview(BASE_FACE_SRC);
      setAnalysisError("Please upload a PNG or JPEG image.");
      input.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setCustomAnalysis(null);
      setUploadedFaceBase64(null);
      setBaseFacePreview(BASE_FACE_SRC);
      setAnalysisError("Please upload an image smaller than 8MB.");
      input.value = "";
      return;
    }

    setIsAnalyzing(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      setBaseFacePreview(dataUrl);
      setUploadedFaceBase64(dataUrl);

      const response = await axios.post(`${API_BASE_URL}/api/analyze-face`, {
        imageBase64: dataUrl
      });

      if (response.data.success && response.data.faceAnalysis) {
        setCustomAnalysis(response.data.faceAnalysis);
        setAnalysisMessage("✓ Dynamic likeness analysis active!");
        setAnalysisError("");
      } else {
        throw new Error(
          response.data.error || "Face analysis did not return usable data."
        );
      }
    } catch (error) {
      console.error(error);
      setCustomAnalysis(null);
      setUploadedFaceBase64(null);
      setBaseFacePreview(BASE_FACE_SRC);
      setAnalysisError(
        "Could not analyze this image. Using default face instead."
      );
    } finally {
      setIsAnalyzing(false);
      input.value = "";
    }
  }

  function handleImageError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = BASE_FACE_SRC;
  }

  function handleSaveToHistory() {
    const now = new Date();
    const historyItem = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      identityId: selectedIdentity.id,
      title: selectedIdentity.title,
      image: displayImage,
      source: displaySource === "api" ? "API Gen" : "Curated",
      timestamp: now.toISOString()
    };

    setSavedHistory((prev) => [historyItem, ...prev]);
    setIsHistoryOpen(true);
  }

  function handleDeleteHistory(itemId) {
    setSavedHistory((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function handleDownload() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ManyLives_${selectedIdentity.id}_${timestamp}.png`;

      let downloadUrl = displayImage;
      let revokeUrl = null;

      if (!displayImage.startsWith("data:")) {
        const response = await fetch(displayImage);
        if (!response.ok) {
          throw new Error("Failed to fetch image.");
        }
        const blob = await response.blob();
        downloadUrl = URL.createObjectURL(blob);
        revokeUrl = downloadUrl;
      }

      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      if (revokeUrl) {
        URL.revokeObjectURL(revokeUrl);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Download failed. Please try again.");
    }
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="hero">
          <p className="project-label">AI + Art Final Project · 楊妤安 111006211</p>
          <h1>The Many Lives of One Face</h1>
          <p>
            A dark AI portrait gallery exploring how one face can move through
            age, memory, gender, work, ambition, and imagined selves.
          </p>
        </header>

        <section className="gallery-layout" aria-label="Portrait gallery">
          <aside className="panel base-panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Base Face</p>
                <h2>Present Self</h2>
              </div>
              <span className="status-pill">
                {customAnalysis ? "Dynamic" : "Default"}
              </span>
            </div>

            <div className="base-preview">
              <img
                src={baseFacePreview}
                alt="Base face reference"
                onError={handleImageError}
              />
            </div>

            <p className="panel-copy">
              The reference portrait anchors each transformation so every
              generated life remains connected to the same visual identity.
            </p>

            <div className="upload-section">
              <input
                id="face-upload"
                className="upload-input"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFaceUpload}
                disabled={isAnalyzing}
              />
              <label
                htmlFor="face-upload"
                className={`upload-button ${isAnalyzing ? "loading" : ""}`}
                aria-disabled={isAnalyzing}
              >
                {isAnalyzing && <span className="spinner" aria-hidden="true" />}
                {isAnalyzing
                  ? "📁 Analyzing features..."
                  : "Upload Your Own Face"}
              </label>
              {analysisMessage && (
                <p className="upload-status-success">{analysisMessage}</p>
              )}
              {analysisError && (
                <p className="upload-status-warning">{analysisError}</p>
              )}
            </div>
          </aside>

          <section className="panel portrait-panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Generated Portrait</p>
                <h2>{selectedIdentity.title}</h2>
              </div>
              <span className="status-pill">
                {isGenerating
                  ? "Generating"
                  : displaySource === "api"
                    ? "API Gen"
                    : "Curated"}
              </span>
            </div>

            <p className="panel-copy">{selectedIdentity.description}</p>

            {selectedIdentity.id === "gender" && (
              <div className="gender-toggle" aria-label="Gender target look">
                <p className="gender-toggle-label">Target Look:</p>
                <div className="gender-toggle-buttons">
                  <button
                    className={`gender-toggle-button ${
                      targetPresentation === "masculine" ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => setTargetPresentation("masculine")}
                  >
                    Masculine Version
                  </button>
                  <button
                    className={`gender-toggle-button ${
                      targetPresentation === "feminine" ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => setTargetPresentation("feminine")}
                  >
                    Feminine Version
                  </button>
                </div>
              </div>
            )}

            <div className="portrait-preview">
              {isGenerating && (
                <div className="portrait-loading" aria-hidden="true">
                  <span className="spinner" />
                </div>
              )}
              <img
                src={displayImage}
                alt={selectedIdentity.title}
                className={isGenerating ? "is-generating" : ""}
                onError={handleImageError}
              />
            </div>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="action-row">
              <button
                className="generate-button"
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isAnalyzing}
              >
                {isGenerating
                  ? "Generating..."
                  : isAnalyzing
                    ? "Analyzing..."
                    : "Generate"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
              >
                Download Portrait
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleSaveToHistory}
              >
                Save to History
              </button>
              <button
                className={`secondary-button ${compareView ? "active" : ""}`}
                type="button"
                onClick={() => setCompareView((prev) => !prev)}
              >
                Compare View
              </button>
            </div>
          </section>
        </section>

        <section className="panel identity-section">
          <div className="panel-header">
            <div>
              <p className="section-label">Identity Personas</p>
              <h2>Choose a Life</h2>
            </div>
          </div>

          <div className="identity-grid">
            {identities.map((identity) => (
              <button
                key={identity.id}
                className={`identity-card ${
                  selectedIdentity.id === identity.id ? "selected" : ""
                }`}
                type="button"
                onClick={() => handleSelectIdentity(identity)}
              >
                <span>{identity.id}</span>
                <strong>{identity.title}</strong>
                <small>{identity.description}</small>
              </button>
            ))}
          </div>
        </section>

        <section className={`panel compare-view ${compareView ? "open" : ""}`}>
          <div className="panel-header">
            <div>
              <p className="section-label">Compare View</p>
              <h2>Reference and Transformation</h2>
            </div>
            <span className="status-pill">{compareView ? "Open" : "Closed"}</span>
          </div>

          {compareView ? (
            <div className="compare-grid">
              <figure>
                <img
                  src={baseFacePreview}
                  alt="Base face comparison"
                  onError={handleImageError}
                />
                <figcaption>Present Self</figcaption>
              </figure>
              <figure>
                <img
                  src={displayImage}
                  alt={`${selectedIdentity.title} comparison`}
                  onError={handleImageError}
                />
                <figcaption>{selectedIdentity.title}</figcaption>
              </figure>
            </div>
          ) : (
            <p className="empty-state">
              Compare view is closed. Use the control above to reveal both
              portraits side by side.
            </p>
          )}
        </section>

        <section className="prompt-box">
          <div className="panel-header">
            <div>
              <p className="section-label">Prompt Details</p>
              <h2>Generation Prompt</h2>
            </div>
          </div>
          <pre>
            {promptUsed ||
              "Generate a new version to reveal the live generation prompt."}
          </pre>
        </section>

        <section className="panel saved-history">
          <div className="panel-header">
            <div>
              <p className="section-label">Saved History</p>
              <h2>Session Archive</h2>
            </div>
            <button
              className="secondary-button compact"
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
            >
              {isHistoryOpen ? "Hide" : "Show"}
            </button>
          </div>

          {isHistoryOpen && (
            <div className="history-grid">
              {savedHistory.length === 0 ? (
                <p className="empty-state">
                  Saved portraits will appear here during this session.
                </p>
              ) : (
                savedHistory.map((item) => (
                  <article className="history-card" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={handleImageError}
                    />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                      <em>{item.source}</em>
                    </div>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => handleDeleteHistory(item.id)}
                      aria-label="Delete saved portrait"
                    >
                      ×
                    </button>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
