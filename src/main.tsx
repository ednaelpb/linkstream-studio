import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme
const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const isDark = stored ? stored === "dark" : prefersDark;
document.documentElement.classList.add(isDark ? "dark" : "light");

createRoot(document.getElementById("root")!).render(<App />);
