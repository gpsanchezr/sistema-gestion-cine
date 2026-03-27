import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DetallePelicula from './pages/DetallePelicula';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Esta es la pantalla de inicio con Intensamente 2 */}
        <Route path="/" element={<Home />} />
        
        {/* Esta es la pantalla donde aparecerán los 150 asientos */}
        <Route path="/pelicula/:id" element={<DetallePelicula />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;