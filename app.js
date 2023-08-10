const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const connect = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error Message : ${e.message}`);
  }
};

connect();

const c = (a) => {
  for (let i of a) {
    return i;
  }
};

//API 1

app.get("/players/", async (request, response) => {
  const q1 = `SELECT * FROM player_details ;`;

  const r1 = await db.all(q1);
  response.send(
    r1.map((i) => {
      return {
        playerId: i.player_id,
        playerName: i.player_name,
      };
    })
  );
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const q2 = `SELECT player_id as playerId , player_name as playerName FROM player_details WHERE player_id = ${playerId};`;

  const r2 = await db.all(q2);
  response.send(c(r2));
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName } = request.body;

  const q4 = `UPDATE player_details SET player_name = '${playerName}' ;`;

  await db.run(q4);

  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const q4 = `SELECT match_id as matchId , match, year FROM match_details WHERE match_id = ${matchId};`;

  const r4 = await db.all(q4);

  response.send(c(r4));
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const q5 = `SELECT * FROM match_details INNER JOIN player_match_score ON
match_details.match_id = player_match_score.match_id
WHERE player_id = ${playerId};`;
  const r5 = await db.all(q5);

  response.send(
    r5.map((i) => {
      return {
        matchId: i.match_id,
        match: i.match,
        year: i.year,
      };
    })
  );
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const q6 = `SELECT
player_details.player_id AS playerId,
player_details.player_name AS playerName
FROM player_match_score NATURAL JOIN player_details
WHERE match_id=${matchId};`;
  const r6 = await db.all(q6);
  response.send(r6);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const q7 = `
SELECT
player_details.player_id AS playerId,
player_details.player_name AS playerName,
SUM(player_match_score.score) AS totalScore,
SUM(fours) AS totalFours,
SUM(sixes) AS totalSixes FROM
player_details INNER JOIN player_match_score ON
player_details.player_id = player_match_score.player_id
WHERE player_details.player_id = ${playerId};
`;
  const r7 = await db.all(q7);

  response.send(r7);
});

module.exports = app;
