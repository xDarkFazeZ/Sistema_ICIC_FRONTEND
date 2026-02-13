import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { router } from "./router";
import { AuthProvider } from "./context/AuthContext"; // 👈 IMPORTANTE
import './global.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider> {/* 👈 ENVUELVE TODO */}
        <RouterProvider router={router} />
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
