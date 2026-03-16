import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Participantes from "./pages/Participantes/participantes";
import Cursos from "./pages/Cursos/cursos";
import Instructores from "./pages/Instructores/instructores";
import ProtectedRoute from "./components/common/protectedRoute";

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
      {
        path: "/cursos",
        element: <Cursos />,
      },
      {
        path: "/instructores",
        element: <Instructores />,
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" />,
  },
]);