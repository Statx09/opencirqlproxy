import React from "react";
import ReactDOM from "react-dom/client";
import LandingPage from "./LandingPage.jsx"; // point to your main page

// Create root and render LandingPage
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>
);
