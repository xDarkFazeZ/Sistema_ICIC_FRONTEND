import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./context/AuthContext";
import { EmpresaModalProvider } from "./components/modals/Empresa/EmpresaModalContext";
import AppWithTheme from "./AppWithTheme";
import './global.css';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <EmpresaModalProvider>
          <AppWithTheme />
        </EmpresaModalProvider>
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);