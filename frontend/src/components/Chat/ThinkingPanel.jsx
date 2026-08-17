import "./ThinkingPanel.css";

function ThinkingPanel({ events = [] }) {
    if (!events.length) {
        return null;
    }

    return (
        <div className="thinking-panel">

            <div className="thinking-header">
                <span className="thinking-icon">🧠</span>
                <span>AI Activity</span>
            </div>

            <div className="thinking-events">

                {events.map((event, index) => {

                    const text =
                        typeof event === "string"
                            ? event
                            : event?.message || event?.type || "Processing...";

                    return (
                        <div
                            key={`${index}-${text}`}
                            className="thinking-event"
                        >
                            <span className="thinking-dot">
                                ●
                            </span>

                            <span className="thinking-text">
                                {text}
                            </span>
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default ThinkingPanel;