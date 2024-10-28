import { handleRegistration } from "./handlers/registration.js";
import { handleCreateRoom, handleAddUserToRoom } from "./handlers/room.js";
import { handleAddShips } from "./handlers/ships.js";
import { handleAttack } from "./handlers/game.js";

export function handleMessage(ws, message) {
  const { type, data, id } = message;

  switch (type) {
    case "reg":
      handleRegistration(ws, data);
      break;
    case "create_room":
      handleCreateRoom(ws);
      break;
    case "add_user_to_room":
      handleAddUserToRoom(ws, data);
      break;
    case "add_ships":
      handleAddShips(ws, data);
      break;
    case "attack":
      handleAttack(ws, data);
      break;
    default:
      console.log(`Unknown message type: ${type}`);
      break;
  }
}
