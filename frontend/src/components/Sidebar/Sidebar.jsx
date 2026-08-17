import { useMemo, useState } from "react";
import "../../styles/sidebar.css";

export default function Sidebar({
  sessions = [],
  currentSession,
  createSession,
  selectSession,
  renameSession,
  deleteSession,
  onLogout,
  onSettings,
  user,
}) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ==========================================
  // FILTER CHATS
  // ==========================================

  const filteredSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => b.id - a.id)
      .filter((chat) =>
        (chat.title || "New Chat")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
  }, [sessions, search]);

  // ==========================================
  // START RENAME
  // ==========================================

  const startRename = (chat) => {
    setEditingId(chat.id);
    setNewTitle(chat.title || "New Chat");
  };

  // ==========================================
  // FINISH RENAME
  // ==========================================

  const finishRename = async (chatId) => {
    const title = newTitle.trim();

    if (!title) {
      setEditingId(null);
      return;
    }

    try {
      await renameSession(chatId, title);
    } catch (error) {
      console.error("❌ Rename failed:", error);
    }

    setEditingId(null);
  };

  // ==========================================
  // DELETE CHAT
  // ==========================================

  const handleDelete = async (chat) => {
    const ok = window.confirm(
      `Delete "${chat.title || "New Chat"}"?`
    );

    if (!ok) return;

    try {
      await deleteSession(chat.id);
    } catch (error) {
      console.error("❌ Delete failed:", error);
    }
  };

  // ==========================================
  // NEW CHAT
  // ==========================================

  const handleCreateSession = async () => {
    try {
      await createSession();
    } catch (error) {
      console.error("❌ Failed to create chat:", error);
    }
  };

  // ==========================================
  // SETTINGS
  // ==========================================

  const handleSettings = () => {
    setShowProfileMenu(false);

    if (onSettings) {
      onSettings();
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setShowProfileMenu(false);

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside className="sidebar">

      {/* ======================================
          SIDEBAR HEADER
      ====================================== */}

      <div className="sidebar-top">

        <div className="brand">

          <div className="brand-icon">
            ✦
          </div>

          <div className="brand-text">
            <h1>Kartik AI</h1>
            <span>AI Assistant</span>
          </div>

        </div>

        <button
          className="new-chat-btn"
          onClick={handleCreateSession}
        >
          <span className="new-chat-icon">＋</span>
          <span>New Chat</span>
        </button>

        <div className="search-wrapper">

          <span className="search-icon">
            🔍
          </span>

          <input
            className="chat-search"
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

      </div>

      {/* ======================================
          CHAT HISTORY
      ====================================== */}

      <div className="chat-history">

        <div className="history-header">

          <p className="history-title">
            Recent Chats
          </p>

          <span className="chat-count">
            {filteredSessions.length}
          </span>

        </div>

        {filteredSessions.length === 0 ? (

          <div className="empty-chats">

            <div className="empty-chat-icon">
              💬
            </div>

            <span>
              {search
                ? "No chats found"
                : "No conversations yet"}
            </span>

          </div>

        ) : (

          filteredSessions.map((chat) => (

            <div
              key={chat.id}
              className={`chat-item ${
                currentSession === chat.id
                  ? "active"
                  : ""
              }`}
            >

              <div className="chat-item-main">

                <span className="chat-item-icon">
                  💬
                </span>

                {editingId === chat.id ? (

                  <input
                    className="rename-input"
                    value={newTitle}
                    onChange={(e) =>
                      setNewTitle(e.target.value)
                    }
                    onBlur={() =>
                      finishRename(chat.id)
                    }
                    onKeyDown={(e) => {

                      if (e.key === "Enter") {
                        finishRename(chat.id);
                      }

                      if (e.key === "Escape") {
                        setEditingId(null);
                      }

                    }}
                    autoFocus
                  />

                ) : (

                  <span
                    className="chat-title"
                    title={chat.title}
                    onClick={() =>
                      selectSession(chat.id)
                    }
                  >
                    {chat.title || "New Chat"}
                  </span>

                )}

              </div>

              <div className="chat-actions">

                <button
                  className="chat-action-btn"
                  title="Rename"
                  onClick={() =>
                    startRename(chat)
                  }
                >
                  ✏️
                </button>

                <button
                  className="chat-action-btn delete"
                  title="Delete"
                  onClick={() =>
                    handleDelete(chat)
                  }
                >
                  🗑️
                </button>

              </div>

            </div>

          ))

        )}

      </div>

      {/* ======================================
          SIDEBAR FOOTER
      ====================================== */}

      <div className="sidebar-footer">

        {/* PROFILE POPUP */}

        {showProfileMenu && (

          <div className="profile-menu">

            <div className="profile-menu-user">

              <div className="profile-menu-avatar">
                {user?.username
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>

              <div className="profile-menu-details">

                <strong>
                  {user?.username || "User"}
                </strong>

                <span>
                  {user?.email || ""}
                </span>

              </div>

            </div>

            <div className="profile-menu-divider" />

            <button
              className="profile-menu-btn"
              onClick={handleSettings}
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            <button
              className="profile-menu-btn logout-btn"
              onClick={handleLogout}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>

          </div>

        )}

        {/* PROFILE */}

        <button
          className="profile"
          onClick={() =>
            setShowProfileMenu((prev) => !prev)
          }
        >

          <div className="avatar">
            {user?.username
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="profile-info">

            <strong>
              {user?.username || "User"}
            </strong>

            <span>
              {user?.email || "Account"}
            </span>

          </div>

          <span className="profile-arrow">
            {showProfileMenu ? "⌃" : "⋮"}
          </span>

        </button>

      </div>

    </aside>
  );
}