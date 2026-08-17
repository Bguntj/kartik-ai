import { useState, useRef } from "react";
import { handleUpload } from "../../utils/uploadHandler";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import ImagePreview from "../Common/ImagePreview";

export default function InputBox({
  currentSession,
  sendMessage,
  stopGenerating,
  loading,
  showToast,
}) {

  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileRef = useRef(null);
  const imageRef = useRef(null);

  const { listening, startListening } =
    useSpeechRecognition((transcript) => {
      setText(transcript);
    });

  const handleSend = () => {

    if (!text.trim()) return;

    if (!currentSession) {

      showToast?.(
        "Please create a chat first.",
        "error"
      );

      return;

    }

    sendMessage(currentSession, text);

    setText("");

  };

  const upload = async (file) => {

    if (!file || !currentSession) return;

    try {

      setUploading(true);

      await handleUpload(
        currentSession,
        file
      );

      showToast?.(
        `${file.name} uploaded successfully`,
        "success"
      );

    } catch (err) {

      console.error(err);

      showToast?.(
        "Upload Failed",
        "error"
      );

    } finally {

      setUploading(false);

    }

  };

  return (

    <div className="input-box">

      {/* Document Upload */}

      <button
        className="upload-btn"
        disabled={uploading || loading}
        onClick={() => fileRef.current.click()}
      >
        📄
      </button>

      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => {

          const file = e.target.files[0];

          upload(file);

          e.target.value = "";

        }}
      />

      {/* Image Upload */}

      <button
        className="upload-btn"
        disabled={uploading || loading}
        onClick={() => imageRef.current.click()}
      >
        🖼️
      </button>

      <input
        type="file"
        ref={imageRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={(e) => {

          const file = e.target.files[0];

          if (!file) return;

          setSelectedImage(file);

          e.target.value = "";

        }}
      />

      {selectedImage && (

        <ImagePreview
          image={selectedImage}
          onRemove={() =>
            setSelectedImage(null)
          }
        />

      )}

      {/* Voice */}

      <button
        className="upload-btn"
        disabled={loading}
        onClick={startListening}
      >
        {listening ? "🔴" : "🎤"}
      </button>

      {/* Text */}

      <input

        value={text}

        placeholder="Ask Kartik AI anything..."

        onChange={(e) =>
          setText(e.target.value)
        }

        onKeyDown={(e) => {

          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {

            e.preventDefault();

            handleSend();

          }

        }}

      />

      {/* Stop / Send */}

      {loading ? (

        <button
          className="stop-btn"
          onClick={stopGenerating}
        >
          ⏹ Stop
        </button>

      ) : (

        <button

          onClick={async () => {

            if (selectedImage) {

              await upload(selectedImage);

              setSelectedImage(null);

            }

            handleSend();

          }}

        >

          Send

        </button>

      )}

    </div>

  );

}