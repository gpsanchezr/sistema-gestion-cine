import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetallePelicula from './pages/DetallePelicula';
import Validar from './pages/Validar';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Esta es la pantalla de inicio con Intensamente 2 */}
        <Route path="/" element={<Home />} />
        
        {/* Esta es la pantalla donde aparecerán los 150 asientos */}
        <Route path="/pelicula/:id" element={<DetallePelicula />} />

        {/* Página para validar tiquetes */}
        <Route path="/validar" element={<Validar />} />

        {/* Panel administrativo */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;