import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ================= IA SIMULADA =================
app.post("/chat", async (req, res) => {
  const { messages } = req.body;
  const last = messages[messages.length - 1]?.text?.toLowerCase() || "";

  let reply = "No entendí, intenta otra cosa";

  if (last.includes("cartelera")) {
    reply = "🎬 Cartelera disponible:";
    res.json({
      role: "assistant",
      text: reply,
      html: `
        <div style="display:flex;gap:10px;overflow-x:auto;padding:10px">
          <div style="min-width:120px;text-align:center">
            <img src="https://es.web.img3.acsta.net/pictures/22/11/02/16/34/0046522.jpg" width="100%" style="border-radius:8px">
            <p>Avatar</p>
          </div>
          <div style="min-width:120px;text-align:center">
            <img src="https://lumiere-a.akamaihd.net/v1/images/p_insideout2_payoff_v3_es-la_12f94b30.jpeg" width="100%" style="border-radius:8px">
            <p>Intensamente 2</p>
          </div>
        </div>
      `
    });
    return;
  }

  if (last.includes("precio")) {
    reply = "🎫 Precios desde $12.000";
  }

  if (last.includes("comprar")) {
    reply = "🛒 ¿Qué película deseas comprar?";
  }

  if (last.includes("avatar")) {
    reply = "🎫 Horarios disponibles para Avatar:\n3:00pm - 7:00pm\n¿Confirmar compra?";
  }

  if (last.includes("confirmar")) {
    reply = "✅ Compra realizada con éxito 🎉";
  }

  res.json({
    role: "assistant",
    text: reply
  });
});

app.listen(3000, () => {
  console.log("🚀 Backend IA corriendo en http://localhost:3000");
});
