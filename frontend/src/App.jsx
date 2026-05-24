import { useState } from "react";
import axios from "axios";
import { identities } from "./data/identities";
import Gallery from "./components/Gallery";

const API_BASE_URL = "http://localhost:5050";

export default function App() {
  const [selectedIdentity, setSelectedIdentity] = useState(identities[0]);
  const [displayImage, setDisplayImage] = useState(identities[0].image);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [promptUsed, setPromptUsed] = useState("");

  function handleSelectIdentity(identity) {
    setSelectedIdentity(identity);
    setDisplayImage(identity.image);
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
      } else {
        setDisplayImage(selectedIdentity.image);
        setErrorMessage(
          response.data.error ||
            "Live generation failed. Showing curated version instead."
        );
      }
    } catch (error) {
      console.error(error);
      setDisplayImage(selectedIdentity.image);
      setErrorMessage(
        "Live generation failed. Showing curated version instead."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Gallery
      identities={identities}
      selectedIdentity={selectedIdentity}
      displayImage={displayImage}
      isGenerating={isGenerating}
      errorMessage={errorMessage}
      promptUsed={promptUsed}
      onSelectIdentity={handleSelectIdentity}
      onGenerate={handleGenerate}
    />
  );
}
