import { useState } from "react";

export default function useTypewriter() {

  const [displayText, setDisplayText] = useState("");

  const typeText = (text) => {

    return new Promise((resolve) => {

      let i = 0;

      setDisplayText("");

      const interval = setInterval(() => {

        setDisplayText(text.slice(0, i + 1));

        i++;

        if (i >= text.length) {

          clearInterval(interval);

          resolve();

        }

      }, 8);

    });

  };

  return {
    displayText,
    typeText,
    setDisplayText,
  };

}