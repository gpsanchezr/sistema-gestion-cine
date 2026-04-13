import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const app = express();
const port = 3000;

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

// /chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.messages?.at(-1)?.text;

    if (!userMessage) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({
      text: response.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({ error: "Chat error" });
  }
});

// /tiquetes endpoint
app.post("/tiquetes", async (req, res) => {
  try {
    const { funcion_id, asientos } = req.body;

    if (!funcion_id || !Array.isArray(asientos) || asientos.length === 0) {
      return res.status(400).json({ error: "Datos inválidos" });
    }

    const { data: ocupados } = await supabase
      .from('asientos_ocupados')
      .select('asiento_id')
      .eq('funcion_id', funcion_id);

    const ocupadosIds = ocupados.map(a => a.asiento_id);
    const conflicto = asientos.filter(a => ocupadosIds.includes(a));

    if (conflicto.length > 0) {
      return res.status(400).json({ error: "Asientos ocupados", conflicto });
    }

    const { data: ticket, error } = await supabase
      .from('tiquetes')
      .insert({
        funcion_id,
        codigo_unico: `CH-${Date.now()}`,
        estado: 'confirmada'
      })
      .select()
      .single();

    if (error) throw error;

    await Promise.all(asientos.map(a =>
      supabase.from('detalle_tiquete').insert({
        tiquete_id: ticket.id,
        asiento_id: a
      })
    ));

    await supabase.from('asientos_ocupados').insert(
      asientos.map(a => ({ funcion_id, asiento_id: a }))
    );

    res.json({ ok: true, ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🎬 Cinema Backend on http://localhost:${port}`);
});

