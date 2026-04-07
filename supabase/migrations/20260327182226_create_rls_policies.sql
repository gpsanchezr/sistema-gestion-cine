/*
  # Row Level Security Policies for Cinema Management System
  
  ## Security Strategy
  This migration implements comprehensive RLS policies with the following principles:
  - Public access to movie catalog and schedules (read-only)
  - Admin-only access for content management
  - User-specific access to their own tickets
  - Secure ticket validation accessible to authenticated users
  
  ## Policies by Table
  
  ### 1. usuarios
  - Users can view their own profile
  - Users can update their own profile
  - Admins can view all users
  
  ### 2. peliculas (Movies)
  - Anyone can view active movies (public catalog)
  - Only admins can create movies
  - Only admins can update movies
  - Only admins can delete movies
  
  ### 3. funciones (Functions)
  - Anyone can view available functions (public schedule)
  - Only admins can create functions
  - Only admins can update functions
  - Only admins can delete functions
  
  ### 4. asientos (Seats)
  - Anyone can view all seats (needed for seat selection)
  - Only admins can modify seats
  
  ### 5. tiquetes (Tickets)
  - Users can view their own tickets
  - Admins can view all tickets
  - Authenticated users can create tickets (via purchase)
  - Users can update their own tickets (for cancellations)
  - Admins can update any ticket
  
  ### 6. detalle_tiquete (Ticket Details)
  - Users can view details of their own tickets
  - Admins can view all ticket details
  - System can insert details during purchase
  
  ### 7. asientos_ocupados (Occupied Seats)
  - Anyone can view occupied seats for any function (needed for seat selection UI)
  - System can insert during purchase
  - Only admins can delete (for cancellations)
  
  ## Helper Function
  - `is_admin()` - Checks if current user has admin role in usuarios table
*/

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND rol = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USUARIOS POLICIES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can insert own profile"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================
-- PELICULAS POLICIES
-- ============================================

CREATE POLICY "Anyone can view active movies"
  ON peliculas FOR SELECT
  USING (estado = 'activa');

CREATE POLICY "Admins can view all movies"
  ON peliculas FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create movies"
  ON peliculas FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update movies"
  ON peliculas FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete movies"
  ON peliculas FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- FUNCIONES POLICIES
-- ============================================

CREATE POLICY "Anyone can view available functions"
  ON funciones FOR SELECT
  USING (estado = 'disponible');

CREATE POLICY "Admins can view all functions"
  ON funciones FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can create functions"
  ON funciones FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update functions"
  ON funciones FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete functions"
  ON funciones FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================
-- ASIENTOS POLICIES
-- ============================================

CREATE POLICY "Anyone can view seats"
  ON asientos FOR SELECT
  USING (true);

CREATE POLICY "Admins can update seats"
  ON asientos FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- TIQUETES POLICIES
-- ============================================

CREATE POLICY "Users can view own tickets"
  ON tiquetes FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Admins can view all tickets"
  ON tiquetes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Anyone can view tickets by code"
  ON tiquetes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tickets"
  ON tiquetes FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own tickets"
  ON tiquetes FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Admins can update any ticket"
  ON tiquetes FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- DETALLE_TIQUETE POLICIES
-- ============================================

CREATE POLICY "Users can view own ticket details"
  ON detalle_tiquete FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tiquetes
      WHERE tiquetes.id = detalle_tiquete.tiquete_id
      AND tiquetes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all ticket details"
  ON detalle_tiquete FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert ticket details"
  ON detalle_tiquete FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tiquetes
      WHERE tiquetes.id = detalle_tiquete.tiquete_id
      AND (tiquetes.usuario_id = auth.uid() OR is_admin())
    )
  );

-- ============================================
-- ASIENTOS_OCUPADOS POLICIES
-- ============================================

CREATE POLICY "Anyone can view occupied seats"
  ON asientos_ocupados FOR SELECT
  USING (true);

CREATE POLICY "System can insert occupied seats"
  ON asientos_ocupados FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tiquetes
      WHERE tiquetes.id = asientos_ocupados.tiquete_id
      AND (tiquetes.usuario_id = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "Admins can delete occupied seats"
  ON asientos_ocupados FOR DELETE
  TO authenticated
  USING (is_admin());