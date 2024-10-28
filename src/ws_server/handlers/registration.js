import { players } from "../../data/index.js";

export function handleRegistration(ws, data) {
  const { name, password } = data;

  if (players[name]) {
    if (players[name].password !== password) {
      ws.send(
        JSON.stringify({
          type: "reg",
          data: {
            name,
            error: true,
            errorText: "Incorrect password",
          },
          id: 0,
        })
      );
      console.log(`Registration failed for ${name}: Incorrect password.`);
    } else {
      ws.playerName = name;
      players[name].ws = ws;

      ws.send(
        JSON.stringify({
          type: "reg",
          data: {
            name,
            index: players[name].index,
            error: false,
          },
          id: 0,
        })
      );
      console.log(`Player ${name} logged in successfully.`);
    }
  } else {
    const playerIndex = generateUniqueId();
    ws.playerName = name;
    players[name] = { password, wins: 0, ws, index: playerIndex };

    ws.send(
      JSON.stringify({
        type: "reg",
        data: {
          name,
          index: playerIndex,
          error: false,
        },
        id: 0,
      })
    );
    console.log(
      `Player ${name} registered successfully with index ${playerIndex}.`
    );
  }

  sendUpdateWinners();
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

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}
