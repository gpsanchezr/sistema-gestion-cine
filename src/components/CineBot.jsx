import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { DeepChat } from "deep-chat-react";

export default function CineBot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 65,
          height: 65,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#ff0080,#00f0ff)",
          border: "none",
          color: "white",
          zIndex: 999,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(255,0,128,0.4)"
        }}
      >
        {open ? <X /> : <MessageCircle />}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 20,
            width: 380,
            height: 600,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            zIndex: 998
          }}
        >
            <DeepChat
            demo={true}
            style={{ 
              height: "100%", 
              width: "100%",
              borderRadius: '20px',
              backgroundColor: '#020617',
              border: '1px solid #1e293b'
            }}
            request={{
              url: 'http://localhost:5000/api/chat',
              method: 'POST'
            }}
            requestInterceptor={(details) => {
              console.log('Enviando mensaje al cerebro del cine...');
              return details;
            }}
            messageStyles={{
              default: {
                ai: { bubble: { backgroundColor: '#1e293b', color: 'white' } },
                user: { bubble: { backgroundColor: '#ec4899', color: 'white' } }
              }
            }}
            initialMessages={[
              {
                role: "assistant",
                text: "🎬 Hola! Soy CineBot. Pregunta sobre películas!"
              }
            ]}
          />
        </div>
      )}
    </>
  );
}
