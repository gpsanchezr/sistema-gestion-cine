-- Anti-Oversale Function
-- Prevents double booking by making purchase atomic operation
-- Returns: tiquete_id on success, error message on failure

CREATE OR REPLACE FUNCTION comprar_tiquetes(
  p_usuario_id uuid,
  p_funcion_id uuid,
  p_asiento_ids uuid[],
  p_total decimal
) RETURNS jsonb AS $$
DECLARE
  v_tiquete_id uuid;
  v_asiento_id uuid;
  v_seat_count integer;
  v_occupied_count integer;
  v_codigo text;
BEGIN
  -- Validate inputs
  IF array_length(p_asiento_ids, 1) IS NULL OR array_length(p_asiento_ids, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No seats selected'
    );
  END IF;

  -- Check if function exists and is available
  IF NOT EXISTS (SELECT 1 FROM funciones WHERE id = p_funcion_id AND estado = 'disponible') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Function not available'
    );
  END IF;

  v_seat_count := array_length(p_asiento_ids, 1);

  -- Start transaction by checking all seats are free
  SELECT COUNT(*) INTO v_occupied_count
  FROM asientos_ocupados
  WHERE funcion_id = p_funcion_id
  AND asiento_id = ANY(p_asiento_ids);

  IF v_occupied_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('%s of %s seats already taken', v_occupied_count, v_seat_count)
    );
  END IF;

  -- Generate unique ticket code
  v_codigo := 'TKT-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || substring(gen_random_uuid()::text, 1, 8);

  -- Create ticket
  INSERT INTO tiquetes (codigo, usuario_id, funcion_id, total, estado)
  VALUES (v_codigo, p_usuario_id, p_funcion_id, p_total, 'activo')
  RETURNING id INTO v_tiquete_id;

  -- Register all seats as occupied (this is the critical part that prevents double booking)
  FOREACH v_asiento_id IN ARRAY p_asiento_ids LOOP
    -- This will fail if seat is already occupied (unique constraint)
    INSERT INTO asientos_ocupados (funcion_id, asiento_id, tiquete_id)
    VALUES (p_funcion_id, v_asiento_id, v_tiquete_id);

    -- Also create detail record
    INSERT INTO detalle_tiquete (tiquete_id, asiento_id, precio_unitario)
    VALUES (v_tiquete_id, v_asiento_id, p_total / v_seat_count);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'tiquete_id', v_tiquete_id,
    'codigo', v_codigo,
    'mensaje', format('Ticket created for %s seats', v_seat_count)
  );

EXCEPTION WHEN unique_violation THEN
  -- Rollback implicit - another user took a seat while we were processing
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Seat already taken by another customer (race condition)'
  );
WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION comprar_tiquetes(uuid, uuid, uuid[], decimal) TO authenticated;
