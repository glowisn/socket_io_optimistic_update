# socket_io_optimistic_update

# Socket.IO와 Optimistic Update를 활용한 실시간 채팅 애플리케이션 구현

## 개요
본 문서에서는 Socket.IO를 사용하여 실시간 채팅 애플리케이션을 구현하는 방법과, 사용자 경험을 향상시키기 위해 Optimistic Update 기법을 적용하는 방법에 대해 설명합니다. Optimistic Update는 사용자가 행동을 취했을 때, 서버의 응답을 기다리지 않고 UI를 미리 업데이트하는 기법으로, 반응성이 높은 사용자 경험을 제공합니다.

## 개념
Optimistic Update는 사용자 인터페이스(UI) 설계에서 사용되는 기법으로, 네트워크 요청의 결과(성공 또는 실패)를 기다리지 않고, 사용자의 액션이 성공할 것으로 "낙관적"으로 가정하고 UI를 미리 업데이트하는 방식입니다. 이 기법은 특히 네트워크 지연이나 서버 응답 시간으로 인해 사용자 경험이 저하될 수 있는 웹 애플리케이션에서 유용합니다.

## 작동 원리
1. 사용자 액션: 사용자가 UI에서 어떤 액션을 취합니다 (예: 메시지 전송, 항목 추가 등).
2. 즉각적인 UI 업데이트: 애플리케이션은 서버의 응답을 기다리지 않고 즉시 UI를 업데이트합니다. 이는 사용자가 자신의 액션이 반영되었다고 느끼게 합니다.
3. 서버 요청: 동시에, 애플리케이션은 사용자의 액션을 서버에 전송합니다.
4. 결과 처리:
* 성공 시: 서버가 요청을 성공적으로 처리하면, UI의 낙관적 업데이트가 유지됩니다.
* 실패 시: 서버에서 오류가 발생하면, 애플리케이션은 UI를 원래 상태로 롤백하고 사용자에게 오류를 알립니다.

## 장점
* 향상된 사용자 경험: 사용자는 서버 응답을 기다리지 않고 즉각적인 피드백을 받게 되어, 애플리케이션이 더 반응적이고 빠르게 느껴집니다.
* 효율적인 인터랙션: 사용자는 자신의 액션이 실시간으로 반영되는 것처럼 느끼며, 이는 특히 실시간 애플리케이션에서 중요합니다.

## 단점 및 고려사항
* 롤백 관리: 서버에서 오류가 발생했을 때, UI를 원래 상태로 되돌리는 롤백 메커니즘이 필요합니다.
* 사용자 알림: 사용자에게 오류 발생을 알리고, 필요한 경우 다시 시도하도록 유도해야 합니다.
* 데이터 일관성: 낙관적 업데이트는 데이터의 일시적인 불일치를 초래할 수 있으므로, 이를 관리하는 로직이 필요합니다.

## 기술 스택
Frontend: HTML, JavaScript
Backend: Node.js, Express
Real-time Communication: Socket.IO


## 구현 단계


### 1. 서버 설정
Node.js와 Express를 사용하여 기본 서버를 설정하고, Socket.IO를 통해 실시간 통신 기능을 추가합니다.

```
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on('connection', socket => {
    socket.on('send_message', (data, callback) => {
        io.emit('receive_message', data);
        callback({ status: 'ok' });
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
```

### 2. 클라이언트 구현
HTML과 JavaScript를 사용하여 사용자 인터페이스를 구성합니다. 사용자가 메시지를 보내면, Socket.IO를 통해 서버에 이를 전송합니다.

```
const socket = io("http://localhost:3000");

function sendMessage() {
    var message = document.getElementById('message_input').value;
    addMessageToUI(message, true);
    socket.emit('send_message', message, response => {
        // ...
    });
}

function addMessageToUI(message, isOptimistic = false) {
    // ...
}

socket.on('receive_message', function (message) {
    addMessageToUI(message);
});
```

### 3. Optimistic Update 적용
사용자가 메시지를 보낼 때, 서버의 응답을 기다리지 않고 즉시 UI를 업데이트합니다. 이는 사용자가 자신의 행동에 대한 즉각적인 피드백을 받을 수 있게 하여 사용자 경험을 개선합니다.

```
function addMessageToUI(message, isOptimistic = false) {
    var messages = document.getElementById('messages');
    var li = document.createElement('li');
    li.textContent = message;
    if (isOptimistic) {
        li.style.opacity = '0.5';
    }
    messages.appendChild(li);
}
```

### 4. 사용자 식별
각 사용자가 보낸 메시지를 구분하기 위해, 메시지와 함께 사용자 식별 정보를 전송합니다. 이를 통해 서버로부터 받은 메시지가 현재 사용자의 것인지 판별하여, 이미 보낸 메시지는 UI에 다시 표시하지 않습니다.

```
socket.on('receive_message', function (data) {
    if (data.userId === currentUserId) {
        // 투명도를 다시 1로 변경
        document.getElementById('messages').lastChild.style.opacity = '1';
        return;
    }
    addMessageToUI(data.message);
});
```
