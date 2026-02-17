import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, Spinner, Switch } from "@heroui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function Login() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //////////////////////////////////////
  // SPLASH TIMER
  //////////////////////////////////////
  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2500);
    const timer2 = setTimeout(() => setShowSplash(false), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  //////////////////////////////////////
  // LOGIN
  //////////////////////////////////////
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(email, password);
      navigate("/dashboard");
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////
  // SPINNER AL LOGEAR
  //////////////////////////////////////
  if (loading) {
    return (
      <div className="h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl opacity-20">
            <div className="w-32 h-32 bg-red-600 rounded-full animate-pulse"></div>
          </div>
          <Spinner size="lg" color="danger" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium animate-pulse">
          Accediendo al sistema...
        </p>
      </div>
    );
  }

  //////////////////////////////////////
  // SPLASH SCREEN
  //////////////////////////////////////
  if (showSplash) {
    return (
      <div
        className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-50 to-red-50 dark:from-black dark:via-gray-950 dark:to-red-950/20 transition-all duration-700 overflow-hidden
        ${fadeOut ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 dark:bg-red-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeOut ? "-translate-y-8 opacity-0" : "translate-y-0 opacity-100"}`}>
          {/* Logo con efecto de aparición */}
          <div className="relative mb-8">
            <div className="absolute inset-0 blur-xl opacity-30">
              <img
                src="/src/assets/images/logo.png"
                className="w-48"
                alt="ICIC Logo blur"
              />
            </div>
            <img
              src="/src/assets/images/logo.png"
              className="w-48 relative z-10 drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
              alt="ICIC Logo"
            />
          </div>

          {/* Texto con animación escalonada */}
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-red-500 dark:via-red-600 dark:to-red-700 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 text-center px-4">
            Fortaleciendo la Construcción
          </h1>

          {/* Línea decorativa */}
          <div className="mt-6 w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-in fade-in duration-1000 delay-500"></div>
        </div>
      </div>
    );
  }

  //////////////////////////////////////
  // LOGIN LAYOUT
  //////////////////////////////////////
  return (
    <div className="h-screen flex overflow-hidden">

      {/* IMAGEN IZQUIERDA */}
      <div className="w-full md:w-2/3 lg:w-3/4 relative hidden md:block animate-in fade-in slide-in-from-left duration-700">
        <img
          src="/src/assets/images/construccion.webp"
          className="h-full w-full object-cover"
          alt="Construcción"
        />

        {/* Overlay con gradiente mejorado */}

        {/* Contenido sobre la imagen */}
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-white animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <div className="max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
              Sistema de Gestión ICIC
            </h2>
            <p className="text-lg lg:text-xl text-gray-100 drop-shadow-md leading-relaxed">
              La Capacitación en la Industria de la Construicción
            </p>
            
            {/* Decorative line */}
            <div className="mt-6 w-24 h-1 bg-white/80"></div>
          </div>
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`
          }}>
        </div>
      </div>

      {/* LOGIN DERECHA */}
      <div className="w-full md:w-1/3 lg:w-2/4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black px-6 py-8 animate-in fade-in slide-in-from-right duration-700 delay-150">

        <div className="w-full max-w-md">
          <Card className="p-8 w-full shadow-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm animate-in fade-in zoom-in duration-500 delay-500">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* Logo y título */}
              <div className="text-center mb-2">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 blur-lg opacity-20">
                    <img
                      src="/src/assets/images/logo.png"
                      className="w-20"
                      alt="ICIC Logo blur"
                    />
                  </div>
                  <img
                    src="/src/assets/images/logo.png"
                    className="w-20 relative z-10 mx-auto drop-shadow-lg"
                    alt="ICIC Logo"
                  />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 dark:from-red-500 dark:to-red-700 mb-1">
                  Sistema ICIC
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ingresa tus credenciales
                </p>
              </div>

              {/* Inputs */}
              <Input
                label="Correo electrónico"
                type="email"
                variant="bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                }}
              />

              <Input
                label="Contraseña"
                type="password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                classNames={{
                  input: "text-gray-900 dark:text-white",
                  inputWrapper: "border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 transition-colors"
                }}
              />

              {/* Error message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Botón de login */}
              <Button
                type="submit"
                size="lg"
                className="font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                Iniciar sesión
              </Button>

              {/* Forgot password link */}
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

            </form>
          </Card>

          {/* Footer text */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
            © 2024 ICIC. Todos los derechos reservados.
          </p>
        </div>

        {/* SWITCH MODO OSCURO */}
        <div className="fixed bottom-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-in fade-in zoom-in duration-500 delay-700">
          <Switch
            isSelected={isDark}
            onValueChange={toggleTheme}
            size="lg"
            classNames={{
              wrapper: "group-data-[selected=true]:bg-red-600"
            }}
            startContent={<SunIcon className="w-4 h-4 text-yellow-500" />}
            endContent={<MoonIcon className="w-4 h-4 text-blue-400" />}
          />
        </div>

      </div>
    </div>
  );
}