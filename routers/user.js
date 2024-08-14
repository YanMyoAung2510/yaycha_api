import express from "express";
import prisma from "../prismaClient.js"; // Add .js extension
import { hash as bcrypt } from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      include: {
        posts: true,
        comments: true,
      },
      orderBy: { id: "desc" },
      take: 20,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        posts: true,
        comments: true,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/users", async (req, res) => {
  const { name, username, bio, password } = req.body;
  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ msg: "name, username and password required" });
  }
  const hash = await bcrypt(password, 10);
  const user = await prisma.user.create({
    data: { name, username, password: hash, bio },
  });
  res.json(user);
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.deleteMany({ where: { userId: Number(id) } });
    await prisma.comment.deleteMany({ where: { userId: Number(id) } });
    await prisma.user.delete({ where: { id: Number(id) } });

    res.sendStatus(204);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "username and password is required" });
  }
  const user = await prisma.user.findUnique;
  ({
    where: { username },
  });
  if (user) {
    if (bcrypt.compare(password, user.password)) {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      return res.json({ token, user });
    }
  }
  res.status(401).json({ msg: "Incorrect username or password" });
});

const userRouter = router;
export default userRouter;
