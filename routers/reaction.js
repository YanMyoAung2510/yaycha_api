import prisma from "../prismaClient.js"; // Add .js extension
import express from "express";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

/**
 ** get post like
 */
router.get("/like/posts/:id", async (req, res) => {
  const { id } = req.params;
  const data = await prisma.postLike.findMany({
    where: {
      postId: Number(id),
    },
    include: {
      user: {
        omit: {
          password: true,
        },
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });
  console.log(data);

  res.json(data);
});

/**
 ** create post like
 */
router.post("/like/posts/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = res.locals.user;
  const like = await prisma.postLike.create({
    data: {
      postId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ like });
});

/**
 ** delete post like
 */
router.delete("/unlike/posts/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = res.locals.user;
  await prisma.postLike.deleteMany({
    where: {
      postId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ msg: `Unlike post ${id}` });
});

/**
 ** get comment like
 */
router.get("/like/comments/:id", async (req, res) => {
  const { id } = req.params;
  const data = await prisma.commentLike.findMany({
    where: {
      commentId: Number(id),
    },
    include: {
      user: {
        include: {
          followers: true,
          following: true,
        },
      },
    },
  });
  res.json(data);
});

/**
 ** create comment like
 */
router.post("/like/comments/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = res.locals.user;
  console.log(id, user.id);

  const like = await prisma.commentLike.create({
    data: {
      commentId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json(like);
});

/**
 ** delete comment like
 */
router.delete("/unlike/comments/:id", auth, async (req, res) => {
  const { id } = req.params;
  const user = res.locals.user;
  await prisma.commentLike.deleteMany({
    where: {
      commentId: Number(id),
      userId: Number(user.id),
    },
  });
  res.json({ msg: `Unliked comment ${id}` });
});

const reactRouter = router;
export default reactRouter;
