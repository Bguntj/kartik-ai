import { useEffect, useState } from "react";
import "../../styles/settings.css";

export default function Settings({
  user,
  onClose,
}) {

  const [activeTab, setActiveTab] =
    useState("general");

  const [darkMode, setDarkMode] =
    useState(true);

  const [animations, setAnimations] =
    useState(true);

  const [sound, setSound] =
    useState(true);

  const [enterToSend, setEnterToSend] =
    useState(true);

  // ==========================================
  // LOAD SETTINGS
  // ==========================================

  useEffect(() => {

    const savedDarkMode =
      localStorage.getItem("kartik_dark_mode");

    const savedAnimations =
      localStorage.getItem("kartik_animations");

    const savedSound =
      localStorage.getItem("kartik_sound");

    const savedEnter =
      localStorage.getItem("kartik_enter_send");

    if (savedDarkMode !== null) {
      setDarkMode(
        savedDarkMode === "true"
      );
    }

    if (savedAnimations !== null) {
      setAnimations(
        savedAnimations === "true"
      );
    }

    if (savedSound !== null) {
      setSound(
        savedSound === "true"
      );
    }

    if (savedEnter !== null) {
      setEnterToSend(
        savedEnter === "true"
      );
    }

  }, []);

  // ==========================================
  // SAVE SETTINGS
  // ==========================================

  const updateSetting = (
    key,
    value,
    setter
  ) => {

    setter(value);

    localStorage.setItem(
      key,
      String(value)
    );
  };

  // ==========================================
  // CLOSE ON ESCAPE
  // ==========================================

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "Escape") {
        onClose();
      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [onClose]);

  // ==========================================
  // RESET
  // ==========================================

  const resetSettings = () => {

    setDarkMode(true);
    setAnimations(true);
    setSound(true);
    setEnterToSend(true);

    localStorage.setItem(
      "kartik_dark_mode",
      "true"
    );

    localStorage.setItem(
      "kartik_animations",
      "true"
    );

    localStorage.setItem(
      "kartik_sound",
      "true"
    );

    localStorage.setItem(
      "kartik_enter_send",
      "true"
    );
  };

  return (

    <div
      className="settings-overlay"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div className="settings-modal">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="settings-header">

          <div>

            <h2>
              Settings
            </h2>

            <p>
              Customize your Kartik AI experience
            </p>

          </div>

          <button
            className="settings-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* ======================================
            BODY
        ====================================== */}

        <div className="settings-body">

          {/* SIDEBAR */}

          <div className="settings-nav">

            <button
              className={
                activeTab === "general"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveTab("general")
              }
            >
              <span>⚙️</span>
              General
            </button>

            <button
              className={
                activeTab === "appearance"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveTab("appearance")
              }
            >
              <span>🎨</span>
              Appearance
            </button>

            <button
              className={
                activeTab === "chat"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveTab("chat")
              }
            >
              <span>💬</span>
              Chat
            </button>

            <button
              className={
                activeTab === "account"
                  ? "settings-nav-item active"
                  : "settings-nav-item"
              }
              onClick={() =>
                setActiveTab("account")
              }
            >
              <span>👤</span>
              Account
            </button>

          </div>

          {/* CONTENT */}

          <div className="settings-content">

            {/* ==================================
                GENERAL
            ================================== */}

            {activeTab === "general" && (

              <div>

                <h3>
                  General
                </h3>

                <p className="settings-description">
                  Basic Kartik AI preferences.
                </p>

                <div className="setting-card">

                  <div>
                    <strong>
                      Sound Effects
                    </strong>

                    <p>
                      Play sounds for important events.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={sound}
                      onChange={(e) =>
                        updateSetting(
                          "kartik_sound",
                          e.target.checked,
                          setSound
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="setting-card">

                  <div>
                    <strong>
                      Enter to Send
                    </strong>

                    <p>
                      Press Enter to send messages.
                    </p>
                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={enterToSend}
                      onChange={(e) =>
                        updateSetting(
                          "kartik_enter_send",
                          e.target.checked,
                          setEnterToSend
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

              </div>

            )}

            {/* ==================================
                APPEARANCE
            ================================== */}

            {activeTab === "appearance" && (

              <div>

                <h3>
                  Appearance
                </h3>

                <p className="settings-description">
                  Control how Kartik AI looks.
                </p>

                <div className="setting-card">

                  <div>

                    <strong>
                      Dark Mode
                    </strong>

                    <p>
                      Use the dark interface.
                    </p>

                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) =>
                        updateSetting(
                          "kartik_dark_mode",
                          e.target.checked,
                          setDarkMode
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

                <div className="setting-card">

                  <div>

                    <strong>
                      Animations
                    </strong>

                    <p>
                      Enable interface animations.
                    </p>

                  </div>

                  <label className="switch">

                    <input
                      type="checkbox"
                      checked={animations}
                      onChange={(e) =>
                        updateSetting(
                          "kartik_animations",
                          e.target.checked,
                          setAnimations
                        )
                      }
                    />

                    <span className="slider" />

                  </label>

                </div>

              </div>

            )}

            {/* ==================================
                CHAT
            ================================== */}

            {activeTab === "chat" && (

              <div>

                <h3>
                  Chat
                </h3>

                <p className="settings-description">
                  Customize your conversations.
                </p>

                <div className="setting-card">

                  <div>

                    <strong>
                      Chat History
                    </strong>

                    <p>
                      Your conversations are saved
                      automatically.
                    </p>

                  </div>

                  <span className="status-badge">
                    Enabled
                  </span>

                </div>

                <div className="setting-card">

                  <div>

                    <strong>
                      AI Streaming
                    </strong>

                    <p>
                      Show AI responses as they are generated.
                    </p>

                  </div>

                  <span className="status-badge">
                    Enabled
                  </span>

                </div>

              </div>

            )}

            {/* ==================================
                ACCOUNT
            ================================== */}

            {activeTab === "account" && (

              <div>

                <h3>
                  Account
                </h3>

                <p className="settings-description">
                  Your Kartik AI account information.
                </p>

                <div className="account-card">

                  <div className="account-avatar">
                    {user?.username
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div>

                    <strong>
                      {user?.username || "User"}
                    </strong>

                    <p>
                      {user?.email || ""}
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* ======================================
            FOOTER
        ====================================== */}

        <div className="settings-footer">

          <button
            className="reset-settings"
            onClick={resetSettings}
          >
            Reset Settings
          </button>

          <button
            className="settings-done"
            onClick={onClose}
          >
            Done
          </button>

        </div>

      </div>

    </div>
  );
}