
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sileo";
import { router } from "./router";
import { useTheme } from "./hooks/useTheme";

export default function AppWithTheme() {
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
            : { fill: "#ffffff", roundness: 16 }
        }
      />
      <RouterProvider router={router} />
    </>
  );
}
