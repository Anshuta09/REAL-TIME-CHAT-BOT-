import React, { useEffect, useRef, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function Chat({ wsUrl }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('chat_user') || '');
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function connect() {
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('WS open');
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'init' && Array.isArray(data.history)) {
            setMessages(data.history);
          } else if (data.type === 'message' && data.message) {
            setMessages(prev => [...prev, data.message]);
          }
        } catch (err) {
          console.error('Invalid message', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // attempt simple reconnect
        reconnectTimer.current = setTimeout(() => {
          connect();
        }, 1500);
      };

      ws.onerror = (err) => {
        console.error('WS error', err);
        ws.close();
      };
    } catch (err) {
      console.error('Failed to connect', err);
      // try again
      reconnectTimer.current = setTimeout(() => connect(), 2000);
    }
  }

  function sendMessage(text) {
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return false;
    const payload = { type: 'message', user: user || 'Anonymous', text };
    wsRef.current.send(JSON.stringify(payload));
    return true;
  }

  function setUsername(name) {
    setUser(name);
    localStorage.setItem('chat_user', name);
  }

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Realtime Chat</h1>
        <div className="status">
          <span className={`dot ${connected ? 'online' : 'offline'}`}></span>
          <small>{connected ? 'Connected' : 'Disconnected — reconnecting...'}</small>
        </div>
      </header>

      <div className="chat-main">
        <aside className="sidebar">
          <label>
            Your name
            <input
              value={user}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Type a display name"
            />
          </label>
          <p className="hint">Name is stored locally only.</p>
        </aside>

        <section className="chat-area">
          <MessageList messages={messages} currentUser={user} />
          <MessageInput onSend={sendMessage} disabled={!connected} />
        </section>
      </div>

      <footer className="chat-footer">
        <small>Simple WebSocket chat • Message history from server</small>
      </footer>
    </div>
  );
}
