import { useEffect, useState } from "react";

import "./styles/App.css";

import SpaceBackground from "./components/Space/SpaceBackground";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatArea from "./components/Chat/ChatArea";
import InputBox from "./components/Input/InputBox";
import Toast from "./components/Common/Toast";
import ThinkingPanel from "./components/Chat/ThinkingPanel";

import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Settings from "./components/Settings/Settings";

import useWebSocket from "./hooks/useWebSocket";
import useToast from "./hooks/useToast";
import useChat from "./hooks/useChat";
import useSessions from "./hooks/useSessions";
import useUser from "./hooks/useUser";


function App() {

  // ==========================================
  // AUTH TOKEN
  // ==========================================

  const [token, setToken] = useState(
    () => localStorage.getItem("access_token")
  );


  // ==========================================
  // AUTH UI
  // ==========================================

  const [showRegister, setShowRegister] =
    useState(false);

  const [showSettings, setShowSettings] =
    useState(false);


  // ==========================================
  // AUTOMATIC LOGOUT EVENT
  // ==========================================

  useEffect(() => {

    const handleAuthLogout = () => {

      localStorage.removeItem(
        "access_token"
      );

      setToken(null);

      setShowSettings(false);

    };


    window.addEventListener(
      "auth:logout",
      handleAuthLogout
    );


    return () => {

      window.removeEventListener(
        "auth:logout",
        handleAuthLogout
      );

    };

  }, []);


  // ==========================================
  // CURRENT USER
  // ==========================================

  const {
    user,
    loadingUser
  } = useUser(token);


  // ==========================================
  // WEBSOCKET
  // ==========================================

  const {
    events,
    clearEvents
  } = useWebSocket(token);


  // ==========================================
  // TOAST
  // ==========================================

  const {
    toast,
    showToast
  } = useToast();


  // ==========================================
  // CHAT
  // ==========================================

  const {
    messages,
    loading,
    sendMessage,
    loadMessages,
    regenerate,
    stopGenerating
  } = useChat(clearEvents);


  // ==========================================
  // SESSIONS
  // ==========================================

  const {
    sessions,
    currentSession,
    createSession,
    renameSession,
    deleteSession,
    selectSession
  } = useSessions(
    loadMessages,
    token
  );


  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = (newToken) => {

    localStorage.setItem(
      "access_token",
      newToken
    );

    setToken(newToken);

    setShowRegister(false);

    setShowSettings(false);

  };


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = (newToken) => {

    localStorage.setItem(
      "access_token",
      newToken
    );

    setToken(newToken);

    setShowRegister(false);

    setShowSettings(false);

  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    setToken(null);

    setShowSettings(false);

  };


  // ==========================================
  // LOGIN / REGISTER SCREEN
  // ==========================================

  if (!token) {

    return (
      <>

        <SpaceBackground />

        {showRegister ? (

          <Register
            onRegister={handleRegister}
            onSwitch={() =>
              setShowRegister(false)
            }
          />

        ) : (

          <Login
            onLogin={handleLogin}
            onSwitch={() =>
              setShowRegister(true)
            }
          />

        )}

      </>
    );

  }


  // ==========================================
  // USER LOADING
  // ==========================================

  if (loadingUser) {

    return (
      <>

        <SpaceBackground />

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "18px",
            position: "relative",
            zIndex: 10
          }}
        >
          Loading Kartik AI...
        </div>

      </>
    );

  }


  // ==========================================
  // MAIN APPLICATION
  // ==========================================

  return (
    <>

      <Toast toast={toast} />

      <SpaceBackground />


      <div className="app">

        {/* ====================================
            SIDEBAR
        ==================================== */}

        <Sidebar
          sessions={sessions}
          currentSession={currentSession}

          createSession={createSession}
          renameSession={renameSession}
          deleteSession={deleteSession}
          selectSession={selectSession}

          onLogout={handleLogout}

          onSettings={() =>
            setShowSettings(true)
          }

          user={user}
        />


        {/* ====================================
            MAIN CHAT
        ==================================== */}

        <div className="main">

          {/* THINKING / EVENTS */}

          <ThinkingPanel
            events={
              loading
                ? events
                : []
            }
          />


          {/* CHAT */}

          <ChatArea
            messages={messages}
            loading={loading}
            regenerate={regenerate}
          />


          {/* INPUT */}

          <InputBox
            currentSession={currentSession}

            sendMessage={sendMessage}

            stopGenerating={
              stopGenerating
            }

            loading={loading}

            showToast={showToast}
          />

        </div>


        {/* ====================================
            SETTINGS
        ==================================== */}

        {showSettings && (

          <Settings
            user={user}

            onClose={() =>
              setShowSettings(false)
            }
          />

        )}

      </div>

    </>
  );
}


export default App;