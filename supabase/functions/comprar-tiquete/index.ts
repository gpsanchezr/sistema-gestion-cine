import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CompraRequest {
  funcion_id: string;
  asientos_ids: string[];
  precio_unitario: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No autorizado');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('No autorizado');
    }

    const { funcion_id, asientos_ids, precio_unitario }: CompraRequest = await req.json();

    if (!funcion_id || !asientos_ids || asientos_ids.length === 0 || !precio_unitario) {
      throw new Error('Datos incompletos');
    }

    const { data: asientosOcupados, error: checkError } = await supabase
      .from('asientos_ocupados')
      .select('asiento_id')
      .eq('funcion_id', funcion_id)
      .in('asiento_id', asientos_ids);

    if (checkError) {
      throw new Error('Error al verificar disponibilidad de asientos');
    }

    if (asientosOcupados && asientosOcupados.length > 0) {
      throw new Error('Uno o más asientos ya están ocupados');
    }

    const total = asientos_ids.length * precio_unitario;

    const { data: tiquete, error: tiqueteError } = await supabase
      .from('tiquetes')
      .insert({
        usuario_id: user.id,
        funcion_id,
        total,
        estado: 'activo'
      })
      .select()
      .single();

    if (tiqueteError) {
      throw new Error('Error al crear el tiquete');
    }

    const detalles = asientos_ids.map(asiento_id => ({
      tiquete_id: tiquete.id,
      asiento_id,
      precio_unitario
    }));

    const { error: detalleError } = await supabase
      .from('detalle_tiquete')
      .insert(detalles);

    if (detalleError) {
      await supabase.from('tiquetes').delete().eq('id', tiquete.id);
      throw new Error('Error al registrar los detalles del tiquete');
    }

    const ocupados = asientos_ids.map(asiento_id => ({
      funcion_id,
      asiento_id,
      tiquete_id: tiquete.id
    }));

    const { error: ocupadosError } = await supabase
      .from('asientos_ocupados')
      .insert(ocupados);

    if (ocupadosError) {
      await supabase.from('detalle_tiquete').delete().eq('tiquete_id', tiquete.id);
      await supabase.from('tiquetes').delete().eq('id', tiquete.id);
      throw new Error('Error al reservar los asientos. Es posible que ya estén ocupados.');
    }

    return new Response(
      JSON.stringify({
        success: true,
        tiquete_id: tiquete.id,
        codigo: tiquete.codigo
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error en compra de tiquete:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error al procesar la compra'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
