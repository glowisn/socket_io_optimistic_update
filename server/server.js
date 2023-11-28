import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on('connection', socket => {
    console.log('a user connected');
    // 클라이언트로부터 메시지 받기
    socket.on('send_message', (data, callback) => {
        // 받은 메시지를 콘솔에 로그
        console.log(data.userId + " : " + data.message);

        // 500ms 대기
        setTimeout(() => {
            // 메시지를 모든 클라이언트에게 전송
            io.emit('receive_message', data);

            // 성공적으로 메시지를 처리했다는 응답 보내기
            callback({ status: 'ok' });
        }, 500);


    });
});

server.listen(17558, () => {
    console.log('server running at http://localhost:17558');
});