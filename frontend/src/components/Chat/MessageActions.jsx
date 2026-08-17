import { useState } from "react";

export default function MessageActions({
  sender,
  text,
  onRegenerate,
  onEdit,
}) {

  const [copied, setCopied] = useState(false);

  const copyText = async () => {

    try {

      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {

        setCopied(false);

      }, 2000);

    } catch (err) {

      console.error(err);

    }

  };

  return (

    <div className="message-actions">

      <button
        className="action-btn"
        onClick={copyText}
        title="Copy Message"
      >

        {copied ? "✅ Copied" : "📋 Copy"}

      </button>

      {sender === "bot" && (

        <>

          <button
            className="action-btn"
            onClick={onRegenerate}
            title="Regenerate Response"
          >

            🔄 Regenerate

          </button>

          <button
            className="action-btn"
            title="Good Response"
          >

            👍

          </button>

          <button
            className="action-btn"
            title="Bad Response"
          >

            👎

          </button>

        </>

      )}

      {sender === "user" && (

        <button
          className="action-btn"
          onClick={onEdit}
          title="Edit Message"
        >

          ✏️ Edit

        </button>

      )}

    </div>

  );

}