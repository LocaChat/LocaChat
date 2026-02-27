const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check - WAJIB ADA!
app.get('/', (req, res) => {
  res.json({ 
    app: 'LocaChat by B1LT1',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Working!' });
});

// PORT - Gunakan process.env.PORT untuk Railway!
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ LocaChat running on port ${PORT}`);
});
