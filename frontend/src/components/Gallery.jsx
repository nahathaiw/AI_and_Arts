import IdentityCard from "./IdentityCard";

export default function Gallery({
  identities,
  selectedIdentity,
  displayImage,
  isGenerating,
  errorMessage,
  promptUsed,
  onSelectIdentity,
  onGenerate
}) {
  return (
    <main className="gallery-page">
      <section className="hero">
        <p className="eyebrow">AI + Art Final Project Demo</p>
        <h1>The Many Lives of One Face</h1>
        <p>
          A hybrid AI portrait gallery: curated images for the final artwork,
          plus one live generation button for the demo.
        </p>
      </section>

      <section className="main-display">
        <div className="base-panel">
          <h2>Base Face</h2>
          <img src="/images/base_face.png" alt="Base face" />
          <p className="small-text">
            Replace this placeholder with your own base face image.
          </p>
        </div>

        <div className="portrait-panel">
          <div className="portrait-heading">
            <div>
              <p className="eyebrow">Selected Identity</p>
              <h2>{selectedIdentity.title}</h2>
            </div>
            <span className="status-badge">
              {isGenerating ? "Generating" : "Ready"}
            </span>
          </div>

          <img
            src={displayImage}
            alt={selectedIdentity.title}
            className={isGenerating ? "loading-image" : ""}
          />

          <p>{selectedIdentity.description}</p>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            className="generate-button"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate New Version"}
          </button>

          <p className="note">
            The curated image is the final artwork. The live button demonstrates
            the real-time AI workflow and falls back safely if generation fails.
          </p>

          {promptUsed && (
            <details className="prompt-box">
              <summary>Prompt used</summary>
              <p>{promptUsed}</p>
            </details>
          )}
        </div>
      </section>

      <section className="identity-grid">
        {identities.map((identity) => (
          <IdentityCard
            key={identity.id}
            identity={identity}
            isSelected={selectedIdentity.id === identity.id}
            onClick={onSelectIdentity}
          />
        ))}
      </section>
    </main>
  );
}
