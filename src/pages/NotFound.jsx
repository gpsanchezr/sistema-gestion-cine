import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--dark-bg)', color: 'white' }}>
      <div style={{ textAlign: 'center', maxWidth: '520px' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>
          Lo sentimos, la página que buscas no existe. Regresa a la cartelera o explora las funciones disponibles.
        </p>
        <Link to="/" className="btn btn-primary">
          Volver a la cartelera
        </Link>
      </div>
    </div>
  );
}
