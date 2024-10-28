import { httpServer } from "./src/http_server/index.js";
import { wss } from "./src/ws_server/index.js";

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

console.log(`WebSocket server is running on port 3000`);

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  wss.close(() => {
    console.log("WebSocket server closed.");
    process.exit();
  });
});
