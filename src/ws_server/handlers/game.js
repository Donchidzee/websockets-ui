import { games, players } from "../../data/index.js";

export function handleAttack(ws, data) {
  const { gameId, x, y, indexPlayer } = data;
  const game = games[gameId];

  if (!game) {
    console.log(`Game ${gameId} not found.`);
    return;
  }

  const currentPlayer = game.players[indexPlayer];

  if (!currentPlayer) {
    console.log(
      `Player with index ${indexPlayer} not found in game ${gameId}.`
    );
    return;
  }

  const opponentIndex = Object.keys(game.players).find(
    (index) => index !== indexPlayer
  );

  const opponent = game.players[opponentIndex];

  const attackResult = checkAttack(opponent, x, y);

  sendAttackFeedback(gameId, indexPlayer, x, y, attackResult.status);

  if (isGameOver(opponent)) {
    finishGame(gameId, indexPlayer);
  } else {
    if (attackResult.status === "miss") {
      sendTurnUpdate(gameId, opponentIndex);
    } else {
      sendTurnUpdate(gameId, indexPlayer);
    }
  }
}

function checkAttack(opponent, x, y) {
  let hit = false;
  let status = "miss";

  for (const ship of opponent.ships) {
    const shipCells = getShipCells(ship);

    for (const cell of shipCells) {
      if (cell.x === x && cell.y === y) {
        hit = true;
        opponent.hits.push({ x, y });
        if (isShipSunk(opponent, ship)) {
          status = "killed";
        } else {
          status = "shot";
        }
        break;
      }
    }
    if (hit) break;
  }

  return { hit, status };
}

function getShipCells(ship) {
  const cells = [];
  const { x, y } = ship.position;
  const length = ship.length;
  const isVertical = ship.direction;

  for (let i = 0; i < length; i++) {
    cells.push({
      x: x + (isVertical ? 0 : i),
      y: y + (isVertical ? i : 0),
    });
  }
  return cells;
}

function isShipSunk(opponent, ship) {
  const shipCells = getShipCells(ship);
  return shipCells.every((cell) =>
    opponent.hits.some((hit) => hit.x === cell.x && hit.y === cell.y)
  );
}

function isGameOver(opponent) {
  return opponent.ships.every((ship) => isShipSunk(opponent, ship));
}

function sendAttackFeedback(gameId, currentPlayerIndex, x, y, status) {
  const game = games[gameId];

  for (const [playerIndex, playerData] of Object.entries(game.players)) {
    const playerWs = playerData.ws;
    playerWs.send(
      JSON.stringify({
        type: "attack",
        data: {
          position: { x, y },
          currentPlayer: currentPlayerIndex,
          status,
        },
        id: 0,
      })
    );
  }
  console.log(
    `Attack result sent: Player ${currentPlayerIndex} at (${x}, ${y}) - ${status}.`
  );
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

function finishGame(gameId, winnerIndex) {
  const game = games[gameId];
  delete games[gameId];

  const winner = Object.values(players).find(
    (player) => player.index === winnerIndex
  );
  winner.wins += 1;

  for (const playerData of Object.values(game.players)) {
    const playerWs = playerData.ws;
    playerWs.send(
      JSON.stringify({
        type: "finish",
        data: { winPlayer: winnerIndex },
        id: 0,
      })
    );
  }

  // Send updated winners list
  sendUpdateWinners();
  console.log(`Game ${gameId} finished. Player ${winnerIndex} wins.`);
}

function sendUpdateWinners() {
  const winners = Object.values(players).map((player) => ({
    name: player.ws.playerName,
    wins: player.wins,
  }));

  const message = JSON.stringify({
    type: "update_winners",
    data: winners,
    id: 0,
  });

  for (const player of Object.values(players)) {
    if (player.ws && player.ws.readyState === player.ws.OPEN) {
      player.ws.send(message);
    }
  }
  console.log("Updated winners list sent to all players.");
}
