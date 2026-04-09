# 🎬 Sistema de Gestión de Cine - ADSO

Full-Stack Cinema Management System | React • Supabase • PostgreSQL

Plataforma integral para la gestión de salas de cine con autenticación de usuarios, dashboard administrativo, sistema de reservas con QR y notificaciones por email.

## ✨ Características

- 🔐 **Autenticación completa** con Supabase (login/registro con roles)
- 👨‍💼 **Dashboard administrativo** para gestión de películas y validación de tickets
- 🎭 **Sistema de reservas** con selección de asientos en tiempo real
- 📱 **Interfaz responsive** con diseño glassmorphism y neón rojo
- 🤖 **CineBot animado** con saludo holográfico y brazos saludando
- 🎫 **Generación de QR** para tickets digitales
- 📧 **Envío automático de tickets** por email con EmailJS
- 🔍 **Filtros avanzados** por género y mes
- 💾 **Persistencia offline** con localStorage

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de EmailJS (opcional, para envío de emails)

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd sistema-gestion-cine-main
   ```

2. **Instala dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**

   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

   Configura las siguientes variables en `.env`:

   ```env
   # Configuración de Supabase (requerido)
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key

   # Configuración de EmailJS (opcional, para envío de tickets)
   VITE_EMAILJS_SERVICE_ID=tu_emailjs_service_id
   VITE_EMAILJS_TEMPLATE_ID=tu_emailjs_template_id
   VITE_EMAILJS_PUBLIC_KEY=tu_emailjs_public_key

   # Email del propietario del cine (opcional)
   VITE_CINEMA_OWNER_EMAIL=dueno@cine.com
   ```

### Configuración de Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > API y copia la URL y la anon key
4. Crea las siguientes tablas en la base de datos:

   **Tabla: `perfiles`**
   ```sql
   CREATE TABLE perfiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **Tabla: `tiquetes`**
   ```sql
   CREATE TABLE tiquetes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     movie_title TEXT NOT NULL,
     fecha DATE NOT NULL,
     hora TIME NOT NULL,
     sala TEXT NOT NULL,
     seats JSONB NOT NULL,
     customer_name TEXT,
     customer_email TEXT NOT NULL,
     qr_text TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. Configura Row Level Security (RLS) según necesites

### Configuración de EmailJS (Opcional)

1. Crea una cuenta en [EmailJS](https://www.emailjs.com/)
2. Crea un nuevo servicio de email (Gmail, Outlook, etc.)
3. Crea una plantilla de email con las siguientes variables:
   - `{{movie}}` - Título de la película
   - `{{date}}` - Fecha de la función
   - `{{hour}}` - Hora de la función
   - `{{sala}}` - Sala
   - `{{seats}}` - Asientos seleccionados
   - `{{client_name}}` - Nombre del cliente
   - `{{client_email}}` - Email del cliente
   - `{{ticket_id}}` - ID del ticket
   - `{{qr_text}}` - Texto del QR
   - `{{owner_email}}` - Email del propietario

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── CineBot.jsx     # Asistente virtual animado
│   ├── PurchaseModal.jsx # Modal de compra con QR
│   └── ...
├── context/            # Contextos de React
│   └── Auth.jsx        # Gestión de autenticación
├── lib/               # Utilidades
│   └── emailService.js # Servicio de envío de emails
├── pages/             # Páginas principales
│   ├── Home.jsx       # Página principal con filtros
│   ├── Login.jsx      # Autenticación
│   ├── AdminDashboard.jsx # Dashboard administrativo
│   └── ...
├── styles/            # Estilos CSS
│   ├── CineBot.css    # Estilos del bot animado
│   ├── Home.css       # Estilos de la página principal
│   └── ...
└── main.jsx           # Punto de entrada
```

## 🎨 Diseño

- **Tema:** Glassmorphism con acentos neón rojo
- **Paleta:** Rojo neón (#ff0051), cian (#00f5ff), fondo oscuro
- **Tipografía:** Arial para interfaz, emojis para elementos interactivos
- **Animaciones:** Transiciones suaves, efectos holográficos, brazos saludando del bot

## 🔧 Tecnologías

- **Frontend:** React 18, Vite, React Router v6
- **Backend:** Supabase (PostgreSQL + Auth)
- **Styling:** CSS3 con variables personalizadas
- **Email:** EmailJS para notificaciones
- **QR:** qrcode.react para generación de códigos
- **Estado:** React Context + localStorage

## 📝 Notas de Desarrollo

- El sistema incluye validación de roles para acceso administrativo
- Los tickets se generan con QR único para validación
- El CineBot tiene animaciones de brazos saludando y nube de saludo
- Filtros por género y mes en la página principal
- Diseño responsive para móviles y tablets

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
