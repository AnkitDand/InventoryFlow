import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios default base URL
  axios.defaults.baseURL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  console.log("Axios baseURL set to:", axios.defaults.baseURL);

  useEffect(() => {
    console.log("Checking localStorage for token...");
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Found token:", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const userData = localStorage.getItem("user");
      if (userData) {
        console.log("Found user data:", userData);
        setUser(JSON.parse(userData));
      }
    } else {
      console.log("No token found in localStorage.");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log("Attempting login with:", { email, password });
    try {
      const response = await axios.post("/auth/login", { email, password });
      console.log("Login response:", response.data);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      console.log("Login successful. User set:", user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (email, password, companyName) => {
    console.log("Attempting registration with:", {
      email,
      password,
      companyName,
    });
    try {
      const response = await axios.post("/auth/register", {
        email,
        password,
        companyName,
      });
      console.log("Register response:", response.data);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);

      console.log("Registration successful. User set:", user);
      return { success: true };
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    console.log("Logging out user:", user);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
