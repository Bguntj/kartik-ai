import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import MessageActions from "./MessageActions";

export default function Message({
  sender,
  text,
  onRegenerate,
  onEdit,
}) {

  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = async (code) => {

    try {

      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {

        setCopiedCode("");

      }, 2000);

    } catch (err) {

      console.error(err);

    }

  };

  const isStreaming =
    sender === "bot" &&
    text.endsWith("▍");

  return (

    <div className={`message ${sender}`}>

      <div className="avatar">

        {sender === "user" ? "👤" : "🤖"}

      </div>

      <div className="content">

        <div
          className={
            isStreaming
              ? "streaming"
              : ""
          }
        >

          <ReactMarkdown

            remarkPlugins={[remarkGfm]}

            components={{

              code(props) {

                const {

                  children,
                  className,
                  ...rest

                } = props;

                const match =
                  /language-(\w+)/.exec(
                    className || ""
                  );

                const code =
                  String(children).replace(/\n$/, "");

                // Inline code
                if (!match) {

                  return (

                    <code
                      className={className}
                      {...rest}
                    >

                      {children}

                    </code>

                  );

                }

                // Code Block
                return (

                  <div className="code-box">

                    <button

                      className="copy-btn"

                      onClick={() =>
                        copyCode(code)
                      }

                    >

                      {copiedCode === code
                        ? "Copied!"
                        : "Copy"}

                    </button>

                    <SyntaxHighlighter

                      language={match[1]}

                      style={vscDarkPlus}

                      PreTag="div"

                      {...rest}

                    >

                      {code}

                    </SyntaxHighlighter>

                  </div>

                );

              },

            }}

          >

            {text}

          </ReactMarkdown>

        </div>

        <MessageActions
          sender={sender}
          text={text}
          onRegenerate={onRegenerate}
          onEdit={onEdit}
        />

      </div>

    </div>

  );

}