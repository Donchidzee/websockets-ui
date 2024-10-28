import { games } from "../../data/index.js";

export function handleAddShips(ws, data) {
  const { gameId, ships, indexPlayer } = data;
  const game = games[gameId];

  if (!game) {
    console.log(`Game ${gameId} not found.`);
    return;
  }

  const player = game.players[indexPlayer];

  if (!player) {
    console.log(
      `Player with index ${indexPlayer} not found in game ${gameId}.`
    );
    return;
  }

  player.ships = ships;

  console.log(`Player ${indexPlayer} added ships for game ${gameId}.`);

  if (Object.values(game.players).every((p) => p.ships)) {
    const playerIndices = Object.keys(game.players);
    const currentPlayerIndex =
      playerIndices[Math.floor(Math.random() * playerIndices.length)];

    for (const [playerIndex, playerData] of Object.entries(game.players)) {
      const playerWs = playerData.ws;
      playerWs.send(
        JSON.stringify({
          type: "start_game",
          data: {
            ships: playerData.ships,
            currentPlayerIndex,
          },
          id: 0,
        })
      );
    }

    sendTurnUpdate(gameId, currentPlayerIndex);
    console.log(
      `Game ${gameId} started. It's Player ${currentPlayerIndex}'s turn.`
    );
  }
}

function sendTurnUpdate(gameId, currentPlayerIndex) {
  const game = games[gameId];
  for (const playerData of Object.values(game.players)) {
    const playerWs = playerData.ws;
    playerWs.send(
      JSON.stringify({
        type: "turn",
        data: { currentPlayer: currentPlayerIndex },
        id: 0,
      })
    );
  }
  console.log(`Turn updated: It's now Player ${currentPlayerIndex}'s turn.`);
}
