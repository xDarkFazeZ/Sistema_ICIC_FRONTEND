import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Aquí irán más rutas después */}
      </Routes>
    </BrowserRouter>
  )
}

export default App