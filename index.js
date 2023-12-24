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

      // อ่านประวัติแชทจากไฟล์ (ถ้ามี)
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

 // ตรวจสอบว่าข้อความไม่เป็นสแปม (ตัวอย่าง: ไม่เกิน 5 ตัวอักษร)
    if (msg && msg.length <= 5) {
      
      const logMessage = 'Guest: ' + msg; 
      fs.appendFile('chatlog.txt', logMessage + '\n', (err) => {
        if (err) {
          console.error(err);
        }
      });

      
      io.emit('chat message', logMessage);
    } else {
      // ถ้าข้อความเป็นสแปมหรือยาวเกินไป ให้บันทึกลงในไฟล์ logreport.txt
      const spamMessage = 'มีคน spam หรือ long message: ' + msg;
      fs.appendFile('logreport.txt', spamMessage + '\n', (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });
});

    server.listen(80, () => {
      console.log('server run...');
    });

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    if (msg === '/report') {
      const logMessage = 'มีผู้ใช้report';
      fs.appendFile('logreport.txt', logMessage + '\n', (err) => {
        if (err) throw err;
        console.log('Report logged.');
      });
    } else {
      io.emit('chat message', msg);
    }
  });
});

