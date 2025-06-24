const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const awsIOT = require('aws-iot-device-sdk');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET']
    }
});

const device = awsIOT.device({
    keyPath: process.env.KEY_PATH,
    certPath: process.env.CERT_PATH,
    caPath: process.env.CA_PATH,
    clientId: process.env.CLIENT_ID,
    host: process.env.HOST
});

function getRandomElv() {
    const elv = ["ELV-001", "ELV-002", "ELV-003", "ELV-004"];
    return elv[Math.floor(Math.random() * elv.length)];
}

function getRandomLoad() {
  return (100 + Math.random() * 900).toFixed(2);
}

device.on('connect', () => {
    
    setInterval(() => {
    const loadData = {
      id: getRandomElv(),
      load: parseFloat(getRandomLoad()),
      unit: 'kg',
      timestamp: new Date().toLocaleTimeString()
    };

    device.publish('sensor/load', JSON.stringify(loadData), (err) => {
  if (err) {
    console.error('Publish error:', err);
  }

  io.emit('loadData', loadData);
});

}, 5000);

});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
});

device.on('error', (error) => {
  console.error('Connection error:', error);
});

server.listen(port, () => {
});