import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import db, { initDB } from "./db.js";

initDB();

const app = express();
app.use(cors());
app.use(express.json());

// Normalize row
function normalize(row) {
  return {
    dishId: row.dishId,
    dishName: row.dishName,
    imageUrl: row.imageUrl,
    isPublished: !!row.isPublished
  };
}

// GET dishes
app.get("/dishes", (req, res) => {
  db.all("SELECT * FROM dishes ORDER BY dishId ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: "db error", details: err });
    res.json(rows.map(normalize));
  });
});

// Toggle publish and unpublish
app.post("/dishes/toggle/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: "invalid id" });

  db.get("SELECT isPublished FROM dishes WHERE dishId = ?", [id], (err, row) => {
    if (!row) return res.status(404).json({ error: "not found" });

    const newVal = row.isPublished ? 0 : 1;
    db.run("UPDATE dishes SET isPublished = ? WHERE dishId = ?", [newVal, id], function (err) {
      if (err) return res.status(500).json({ error: "update failed", details: err });

      const payload = { dishId: id, isPublished: !!newVal };
      broadcast({ type: "update", payload });

      res.json({ success: true, ...payload });
    });
  });
});


// Websockets ::

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// data transmission
function broadcast(obj) {
  const msg = JSON.stringify(obj);

  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
}

wss.on("connection", (ws) => {
  db.all("SELECT * FROM dishes ORDER BY dishId ASC", (err, rows) => {
    ws.send(JSON.stringify({
      type: "initial",
      payload: (rows || []).map(normalize)
    }));
  });
});


// now if we change the database 
let lastSnapshot = [];

db.all("SELECT * FROM dishes ORDER BY dishId ASC", (err, rows) => {
  lastSnapshot = rows || [];
});

function arraysDifferent(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

setInterval(() => {
  db.all("SELECT * FROM dishes ORDER BY dishId ASC", (err, rows) => {
    if (err || !rows) return;

    if (arraysDifferent(rows, lastSnapshot)) {
      console.log("🔥 DB CHANGED (CLI) — Broadcasting to clients");
      lastSnapshot = rows;

      broadcast({
        type: "initial",
        payload: rows.map(normalize)
      });
    }
  });
}, 1000);

server.listen(8080, () => {
  console.log("Backend HTTP + WS running at http://localhost:8080");
});
