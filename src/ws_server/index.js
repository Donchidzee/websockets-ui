import { WebSocketServer } from "ws";
import { handleMessage } from "./messageHandler.js";

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    const parsedMessage = JSON.parse(message);
    console.log(`Received message: ${message}`);
    handleMessage(ws, parsedMessage);
  });
});

export { wss };
