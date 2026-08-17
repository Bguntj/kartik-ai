import { useState, useEffect } from "react";
import API from "../services/api";

export default function useSessions(loadMessages, token) {

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // ==========================================
  // Fetch Sessions
  // ==========================================

  const fetchSessions = async () => {

    if (!token) {
      setSessions([]);
      setCurrentSession(null);
      return;
    }

    try {

      const res = await API.get("/sessions");

      if (res.data.length === 0) {

        const newRes = await API.post("/sessions");

        const first = {
          id: newRes.data.session_id,
          title: newRes.data.title,
        };

        setSessions([first]);
        setCurrentSession(first.id);

        await loadMessages(first.id);

        return;
      }

      setSessions(res.data);

      const firstSession = res.data[0];

      setCurrentSession(firstSession.id);

      await loadMessages(firstSession.id);

    } catch (err) {

      console.error("❌ Failed to fetch sessions:", err);

      setSessions([]);
      setCurrentSession(null);

    }
  };

  // ==========================================
  // IMPORTANT:
  // Run whenever login user/token changes
  // ==========================================

  useEffect(() => {

    setSessions([]);
    setCurrentSession(null);

    if (token) {
      fetchSessions();
    }

  }, [token]);

  // ==========================================
  // Create Session
  // ==========================================

  const createSession = async () => {

    try {

      const res = await API.post("/sessions");

      const newChat = {
        id: res.data.session_id,
        title: res.data.title,
      };

      setSessions((prev) => [
        newChat,
        ...prev,
      ]);

      setCurrentSession(newChat.id);

      await loadMessages(newChat.id);

    } catch (err) {

      console.error("❌ Failed to create session:", err);

    }
  };

  // ==========================================
  // Select Session
  // ==========================================

  const selectSession = async (id) => {

    setCurrentSession(id);

    await loadMessages(id);

  };

  // ==========================================
  // Rename Session
  // ==========================================

  const renameSession = async (id, title) => {

    try {

      await API.put(`/sessions/${id}`, {
        title,
      });

      await fetchSessions();

    } catch (err) {

      console.error("❌ Failed to rename session:", err);

    }
  };

  // ==========================================
  // Delete Session
  // ==========================================

  const deleteSession = async (id) => {

    try {

      await API.delete(`/sessions/${id}`);

      await fetchSessions();

    } catch (err) {

      console.error("❌ Failed to delete session:", err);

    }
  };

  return {
    sessions,
    currentSession,
    createSession,
    renameSession,
    deleteSession,
    selectSession,
    fetchSessions,
  };
}