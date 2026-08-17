import "./styles/App.css";

import SpaceBackground from "./components/Space/SpaceBackground";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatArea from "./components/Chat/ChatArea";
import InputBox from "./components/Input/InputBox";
import Toast from "./components/Common/Toast";
import ThinkingPanel from "./components/Chat/ThinkingPanel";
import useWebSocket from "./hooks/useWebSocket";
import useToast from "./hooks/useToast";
import useChat from "./hooks/useChat";
import useSessions from "./hooks/useSessions";

function App() {

    // ============================
    // WebSocket
    // ============================

    const {

    events,

    clearEvents

} = useWebSocket();

    // ============================
    // Toast
    // ============================

    const {
        toast,
        showToast
    } = useToast();

    // ============================
    // Chat
    // ============================

const {
    messages,
    loading,
    sendMessage,
    loadMessages,
    regenerate,
    stopGenerating
} = useChat(clearEvents);

    // ============================
    // Sessions
    // ============================

    const {
        sessions,
        currentSession,
        createSession,
        renameSession,
        deleteSession,
        selectSession
    } = useSessions(loadMessages);

    return (
        <>

            <Toast toast={toast} />

            <SpaceBackground />

            <div className="app">

                <Sidebar
                    sessions={sessions}
                    currentSession={currentSession}
                    createSession={createSession}
                    renameSession={renameSession}
                    deleteSession={deleteSession}
                    selectSession={selectSession}
                />

                <div className="main">
                    <ThinkingPanel events={loading ? events : []} />
                    <ChatArea
                        messages={messages}
                        loading={loading}
                        regenerate={regenerate}
                    />

                    <InputBox
                        currentSession={currentSession}
                        sendMessage={sendMessage}
                        stopGenerating={stopGenerating}
                        loading={loading}
                        showToast={showToast}
                    />

                </div>

            </div>

        </>
    );
}

export default App;