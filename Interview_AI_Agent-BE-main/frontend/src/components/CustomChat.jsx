import React, { useState } from "react";
import { useChat } from "@livekit/components-react";

const CustomChat = () => {
  const { chatMessages, send } = useChat();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      send(input);
      setInput("");
    }
  };

  return (
    <div>
      <div style={{ maxHeight: 300, overflowY: "scroll" }}>
        {chatMessages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.from?.identity}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default CustomChat;