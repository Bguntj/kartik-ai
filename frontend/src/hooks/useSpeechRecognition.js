import { useState, useRef } from "react";

export default function useSpeechRecognition(onResult) {

  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  const startListening = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert("Speech Recognition is not supported in this browser.");

      return;

    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

      setListening(true);

    };

    recognition.onend = () => {

      setListening(false);

    };

    recognition.onresult = (event) => {

      const transcript =
        event.results[0][0].transcript;

      onResult(transcript);

    };

    recognition.start();

    recognitionRef.current = recognition;

  };

  return {

    listening,

    startListening,

  };

}
