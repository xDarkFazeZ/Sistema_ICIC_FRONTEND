import { Card, Input, Button, Switch } from "@heroui/react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "../hooks/useTheme"
import { useState } from "react"

export default function Login() {
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login:", { email, password })
    // Aquí conectarás con tu servicio después
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 relative">
      
      {/* Tarjeta de Login */}
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema ICIC
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Inicia sesión en tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-9">
          <Input
            type="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
            variant="bordered"
            labelPlacement="outside"
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
            variant="bordered"
            labelPlacement="outside"
          />

          <Button 
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
          >
            Iniciar sesión
          </Button>
        </form>
      </Card>

      {/* Botón de modo oscuro - ESQUINA INFERIOR DERECHA */}
      <div className="absolute bottom-6 right-6">
        <Switch
          checked={isDark}
          onChange={toggleTheme}
          size="lg"
          color="primary"
          startContent={<SunIcon className="w-4 h-4" />}
          endContent={<MoonIcon className="w-4 h-4" />}
        />
      </div>
    </div>
  )
}