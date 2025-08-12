import React, { useEffect, useRef } from 'react';

export default function MessageList({ messages = [], currentUser = '' }) {
  const listRef = useRef(null);

  useEffect(() => {
    // auto-scroll to bottom on new message
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="message-list" ref={listRef}>
      {messages.map(m => (
        <div key={m.id} className={`message ${m.user === currentUser ? 'mine' : ''}`}>
          <div className="meta">
            <span className="user">{m.user}</span>
            <span className="time">{new Date(m.ts).toLocaleTimeString()}</span>
          </div>
          <div className="text">{m.text}</div>
        </div>
      ))}
    </div>
  );
}
