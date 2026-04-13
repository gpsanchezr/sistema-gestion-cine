import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Cartelera from './pages/Cartelera';
import MovieDetails from './pages/MovieDetails';
import Validar from './pages/Validar';
import DashboardAdmin from './pages/DashboardAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import MisTiquetes from './pages/MisTiquetes';
import NotFound from './pages/NotFound';
import CineBot from './components/CineBot';

function App() {
  return (
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster
        position="bottom-right"
        richColors
        theme="dark"
        expand
      />
      <Navbar />

      <Routes>
        <Route path="/" element={<Cartelera />} />
        <Route path="/pelicula/:id" element={<MovieDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route
          path="/mis-tiquetes"
          element={
            <ProtectedRoute>
              <MisTiquetes />
            </ProtectedRoute>
          }
        />
        <Route path="/validar" element={<Validar />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashboardAdmin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <CineBot />
    </BrowserRouter>
  );
}

export default App;

