import { useEffect, useState } from "react";
import API from "../services/api";

export default function useUser(token) {

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {

    if (!token) {
      setUser(null);
      setLoadingUser(false);
      return;
    }

    const fetchUser = async () => {

      try {

        const response = await API.get("/auth/me");

        setUser(response.data);

      } catch (error) {

        console.error("Failed to load user:", error);

        setUser(null);

      } finally {

        setLoadingUser(false);

      }

    };

    fetchUser();

  }, [token]);

  return {
    user,
    loadingUser,
  };

}