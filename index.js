const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');


let chatHistory = [];


function saveChatHistory() {
  fs.writeFile('chatlog.txt', chatHistory.join('\n') + '\n', (err) => {
    if (err) {
      console.error('Error saving chat history:', err);
    }
  });
}


fs.readFile('chatlog.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
  } else {
    chatHistory = data.split('\n').filter(line => line.trim() !== ''); 
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => { 
  console.log('a user connected');


  socket.emit('chat history', chatHistory);

  socket.on('disconnect', () => { 
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => { 
    console.log('message: ' + msg);

    
    if (msg && msg.length <= 5) {
      const logMessage = 'Guest: ' + msg;

     
      if (!chatHistory.includes(logMessage)) {
        chatHistory.push(logMessage); 

       
        saveChatHistory();

        
        io.emit('chat message', logMessage);
      }
    } else {
    
      const spamMessage = 'มีคน spam หรือ long message: ' + msg;
      fs.appendFile('logreport.txt', spamMessage + '\n', (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  });


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
