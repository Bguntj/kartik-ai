import { useState, useRef } from "react";
import API from "../services/api";

export default function useChat(clearEvents) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const abortController = useRef(null);
    const lastRequest = useRef(null);

    // ==========================================
    // Load Messages
    // ==========================================

    const loadMessages = async (sessionId) => {
        if (!sessionId) return;

        try {
            const res = await API.get(
                `/sessions/${sessionId}/messages`
            );

            setMessages(res.data);

        } catch (err) {
            console.error("❌ Failed to load messages:", err);
        }
    };

    // ==========================================
    // Send Message
    // ==========================================

    const sendMessage = async (sessionId, text) => {
        if (!text || !text.trim()) return;

        // Clear previous AI activity
        if (clearEvents) {
            clearEvents();
        }

        lastRequest.current = {
            sessionId,
            text
        };

        // Add user message
        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text
            }
        ]);

        // Add empty bot message
        setMessages((prev) => [
            ...prev,
            {
                sender: "bot",
                text: ""
            }
        ]);

        setLoading(true);

        abortController.current =
            new AbortController();

        try {
            const token = localStorage.getItem("access_token");

const response = await fetch(
    "http://127.0.0.1:8000/chat/stream",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },

                    body: JSON.stringify({
                        session_id: sessionId,
                        message: text
                    }),

                    signal:
                        abortController.current.signal
                }
            );

            // ==========================================
            // HTTP Error Check
            // ==========================================

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            if (!response.body) {
                throw new Error(
                    "Streaming response body is empty."
                );
            }

            const reader =
                response.body.getReader();

            const decoder =
                new TextDecoder();

            let botText = "";

            // ==========================================
            // Read Stream
            // ==========================================

            while (true) {
                const {
                    done,
                    value
                } = await reader.read();

                if (done) break;

                const chunk =
                    decoder.decode(value, {
                        stream: true
                    });

                botText += chunk;

                setMessages((prev) => {
                    const updated = [...prev];

                    if (
                        updated.length === 0
                    ) {
                        return updated;
                    }

                    updated[
                        updated.length - 1
                    ] = {
                        sender: "bot",
                        text:
                            botText + "▍",
                        streaming: true
                    };

                    return updated;
                });
            }

            // Flush decoder
            botText += decoder.decode();

            // ==========================================
            // Final Bot Message
            // ==========================================

            setMessages((prev) => {
                const updated = [...prev];

                if (
                    updated.length === 0
                ) {
                    return updated;
                }

                updated[
                    updated.length - 1
                ] = {
                    sender: "bot",
                    text: botText,
                    streaming: false
                };

                return updated;
            });

        } catch (err) {

            // ==========================================
            // User Stopped Generation
            // ==========================================

            if (
                err.name === "AbortError"
            ) {
                console.log(
                    "🛑 Generation stopped"
                );

            } else {

                console.error(
                    "❌ Streaming Error:",
                    err
                );

                setMessages((prev) => {
                    const updated = [...prev];

                    if (
                        updated.length === 0
                    ) {
                        return [
                            ...prev,
                            {
                                sender: "bot",
                                text:
                                    "❌ Streaming Error"
                            }
                        ];
                    }

                    updated[
                        updated.length - 1
                    ] = {
                        sender: "bot",
                        text:
                            "❌ Streaming Error",
                        streaming: false
                    };

                    return updated;
                });
            }

        } finally {
            setLoading(false);
            abortController.current = null;
        }
    };

    // ==========================================
    // Stop Generation
    // ==========================================

    const stopGenerating = () => {
        if (
            abortController.current
        ) {
            abortController.current.abort();

            abortController.current = null;

            setLoading(false);
        }
    };

    // ==========================================
    // Regenerate Last Response
    // ==========================================

    const regenerate = () => {
        if (!lastRequest.current) {
            return;
        }

        const {
            sessionId,
            text
        } = lastRequest.current;

        sendMessage(
            sessionId,
            text
        );
    };

    // ==========================================
    // Return
    // ==========================================

    return {
        messages,
        loading,
        loadMessages,
        sendMessage,
        stopGenerating,
        regenerate
    };
}