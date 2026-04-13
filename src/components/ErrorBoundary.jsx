import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0a0a1a 100%)',
          color: '#f8fafc',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(15,23,42,0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '3rem 2.5rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              margin: '0 0 1rem',
              background: 'linear-gradient(135deg, #ff0080, #00f0ff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Oops
            </h1>
            <p style={{ margin: '0 0 2rem', color: '#94a3b8', fontSize: '1.1rem' }}>
              Algo salio mal. Recarga la pagina o contacta soporte.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #ff0080, #00f0ff)',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

