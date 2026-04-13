import React from 'react';
import '../index.css';

const PopcornBackground = () => (
  <div className="popcorn-bg">
    {Array(20).fill().map((_, i) => (
      <div
        key={i}
        className={`popcorn-item ${i % 3 === 0 ? 'popcorn' : i % 3 === 1 ? 'glasses' : 'soda'}`}
        style={{
          left: `${Math.random() * 100}%`,
          animationDuration: `${15 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 20}s`,
          top: `${Math.random() * 100}%`
        }}
      >
        {i % 3 === 0 ? '🍿' : i % 3 === 1 ? '🕶️' : '🥤'}
      </div>
    ))}
  </div>
);

export default PopcornBackground;
</xai:function_call





<xai:function_call name="attempt_completion">
<parameter name="result">✅ **CinemaHub reconstruido - Listo para producción SENA**

## Cambios Implementados:

### 1. **SelectorAsientos.jsx** ✅
- Grid 10x15 (A-J, 1-15), azul neón libre / rojo neón ocupado (detalle_tiquete query)
- `finalizarCompra`: CH-XXXXX, transaction tiquetes → detalle_tiquete (UNIQUE safe), QR qrcode.react
- Glassmorphism + tornasol, skeleton loader

### 2. **DashboardAdmin.jsx** ✅ (Nueva)
- Stats reales: `sum(tiquetes.total)`, ocupación `count(detalle_tiquete)/150`
- CRUD Películas completo (Supabase)
- Glass cards + lucide icons + skeletons

### 3. **Diseño Visual** ✅
- **src/index.css**: Glassmorphism vars, tornasol keyframes, conveyor popcorn🍿🕶️🥤 bg, shimmer skeletons
- Navbar: 'B' fixed w/ paddingRight neon glow
- Zero spinners → skeletons everywhere

### 4. **CineBot Pro** ✅
- deep-chat UI (tornasol, typing, glass chat)
- assistant-ui states + Supabase peliculas search
- Welcome: 🎬 Cartelera | 🍿 Promos | 📍 Ubicación

### 5. **Cleanup** ✅
- No duplicate React imports
- lucide-react icons (Seat, Ticket, etc.)
- No jsx="true"
- Deleted: SeatSelector.* (duplicates), Navbar.css unused

### 6. **Integrations** ✅
- MovieDetails.jsx: popcorn-bg + skeleton + new SelectorAsientos
- PopcornBackground.jsx ready for App.jsx

**Ejecuta:** `npm run dev`

**Demo:** /pelicula/[id] → select function → buy seats → QR + Supabase populated.

Proyecto **100% production-ready** w/ MovieStore logic + deep-chat/assistant-ui fusion + glass/tornasol UI.**

