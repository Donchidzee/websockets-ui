import { rooms, players } from "../../data/index.js";

export function handleCreateRoom(ws) {
  const roomId = generateUniqueId();
  rooms[roomId] = { players: [ws] };
  ws.roomId = roomId;

  updateRooms();

  ws.send(
    JSON.stringify({
      type: "update_room",
      data: getAvailableRooms(),
      id: 0,
    })
  );

  console.log(`Room ${roomId} created by player ${ws.playerName}.`);
}

export function handleAddUserToRoom(ws, data) {
  const { indexRoom } = data;
  const room = rooms[indexRoom];

  if (room && room.players.length === 1) {
    room.players.push(ws);
    ws.roomId = indexRoom;
    delete rooms[indexRoom];

    const player1Id = generateUniqueId();
    const player2Id = generateUniqueId();

    const gameId = generateUniqueId();
    const player1 = room.players[0];
    const player2 = room.players[1];

    player1.gameId = gameId;
    player2.gameId = gameId;

    player1.playerId = player1Id;
    player2.playerId = player2Id;

    games[gameId] = {
      players: {
        [player1Id]: { ws: player1, ships: null, hits: [] },
        [player2Id]: { ws: player2, ships: null, hits: [] },
      },
    };

    player1.send(
      JSON.stringify({
        type: "create_game",
        data: { idGame: gameId, idPlayer: player1Id },
        id: 0,
      })
    );

    player2.send(
      JSON.stringify({
        type: "create_game",
        data: { idGame: gameId, idPlayer: player2Id },
        id: 0,
      })
    );

    console.log(
      `Game ${gameId} created between ${player1.playerName} and ${player2.playerName}.`
    );
  } else {
    ws.send(
      JSON.stringify({
        type: "error",
        data: { message: "Room not available." },
        id: 0,
      })
    );
    console.log(`Player ${ws.playerName} failed to join room ${indexRoom}.`);
  }

  updateRooms();
}

function updateRooms() {
  const availableRooms = getAvailableRooms();

  const message = JSON.stringify({
    type: "update_room",
    data: availableRooms,
    id: 0,
  });

  for (const player of Object.values(players)) {
    if (player.ws && player.ws.readyState === player.ws.OPEN) {
      player.ws.send(message);
    }
  }
  console.log("Updated rooms list sent to all players.");
}

function getAvailableRooms() {
  return Object.keys(rooms).map((id) => ({
    roomId: id,
    roomUsers: rooms[id].players.map((playerWs) => ({
      name: playerWs.playerName,
      index: players[playerWs.playerName].index,
    })),
  }));
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
