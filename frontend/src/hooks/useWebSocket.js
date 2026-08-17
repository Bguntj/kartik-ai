import {
    useEffect,
    useState
} from "react";

export default function useWebSocket() {

    const [events, setEvents] = useState([]);

    useEffect(() => {

        const token =
            localStorage.getItem("access_token");

        // --------------------------------------
        // No token = don't connect
        // --------------------------------------

        if (!token) {

            console.log(
                "🔒 No access token. WebSocket not connected."
            );

            return;
        }

        // --------------------------------------
        // Connect WebSocket with JWT
        // --------------------------------------

        const ws =
            new WebSocket(
                `ws://127.0.0.1:8000/ws?token=${encodeURIComponent(token)}`
            );

        ws.onopen = () => {

            console.log(
                "✅ WebSocket Connected"
            );

        };

        ws.onmessage = (event) => {

            try {

                const data =
                    JSON.parse(event.data);

                console.log(
                    "🧠 EVENT:",
                    data
                );

                setEvents(prev => [
                    ...prev,
                    data
                ]);

            } catch (error) {

                console.error(
                    "❌ WebSocket message error:",
                    error
                );

            }

        };

        ws.onerror = (error) => {

            console.error(
                "❌ WebSocket Error:",
                error
            );

        };

        ws.onclose = (event) => {

            console.log(
                "🔌 WebSocket Closed:",
                event.code
            );

        };

        return () => {

            if (
                ws.readyState === WebSocket.OPEN ||
                ws.readyState === WebSocket.CONNECTING
            ) {

                ws.close();

            }

        };

    }, []);

    const clearEvents = () => {

        setEvents([]);

    };

    return {

        events,

        clearEvents

    };

}