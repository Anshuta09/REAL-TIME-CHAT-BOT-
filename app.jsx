import React from 'react';
import Chat from './components/Chat';

export default function App(){
  return (
    <div className="app-root">
      <Chat wsUrl={import.meta.env.VITE_WS_URL || 'ws://localhost:4000'} />
    </div>
  );
}
