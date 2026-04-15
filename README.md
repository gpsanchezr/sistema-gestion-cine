# Cine-Verse - Supabase Edition 🚀

## 🎥 Full-Stack Movie Ticketing App

**Backend: NONE** - Pure **Supabase** (Auth + Postgres + Realtime + Storage)

## 📦 Setup

1. **Supabase Project:**
   - Create project at supabase.com
   - Copy `.env`:
     ```
     VITE_SUPABASE_URL=your_url
     VITE_SUPABASE_ANON_KEY=your_key
     ```
   - **Run SQL:** `supabase-schema.sql` (all tables/RLS/realtime)

2. **Frontend:**
```
npm install
npm run dev
```
http://localhost:5173

## 🔑 Features

- **Supabase Auth** + usuarios profiles
- **Cartelera** - Movies + funciones (realtime)
- **SeatSelection** - Interactive map + realtime updates
- **Checkout** - Transactions + EmailJS tiquetes
- **ValidarTiquete** - QR/code validation
- **Admin** - Full CRUD (RLS protected)

## 🗑️ Legacy (Deprecated)
- `server/` - Old MongoDB/Express (ignored)

## 📊 Schema
```
usuarios → auth.users | películas | funciones | cines
tiquetes ← detalle_tiquete (asientos UNIQUE)
```

