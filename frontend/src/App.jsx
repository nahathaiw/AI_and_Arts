import { useState } from "react";
import axios from "axios";
import { identities } from "./data/identities";

const API_BASE_URL = "http://localhost:5050";
const BASE_FACE_SRC = "/images/base_face.png";

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
        identityId: selectedIdentity.id
      });

      if (response.data.success && response.data.image) {
        setDisplayImage(response.data.image);
        setPromptUsed(response.data.promptUsed || "");
        setDisplaySource("api");
      } else {
        setDisplayImage(selectedIdentity.image);
        setDisplaySource("curated");
        setErrorMessage(
          response.data.error ||
            "Live generation failed. Showing curated version instead."
        );
      }
    } catch (error) {
      console.error(error);
      setDisplayImage(selectedIdentity.image);
      setDisplaySource("curated");
      setErrorMessage(
        "Live generation failed. Showing curated version instead."
      );
    } finally {
      setIsGenerating(false);
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

      // Supports both data URLs and local asset paths.
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10 space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">
            AI + Art Final Project · 楊妤安 111006211
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-neutral-50 md:text-5xl">
            The Many Lives of One Face
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-neutral-400">
            A curated AI portrait gallery with a live Gemini transformation
            engine. Explore eight identities, compare the base anchor, and save
            the lives that resonate with you.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-8">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-[0_0_60px_-30px_rgba(16,185,129,0.45)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                    Selected Identity
                  </p>
                  <h2 className="text-2xl font-semibold text-neutral-50">
                    {selectedIdentity.title}
                  </h2>
                  <p className="mt-1 text-sm text-neutral-400">
                    {selectedIdentity.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 px-4 py-2 text-xs text-neutral-300">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isGenerating ? "bg-emerald-400" : "bg-neutral-500"
                    }`}
                  />
                  {isGenerating ? "Generating" : "Ready"}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div
                  className={`overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 transition-all duration-300 ${
                    compareView
                      ? "grid gap-4 p-4 md:grid-cols-2"
                      : "p-6"
                  }`}
                >
                  {compareView ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                          Base Anchor
                        </p>
                        <img
                          src={BASE_FACE_SRC}
                          alt="Base anchor"
                          className="aspect-[4/5] w-full rounded-xl border border-neutral-800 object-cover grayscale"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                          Mutated Self
                        </p>
                        <img
                          src={displayImage}
                          alt={selectedIdentity.title}
                          className={`aspect-[4/5] w-full rounded-xl border border-neutral-800 object-cover transition ${
                            isGenerating ? "animate-pulse opacity-70" : ""
                          }`}
                          onError={handleImageError}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-neutral-500">
                        <span>Mutated Self</span>
                        <span className="rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-[10px] text-neutral-300">
                          {displaySource === "api" ? "API Gen" : "Curated"}
                        </span>
                      </div>
                      <img
                        src={displayImage}
                        alt={selectedIdentity.title}
                        className={`aspect-[4/5] w-full rounded-xl border border-neutral-800 object-cover transition ${
                          isGenerating ? "animate-pulse opacity-70" : ""
                        }`}
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-5 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate New Version"}
                  </button>
                  <button
                    className="rounded-full border border-neutral-700 bg-neutral-900/60 px-5 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleDownload}
                    disabled={isGenerating}
                  >
                    Download Portrait
                  </button>
                  <button
                    className="rounded-full border border-neutral-700 bg-neutral-900/60 px-5 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-neutral-100"
                    onClick={handleSaveToHistory}
                  >
                    Save to History
                  </button>
                  <button
                    className={`rounded-full border px-5 py-2 text-sm transition ${
                      compareView
                        ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-100"
                        : "border-neutral-700 bg-neutral-900/60 text-neutral-200 hover:border-neutral-500 hover:text-neutral-100"
                    }`}
                    onClick={() => setCompareView((prev) => !prev)}
                  >
                    Compare View
                  </button>
                </div>

                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60">
                  <details className="group px-5 py-4">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-200 transition group-open:text-emerald-200">
                      Prompt viewport
                    </summary>
                    <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 font-mono text-xs leading-relaxed text-neutral-300">
                      {promptUsed
                        ? promptUsed
                        : "Generate a new version to reveal the live Gemini prompt."}
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/30 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                Identity Configurations
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {identities.map((identity) => (
                  <button
                    key={identity.id}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selectedIdentity.id === identity.id
                        ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                        : "border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-600 hover:text-neutral-100"
                    }`}
                    onClick={() => handleSelectIdentity(identity)}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                      {identity.id}
                    </p>
                    <p className="mt-2 font-medium">{identity.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-300">
                  Saved Lives
                </h3>
                <button
                  className="text-xs text-neutral-500 transition hover:text-neutral-300"
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                >
                  {isHistoryOpen ? "Hide" : "Show"}
                </button>
              </div>

              {isHistoryOpen && (
                <div className="mt-4 space-y-3">
                  {savedHistory.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-neutral-800 px-4 py-6 text-center text-xs text-neutral-500">
                      Save a portrait to start your session archive.
                    </p>
                  ) : (
                    savedHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-3"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl border border-neutral-800 object-cover"
                          onError={handleImageError}
                        />
                        <div className="flex-1 space-y-1 text-xs">
                          <p className="font-semibold text-neutral-200">
                            {item.title}
                          </p>
                          <p className="text-neutral-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${
                              item.source === "API Gen"
                                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                                : "border-neutral-700 bg-neutral-800/60 text-neutral-300"
                            }`}
                          >
                            {item.source}
                          </span>
                        </div>
                        <button
                          className="rounded-full border border-neutral-800 bg-neutral-900/80 p-2 text-neutral-400 transition hover:border-rose-500/40 hover:text-rose-200"
                          onClick={() => handleDeleteHistory(item.id)}
                          aria-label="Delete saved life"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M9 3a1 1 0 0 0-1 1v1H5.75a.75.75 0 0 0 0 1.5h.62l.7 11.1A2.25 2.25 0 0 0 9.31 20h5.38a2.25 2.25 0 0 0 2.24-2.4l.7-11.1h.62a.75.75 0 0 0 0-1.5H16V4a1 1 0 0 0-1-1H9zm2 5.25c.41 0 .75.34.75.75v7a.75.75 0 0 1-1.5 0v-7c0-.41.34-.75.75-.75zm4 0c.41 0 .75.34.75.75v7a.75.75 0 0 1-1.5 0v-7c0-.41.34-.75.75-.75z" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 text-xs text-neutral-400">
              <p className="uppercase tracking-[0.3em] text-neutral-500">
                Base Anchor
              </p>
              <img
                src={BASE_FACE_SRC}
                alt="Base face"
                className="mt-3 aspect-[4/5] w-full rounded-2xl border border-neutral-800 object-cover grayscale"
                onError={handleImageError}
              />
              <p className="mt-3 text-[11px] leading-relaxed">
                The original reference portrait. Use compare view to align this
                with every mutation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
