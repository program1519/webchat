const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => { 
  console.log('a user connected');

  // อ่านประวัติแชทจากไฟล์ล็อก (ถ้ามี)
  fs.readFile('chatlog.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      // ส่งประวัติแชทให้ผู้ใช้ที่เพิ่งเชื่อมต่อ
      socket.emit('chat history', data.split('\n'));
    }
  });

  socket.on('disconnect', () => { 
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => { 
    console.log('message: ' + msg);
    
    // เพิ่มข้อความในประวัติแชทและบันทึกลงในไฟล์ล็อก
    const logMessage = new Date().toLocaleString() + ': ' + msg;
    fs.appendFile('chatlog.txt', logMessage + '\n', (err) => {
      if (err) {
        console.error(err);
      }
    });

    // ส่งข้อความที่ผู้ใช้ส่งมาให้กับผู้ใช้ที่เชื่อมต่อทุกคน
    io.emit('chat message', logMessage);
  });
});

server.listen(80, () => {
  console.log('server run...');
});
