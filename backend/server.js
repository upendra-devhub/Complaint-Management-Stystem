require('dotenv').config();
const http = require("http");
const app = require('./app');
const dbConnect = require('./config/db');
const { initRealtime } = require("./socket/realtime");

const PORT = process.env.PORT || 5000;

dbConnect().then(() => {
  const server = http.createServer(app);
  initRealtime(server);
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
});
