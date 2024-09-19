"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        switch (message.type) {
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
                if (ws != senderSocket) {
                    return;
                }
                console.log("offer received");
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                    type: "create-offer",
                    sdp: message.sdp,
                }));
            }
            case "create-answer": {
                if (ws != receiverSocket) {
                    return;
                }
                console.log("answer recieved");
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                    type: "create-answer",
                    sdp: message.sdp,
                }));
            }
            case "ice-candidate": {
                if (ws === senderSocket) {
                    receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({
                        type: "ice-candidate",
                        candidate: message.candidate,
                    }));
                }
                else if (ws === receiverSocket) {
                    senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({
                        type: "ice-candidate",
                        candidate: message.candidate,
                    }));
                }
            }
        }
    });
});
