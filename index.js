const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

// เก็บประวัติแชทในหน่วยความจำ
let chatHistory = [];

// ฟังก์ชั่นเพื่อบันทึกประวัติแชทลงในไฟล์
function saveChatHistory() {
  fs.writeFile('chatlog.txt', chatHistory.join('\n') + '\n', (err) => {
    if (err) {
      console.error('Error saving chat history:', err);
    }
  });
}

// อ่านประวัติแชทจากไฟล์ตอนเริ่มต้น
fs.readFile('chatlog.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    chatHistory = data.split('\n').filter(line => line.trim() !== ''); // แยกประวัติแชทเป็นอาร์เรย์
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => { 
  console.log('a user connected');

  // ส่งประวัติแชทให้ผู้ใช้ที่เพิ่งเชื่อมต่อ
  socket.emit('chat history', chatHistory);

  socket.on('disconnect', () => { 
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => { 
    console.log('message: ' + msg);

    // ตรวจสอบว่าไม่เป็นสแปมหรือข้อความยาวเกินไป
    if (msg && msg.length <= 5) {
      const logMessage = 'Guest: ' + msg;

      // ตรวจสอบข้อความซ้ำก่อนที่จะเพิ่ม
      if (!chatHistory.includes(logMessage)) {
        chatHistory.push(logMessage); // เพิ่มข้อความในหน่วยความจำ

        // บันทึกข้อความใหม่ในไฟล์
        saveChatHistory();

        // ส่งข้อความใหม่ไปยังผู้ใช้ทั้งหมด
        io.emit('chat message', logMessage);
      }
    } else {
      // หากเป็นข้อความที่เกินขอบเขต หรือสแปม
      const spamMessage = 'มีคน spam หรือ long message: ' + msg;
      fs.appendFile('logreport.txt', spamMessage + '\n', (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });

  // สำหรับการรายงาน
  socket.on('chat message', (msg) => {
    if (msg === '/report') {
      const logMessage = 'มีผู้ใช้report';
      fs.appendFile('logreport.txt', logMessage + '\n', (err) => {
        if (err) throw err;
        console.log('Report logged.');
      });
    }
  });
});

server.listen(80, () => {
  console.log('server run...');
});