1. Crea cuenta en [emailjs.com](https://emailjs.com) (gratis)
2. Crea un **Email Service** con tu Gmail
3. Crea un **Email Template** con estas variables:
   - `{{nombre}}` — Nombre del cliente
   - `{{pelicula}}` — Título de la película
   - `{{sala}}` — Sala de la función
   - `{{asientos}}` — Asientos comprados
   - `{{codigo}}` — Código único del tiquete
   - `{{total}}` — Valor total pagado
   - `{{fecha}}` — Fecha y hora de la función
4. Edita `src/services/emailService.js` y reemplaza:
   ```js
   const EMAILJS_SERVICE_ID = 'TU_SERVICE_ID_AQUI'
   const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID_AQUI'
   const EMAILJS_PUBLIC_KEY = 'TU_PUBLIC_KEY_AQUI'
   const ADMIN_EMAIL = 'tu_correo@gmail.com'
   ```

### 5. Configurar CineBot (Gemini AI)
1. Obtén tu API Key en [Google AI Studio](https://aistudio.google.com)
2. Edita `src/components/CineBot.jsx` y reemplaza:
   ```js
   const GEMINI_API_KEY = 'TU_API_KEY_AQUI'
   ```

### 6. Ejecutar en desarrollo
```bash
npm run dev
```

---

## 📋 Funcionalidades implementadas

### ✅ Requisitos del PDF — 100% cubiertos
- [x] **Gestión de películas**: CRUD completo (título, género, duración, clasificación, descripción)
- [x] **Programación de funciones**: Crear funciones (fecha y hora) asociadas a sala
- [x] **Gestión de asientos**: Grid visual de exactamente 150 sillas (10 filas × 15 columnas), bloqueo de ocupados, restricción UNIQUE(funcion_id, asiento_numero)
- [x] **Venta de tiquetes**: Selección de película + función + asientos, cálculo automático, código único `CV-XXXX-XXXX-XXXX`, transacción atómica
- [x] **Validación de tiquetes**: Buscar por código, estados: Válido / Usado / Inválido, marcar como "Usado"
- [x] **Panel Admin**: Dashboard con total de ventas, ocupación de sala, gráficas

### ✨ Extras implementados
- [x] **CineBot** con Gemini AI + lectura de cartelera en tiempo real desde Supabase
- [x] **EmailJS** — confirmación de tiquete al cliente y copia al admin
- [x] **Contraseñas seguras** — regex `/^(?=.*[A-Z]).{6,}$/` con indicadores visuales
- [x] **Diseño premium oscuro** — tema cinema con MUI v5
- [x] **Actualización en tiempo real** de asientos con Supabase Realtime
- [x] **RLS en todas las tablas** — seguridad a nivel de fila
- [x] **Trigger automático** para crear perfil al registrarse

---

## 📁 Estructura del proyecto

```
cine-verse/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CineBot.jsx          ← Chatbot IA con Gemini
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx         ← Validación contraseña segura
│   │   ├── Cartelera.jsx
│   │   ├── PeliculaDetalle.jsx
│   │   ├── SeatSelection.jsx    ← Grid 150 asientos
│   │   ├── Checkout.jsx         ← Compra + EmailJS
│   │   ├── ValidarTiquete.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       ├── Dashboard.jsx    ← Charts de ventas
│   │       ├── Peliculas.jsx    ← CRUD películas
│   │       ├── Funciones.jsx    ← CRUD funciones
│   │       └── Tiquetes.jsx
│   ├── services/
│   │   └── emailService.js      ← EmailJS utility
│   ├── App.jsx
│   ├── main.jsx
│   ├── theme.js                 ← Tema oscuro premium MUI
│   └── supabaseClient.js
├── database.sql                 ← Script SQL completo
├── package.json
├── vite.config.js
└── .env                         ← Credenciales Supabase
```

---

## 🔑 Endpoints del API (Supabase REST)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/rest/v1/peliculas` | Listar películas |
| POST | `/rest/v1/peliculas` | Crear película (admin) |
| PATCH | `/rest/v1/peliculas?id=eq.{id}` | Editar película (admin) |
| DELETE | `/rest/v1/peliculas?id=eq.{id}` | Eliminar película (admin) |
| GET | `/rest/v1/funciones` | Listar funciones |
| POST | `/rest/v1/funciones` | Crear función (admin) |
| GET | `/rest/v1/detalle_tiquete?funcion_id=eq.{id}` | Asientos ocupados por función |
| POST | `/rest/v1/tiquetes` | Crear tiquete (autenticado) |
| POST | `/rest/v1/detalle_tiquete` | Guardar asientos del tiquete |
| GET | `/rest/v1/tiquetes?codigo=eq.{codigo}` | Validar tiquete por código |
| PATCH | `/rest/v1/tiquetes?id=eq.{id}` | Marcar tiquete como usado |

---

## 🛡️ Seguridad

- **Row Level Security (RLS)** habilitada en todas las tablas
- **Contraseña segura** con regex: mínimo 6 caracteres + 1 mayúscula
- **UNIQUE(funcion_id, asiento_numero)** previene doble venta en base de datos
- **Validaciones en frontend y backend**
- **Transacciones** al comprar tiquetes

---

## 📄 Diagrama ER

```
usuarios ←───────────── tiquetes
    │                      │
    │              funcion_id (FK)
    │                      │
peliculas ──→ funciones ───┘
                           │
                    detalle_tiquete
                    (funcion_id, asiento_numero UNIQUE)
```

---

*Desarrollado para SENA CNCA – Nodo Tic ADSO17*
=======
# 🎬 Cine-Verse | Plataforma de Gestión de Cine

Cine-Verse es una aplicación web moderna diseñada para sistematizar el proceso de publicación de películas, venta de tiquetes y control de acceso a salas de cine. 

Este proyecto fue desarrollado como solución tecnológica integral, garantizando el control de aforo (150 sillas exactas por sala) y previniendo la sobreventa mediante reglas estrictas en la base de datos.

## 🚀 Tecnologías Utilizadas

* **Frontend:** React 18, Vite, Material UI (MUI v5)
* **Backend / Base de Datos:** Supabase (PostgreSQL)
* **Control de Estado:** Redux Toolkit

## ⚙️ Características Principales

* 🎞️ **Cartelera Dinámica:** Visualización de estrenos recientes.
* 🪑 **Control de Aforo:** Grilla interactiva de 150 sillas (10 filas x 15 columnas).
* 🎟️ **Venta y Validación:** Generación de códigos únicos por tiquete.
* 🛡️ **Seguridad Transaccional:** Restricciones lógicas (UNIQUE) para evitar doble venta de asientos.

## 👩‍💻 Autora
* **Giseella Sanchez Rico** - *Arquitectura, Migración a Vite/MUI v5 y Base de Datos (Supabase)*.

---
*Nota: Proyecto original modernizado y reestructurado profundamente.*


