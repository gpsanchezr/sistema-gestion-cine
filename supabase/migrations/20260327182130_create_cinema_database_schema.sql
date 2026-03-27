/*
  # Cinema Management System - Complete Database Schema
  
  ## Overview
  Complete database structure for a professional cinema management system with
  movie catalog, function scheduling, seat selection, and ticket sales.
  
  ## New Tables
  
  ### 1. usuarios (Users)
  - `id` (uuid, primary key) - Auto-generated user ID
  - `email` (text, unique) - User email for login
  - `nombre` (text) - Full name
  - `rol` (text) - User role: 'admin' or 'cliente'
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. peliculas (Movies)
  - `id` (uuid, primary key) - Movie identifier
  - `titulo` (text) - Movie title
  - `descripcion` (text) - Movie description/synopsis
  - `duracion` (integer) - Duration in minutes
  - `genero` (text) - Genre (Action, Drama, Comedy, etc.)
  - `clasificacion` (text) - Age rating (+13, +18, etc.)
  - `imagen_url` (text) - Poster image URL
  - `trailer_url` (text) - Trailer video URL
  - `estado` (text) - Status: 'activa' or 'inactiva'
  - `created_at` (timestamptz) - Record creation date
  
  ### 3. funciones (Movie Functions/Showtimes)
  - `id` (uuid, primary key) - Function identifier
  - `pelicula_id` (uuid, foreign key) - Reference to peliculas
  - `fecha` (date) - Showtime date
  - `hora` (time) - Showtime time
  - `sala` (text) - Theater room (default: 'Sala 1')
  - `precio` (decimal) - Ticket price for this function
  - `estado` (text) - Status: 'disponible' or 'cancelada'
  - `created_at` (timestamptz) - Record creation date
  
  ### 4. asientos (Seats)
  - `id` (uuid, primary key) - Seat identifier
  - `numero` (integer) - Seat number (1-150)
  - `fila` (text) - Row letter (A-J)
  - `columna` (integer) - Column number (1-15)
  - `estado` (text) - Status: 'activo' or 'inactivo'
  - Pre-populated with 150 seats in 10 rows x 15 columns
  
  ### 5. tiquetes (Tickets)
  - `id` (uuid, primary key) - Ticket identifier
  - `codigo` (text, unique) - Unique ticket code for validation
  - `usuario_id` (uuid, foreign key) - Reference to auth.users
  - `funcion_id` (uuid, foreign key) - Reference to funciones
  - `fecha_compra` (timestamptz) - Purchase timestamp
  - `total` (decimal) - Total amount paid
  - `estado` (text) - Status: 'activo', 'usado', or 'cancelado'
  
  ### 6. detalle_tiquete (Ticket Details)
  - `id` (uuid, primary key) - Detail record identifier
  - `tiquete_id` (uuid, foreign key) - Reference to tiquetes
  - `asiento_id` (uuid, foreign key) - Reference to asientos
  - `precio_unitario` (decimal) - Price per seat
  - Unique constraint on (tiquete_id, asiento_id)
  
  ### 7. asientos_ocupados (Occupied Seats per Function)
  - `id` (uuid, primary key) - Record identifier
  - `funcion_id` (uuid, foreign key) - Reference to funciones
  - `asiento_id` (uuid, foreign key) - Reference to asientos
  - `tiquete_id` (uuid, foreign key) - Reference to tiquetes
  - Unique constraint on (funcion_id, asiento_id) - Prevents double booking
  
  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Policies will be created in next migration
  
  ## Important Notes
  - The system enforces maximum capacity of 150 seats per function
  - Double booking is prevented by unique constraint on (funcion_id, asiento_id)
  - Ticket codes are auto-generated with UUID format
  - All monetary values use decimal(10,2) for precision
*/

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  nombre text NOT NULL,
  rol text NOT NULL DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  created_at timestamptz DEFAULT now()
);

-- Create peliculas table
CREATE TABLE IF NOT EXISTS peliculas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text NOT NULL,
  duracion integer NOT NULL CHECK (duracion > 0),
  genero text NOT NULL,
  clasificacion text NOT NULL,
  imagen_url text,
  trailer_url text,
  estado text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'inactiva')),
  created_at timestamptz DEFAULT now()
);

-- Create funciones table
CREATE TABLE IF NOT EXISTS funciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pelicula_id uuid NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora time NOT NULL,
  sala text NOT NULL DEFAULT 'Sala 1',
  precio decimal(10,2) NOT NULL CHECK (precio > 0),
  estado text NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'cancelada')),
  created_at timestamptz DEFAULT now()
);

-- Create asientos table
CREATE TABLE IF NOT EXISTS asientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer UNIQUE NOT NULL CHECK (numero >= 1 AND numero <= 150),
  fila text NOT NULL,
  columna integer NOT NULL CHECK (columna >= 1 AND columna <= 15),
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo'))
);

-- Create tiquetes table
CREATE TABLE IF NOT EXISTS tiquetes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  funcion_id uuid NOT NULL REFERENCES funciones(id) ON DELETE CASCADE,
  fecha_compra timestamptz DEFAULT now(),
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'usado', 'cancelado'))
);

-- Create detalle_tiquete table
CREATE TABLE IF NOT EXISTS detalle_tiquete (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tiquete_id uuid NOT NULL REFERENCES tiquetes(id) ON DELETE CASCADE,
  asiento_id uuid NOT NULL REFERENCES asientos(id) ON DELETE CASCADE,
  precio_unitario decimal(10,2) NOT NULL CHECK (precio_unitario >= 0),
  UNIQUE(tiquete_id, asiento_id)
);

-- Create asientos_ocupados table (critical for preventing double booking)
CREATE TABLE IF NOT EXISTS asientos_ocupados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcion_id uuid NOT NULL REFERENCES funciones(id) ON DELETE CASCADE,
  asiento_id uuid NOT NULL REFERENCES asientos(id) ON DELETE CASCADE,
  tiquete_id uuid NOT NULL REFERENCES tiquetes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(funcion_id, asiento_id)
);

-- Pre-populate asientos with 150 seats (10 rows x 15 columns)
DO $$
DECLARE
  seat_number integer := 1;
  row_letter text;
  col_number integer;
BEGIN
  -- Only insert if table is empty
  IF NOT EXISTS (SELECT 1 FROM asientos LIMIT 1) THEN
    FOR i IN 0..9 LOOP
      row_letter := chr(65 + i); -- A, B, C, D, E, F, G, H, I, J
      FOR col_number IN 1..15 LOOP
        INSERT INTO asientos (numero, fila, columna, estado)
        VALUES (seat_number, row_letter, col_number, 'activo');
        seat_number := seat_number + 1;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_funciones_pelicula ON funciones(pelicula_id);
CREATE INDEX IF NOT EXISTS idx_funciones_fecha ON funciones(fecha);
CREATE INDEX IF NOT EXISTS idx_tiquetes_codigo ON tiquetes(codigo);
CREATE INDEX IF NOT EXISTS idx_tiquetes_funcion ON tiquetes(funcion_id);
CREATE INDEX IF NOT EXISTS idx_asientos_ocupados_funcion ON asientos_ocupados(funcion_id);
CREATE INDEX IF NOT EXISTS idx_detalle_tiquete ON detalle_tiquete(tiquete_id);

-- Enable Row Level Security on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE peliculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE funciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_tiquete ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_ocupados ENABLE ROW LEVEL SECURITY;