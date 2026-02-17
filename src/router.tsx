import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Participantes from "./pages/participantes";
import ProtectedRoute from "./components/protectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/participantes",
        element: <Participantes />,
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
]);
