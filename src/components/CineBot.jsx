import React, { useState } from 'react';
import { DeepChat } from 'deep-chat-react';
import './CineBot.css';

export default function CineBot() {
  return (
    <div className="chatbot-container">
      <DeepChat
        style={{ width: "300px", height: "400px" }}
        request={{
          url: "http://localhost:3000/chat"
        }}
      />
    </div>
  );
}
