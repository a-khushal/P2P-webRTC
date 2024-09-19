import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data: any) {
        const message = JSON.parse(data);

        switch(message.type) {
            case "sender": {
                senderSocket = ws;
                console.log("sender set");
                break;
            }
            case "receiver": {
                receiverSocket = ws;
                console.log("receiver set");
                break;
            }
            case "create-offer": {
                if(ws != senderSocket) {
                    return;
                }
                console.log("offer received");
                receiverSocket?.send(JSON.stringify({
                    type: "create-offer",
                    sdp: message.sdp,
                }))
            } 
            case "create-answer": {
                if(ws != receiverSocket) {
                    return;
                }
                console.log("answer recieved");
                senderSocket?.send(JSON.stringify({
                    type: "create-answer",
                    sdp: message.sdp,
                }))
            }
            case "ice-candidate": {
                if(ws === senderSocket) {
                    receiverSocket?.send(JSON.stringify({
                        type: "ice-candidate",
                        candidate: message.candidate,
                    }))
                } else if(ws === receiverSocket) {
                    senderSocket?.send(JSON.stringify({
                        type: "ice-candidate",
                        candidate: message.candidate,
                    }))
                }
            }
        }
    });
});