// test-ws-client.js
const WebSocket = global.WebSocket || require('ws'); // For Node.js v21+, global.WebSocket exists

const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Authenticate after connection
  ws.send(JSON.stringify({ type: 'init', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFjMmE5OWNiNmJkZDZkOGNlODRkZTMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc0NjY3NjQyNywiZXhwIjoxNzQ2NzYyODI3fQ.XVtamhOe0F-VQbxyuF_fMbHiO4u2rFCvNm0LjvF4_BI' }));
  // Send a direct message example
  ws.send(JSON.stringify({ type: 'direct_message', to: '681c2a99cb6bdd6d8ce84de3', content: 'Hello from Node.js client!' }));
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onerror = (err) => {
  console.error('WebSocket error:', err);
};

ws.onclose = () => {
  console.log('WebSocket closed');
};