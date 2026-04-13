import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// /chat endpoint - OpenAI GPT
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.messages?.at(-1)?.text;
    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({
      text: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat service unavailable' });
  }
});

app.get('/api/funciones', async (req, res) => {
  const { data, error } = await supabase.from('funciones').select('*, peliculas(*)');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// /tiquetes endpoint - Ticket purchase with anti-overbooking
app.post('/api/tiquetes', async (req, res) => {
  try {
    const { funcion_id, asientos } = req.body;
    
    if (!funcion_id || !asientos || !Array.isArray(asientos) || asientos.length === 0) {
      return res.status(400).json({ error: 'funcion_id and asientos array required' });
    }

    // 1. Validate seats available
    const { data: occupied } = await supabase
      .from('asientos_ocupados')
      .select('asiento_id')
      .eq('funcion_id', funcion_id);
    
    const occupiedSeats = occupied?.map(o => o.asiento_id) || [];
    const invalidSeats = asientos.filter(s => occupiedSeats.includes(s));
    
    if (invalidSeats.length > 0) {
      return res.status(400).json({ error: "Seats already occupied", seats: invalidSeats });
    }

    // 2. Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tiquetes')
      .insert({ 
        funcion_id,
        asientos_seleccionados: asientos,
        codigo_unico: `CH-${Date.now()}`,
        estado: 'confirmada'
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // 3. Insert detalle_tiquete
    const detallePromises = asientos.map(asiento => 
      supabase.from('detalle_tiquete').insert({
        tiquete_id: ticket.id,
        asiento_id: asiento
      })
    );
    await Promise.all(detallePromises);

    // 4. Mark seats occupied
    const occupiedPromises = asientos.map(asiento => 
      supabase.from('asientos_ocupados').insert({
        funcion_id,
        asiento_id: asiento
      })
    );
    await Promise.all(occupiedPromises);

    res.json({ ok: true, ticket });
  } catch (error) {
    console.error('Ticket purchase error:', error);
    res.status(400).json({ error: error.message || "Purchase failed" });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Backend running',
    openai: !!process.env.OPENAI_API_KEY,
    supabase: !!process.env.SUPABASE_URL,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`\n🎬 Cinema Backend on http://localhost:${port}`);
});


