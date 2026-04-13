import React from 'react';

const Loader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: '#f8fafc',
    fontFamily: 'Inter, sans-serif'
  }}>
    <div style={{
      display: 'inline-flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#ff0080',
        animation: 'pulse 1.4s ease-in-out infinite'
      }}></div>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#00f0ff',
        animation: 'pulse 1.4s ease-in-out infinite 0.3s'
      }}></div>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#0080ff',
        animation: 'pulse 1.4s ease-in-out infinite 0.6s'
      }}></div>
    </div>
    <h2 style={{
      fontSize: '1.5rem',
      margin: 0,
      background: 'linear-gradient(135deg, #ff0080, #00f0ff)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: '700'
    }}>
      🎬 Preparando la sala...
    </h2>
    <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '1rem' }}>
      Tu experiencia cinematográfica carga en segundos
    </p>
  </div>
);

export default Loader;

