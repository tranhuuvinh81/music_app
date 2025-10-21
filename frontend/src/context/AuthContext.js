// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fullUser, setFullUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser);
          fetchFullUser(decodedUser.id);
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  const fetchFullUser = async (userId) => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      setFullUser(res.data);
    } catch (err) {
      console.error("Error fetching full user:", err);
    }
  };

  const login = async (token) => {
    localStorage.setItem("token", token);
    const decodedUser = jwtDecode(token);
    setUser(decodedUser);
    await fetchFullUser(decodedUser.id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setFullUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        fullUser,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
