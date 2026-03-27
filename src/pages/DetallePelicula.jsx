import { useState } from 'react';

export default function DetallePelicula() {
  const [seleccionados, setSeleccionados] = useState([]);
  const asientos = Array.from({ length: 150 }, (_, i) => i + 1);

  const toggleAsiento = (num) => {
    setSeleccionados(prev => 
      prev.includes(num) ? prev.filter(a => a !== num) : [...prev, num]
    );
  };

  return (
    <div style={{ padding: '20px', background: '#111', color: '#fff', minHeight: '100vh', textAlign: 'center' }}>
      <h2>Selecciona tus asientos para Intensamente 2</h2>
      <div style={{ background: '#555', height: '10px', width: '70%', margin: '20px auto', borderRadius: '5px' }}>PANTALLA</div>
      
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', 
        gap: '5px', maxWidth: '500px', margin: '0 auto' 
      }}>
        {asientos.map(num => (
          <div 
            key={num}
            onClick={() => toggleAsiento(num)}
            style={{
              width: '25px', height: '25px', borderRadius: '4px', cursor: 'pointer',
              background: seleccionados.includes(num) ? '#e50914' : '#444',
              fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {num}
          </div>
        ))}
      </div>
      <div style={{ marginTop: '20px' }}>
        <p>Asientos seleccionados: {seleccionados.length}</p>
        <button style={{ padding: '10px 20px', background: '#e50914', color: '#fff', border: 'none', borderRadius: '5px' }}>
          RESERVAR AHORA
        </button>
      </div>
    </div>
  );
}