import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { ticketCode, action } = await req.json()

    if (!ticketCode) {
      return new Response(
        JSON.stringify({ success: false, message: 'Código de ticket requerido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar el ticket por código único
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tiquetes')
      .select(`
        *,
        funciones (
          fecha,
          hora,
          sala,
          precio,
          peliculas (titulo)
        )
      `)
      .eq('codigo_unico', ticketCode.toUpperCase())
      .single()

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ success: false, message: 'Ticket no encontrado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'validate') {
      // Solo validar, no cambiar estado
      if (ticket.estado === 'usado') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Este ticket ya ha sido usado',
            ticketInfo: {
              codigo_unico: ticket.codigo_unico,
              estado: ticket.estado,
              pelicula: ticket.funciones?.peliculas?.titulo,
              fecha_funcion: ticket.funciones?.fecha + ' ' + ticket.funciones?.hora,
              sala: ticket.funciones?.sala,
              asientos: ticket.asientos_seleccionados,
              total: ticket.pago_total
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (ticket.estado === 'valido') {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Ticket válido - puede ser usado',
            ticketInfo: {
              codigo_unico: ticket.codigo_unico,
              estado: ticket.estado,
              pelicula: ticket.funciones?.peliculas?.titulo,
              fecha_funcion: ticket.funciones?.fecha + ' ' + ticket.funciones?.hora,
              sala: ticket.funciones?.sala,
              asientos: ticket.asientos_seleccionados,
              total: ticket.pago_total
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Estado del ticket inválido',
          ticketInfo: {
            codigo_unico: ticket.codigo_unico,
            estado: ticket.estado
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'mark-used') {
      // Marcar como usado
      if (ticket.estado !== 'valido') {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'El ticket no puede ser marcado como usado'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: updateError } = await supabaseClient
        .from('tiquetes')
        .update({ estado: 'usado' })
        .eq('codigo_unico', ticketCode.toUpperCase())

      if (updateError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Error al actualizar el ticket'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Ticket marcado como usado exitosamente'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, message: 'Acción no válida' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno del servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})