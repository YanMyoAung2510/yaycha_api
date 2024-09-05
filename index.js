import express from "express";
import cors from "cors";
// import { contentRouter } from "./routers/content.js";
import contentRouter from "./routers/content.js";
import userRouter from "./routers/user.js";
import prisma from "./prismaClient.js";
import reactRouter from "./routers/reaction.js";
import { notiRouter } from "./routers/noti.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// post router
app.use("/content", contentRouter);

// user router
app.use("/", userRouter);

app.use("/reaction", reactRouter);

app.use("/", notiRouter);

app.get("/", (req, res) => {
  res.json({ msg: "Yaycha API" });
});

const server = app.listen(8000, () => {
  console.log("Yaycha API started at 8000...");
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  server.close(() => {
    console.log("Yaycha API closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
