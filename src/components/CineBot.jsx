import { DeepChat } from "deep-chat-react";
import "./CineBot.css";

export default function CineBot() {
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>
      <DeepChat
        style={{ width: "300px", height: "400px" }}
        request={{
          url: "http://localhost:3000/chat"
        }}
      />
    </div>
  );
}

