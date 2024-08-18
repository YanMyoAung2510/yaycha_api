import express from "express";
import prisma from "../prismaClient.js"; // Add .js extension
// import bcrypt from "bcrypt";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// index
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

// show
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

// create
router.post("/users", async (req, res) => {
  const { name, username, bio, password } = req.body;
  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ msg: "name, username and password required" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, password: hash, bio },
  });
  res.json(user);
});

// delete
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

// auth login

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "username and password required" });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (user) {
    /**
     *? this is to short of long code just by adding await to resolve compare process before continue
     * */

    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      return res.json({ token, user });
    }
  }

  res.status(401).json({ msg: "incorrect username or password" });
});

/**
 *?  this is to understand how it's work long code bcrypt

*! router.post("/login", async (req, res) => {
*!   const { username, password } = req.body;

*!   if (!username || !password) {
*!     return res.status(400).json({ msg: "username and password is required" });
*!   }

*!   const user = await prisma.user.findFirst({
*!     where: { username: username },
*!   });

*!   if (user) {

*!     bcrypt.compare(password, user.password, (err, result) => {
*!       if (err) {
*!         return res.status(500).json({ msg: "Something went wrong" });
*!       }

*!       if (result) {
*!         const token = jwt.sign(user, process.env.JWT_SECRET);
*!         return res.json({ token, user });
*!       } else {
*!         return res.status(401).json({ msg: "Incorrect username or password" });
*!       }
*!     });
*!   }
*! });

 */

router.get("/verify", auth, async (req, res) => {
  const user = res.locals.user;
  res.json(user);
});

const userRouter = router;
export default userRouter;
