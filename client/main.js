import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Avoid JSX in a .js file so esbuild/Vite doesn't require a jsx loader
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
