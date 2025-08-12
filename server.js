// Simple WebSocket chat server with lightweight file persistence for history
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const HISTORY_FILE = path.join(__dirname, 'messages.json');
const MAX_HISTORY = 500; // keep only latest 500 messages

// load or create history file
let history = [];
try {
  if (fs.existsSync(HISTORY_FILE)) {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    history = JSON.parse(raw || '[]');
  }
} catch (err) {
  console.error('Failed to load history file:', err);
  history = [];
}

const app = express();
app.use(cors());
app.use(express.json());

// optional endpoint to fetch history
app.get('/history', (req, res) => {
  res.json(history);
});

// serve static client if you build and put into server/public (optional)
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// broadcast helper
function broadcast(obj) {
  const raw = JSON.stringify(obj);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  });
}

// save to file
function persistHistory() {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

wss.on('connection', (ws, req) => {
  // send init with history
  ws.send(JSON.stringify({ type: 'init', history }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'message') {
        // validate minimal fields
        const msg = {
          id: Date.now() + '-' + Math.random().toString(36).slice(2,8),
          user: (data.user && String(data.user).slice(0,64)) || 'Anonymous',
          text: String(data.text || '').slice(0,2000),
          ts: new Date().toISOString()
        };
        // append, bound history
        history.push(msg);
        if (history.length > MAX_HISTORY) history = history.slice(history.length - MAX_HISTORY);
        persistHistory();

        // broadcast new message
        broadcast({ type: 'message', message: msg });
      }
    } catch (err) {
      console.error('Invalid message received', err);
    }
  });

  ws.on('close', () => {
    // nothing fancy
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
