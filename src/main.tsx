import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext"; // 👈 IMPORTANTE
import { Toaster } from "sileo";
import './global.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider> {/* 👈 ENVUELVE TODO */}
        <Toaster position="bottom-right" />
        <RouterProvider router={router} />
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
