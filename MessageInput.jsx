import React, { useState } from 'react';

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const ok = onSend(trimmed);
    if (ok) setText('');
  }

  return (
    <form className="message-input" onSubmit={submit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? "Connecting..." : "Type a message and press Enter"}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>Send</button>
    </form>
  );
}
