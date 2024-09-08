import express from "express";
import expressWs from "express-ws";
import jwt from "jsonwebtoken";

const router = express.Router();

expressWs(router);

const secret = process.env.JWT_SECRET;

let clients = [];

router.ws("/subscribe", (ws, req) => {
  console.log("WS: New connection received!");

  ws.on("message", (msg) => {
    const { token } = JSON.parse(msg);
    console.log("WS: Web token received");
    jwt.verify(token, secret, (err, user) => {
      if (err) return false;
      clients.push({ userId: user.id, ws });
      console.log(`WS: Client added: ${user.id}`);
    });
  });
});

export { clients, router as wsRouter };
