import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import "./App.css";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">{isAuthenticated ? <Dashboard /> : <Auth />}</div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
