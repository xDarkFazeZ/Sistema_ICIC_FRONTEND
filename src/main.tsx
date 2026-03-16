// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sileo";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext";
import { useTheme } from "./hooks/useTheme";
import './global.css';


// Componente separado para poder usar el hook useTheme
function AppWithTheme() {
  const { isDark } = useTheme();

  return (
    <>
      <Toaster
        position="top-right"
        options={
          isDark
            ? {
                fill: "#1f2937",
                roundness: 16,
                styles: {
                  title:       "text-white!",
                  description: "text-gray-300!",
                  badge:       "bg-white/10!",
                  button:      "bg-white/10! hover:bg-white/15!",
                },
              }
            : {
                fill: "#ffffff",
                roundness: 16,
              }
        }
      />
      <RouterProvider router={router} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <AppWithTheme />
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);