import express from "express";
import prisma from "../prismaClient.js"; // Add .js extension
import { auth, isOwner } from "../middlewares/auth.js";
import { addNoti } from "./noti.js";
const router = express.Router();

//following posts
router.get("/following/posts", auth, async (req, res) => {
  const user = res.locals.user;
  const follow = await prisma.follow.findMany({
    where: {
      followerId: Number(user.id),
    },
  });
  const users = follow.map((item) => item.followingId);
  const data = await prisma.post.findMany({
    where: {
      userId: {
        in: users,
      },
    },
    include: {
      users: true,
      comments: true,
      PostLike: true,
    },
    orderBy: { id: "desc" },
    take: 20,
  });
  res.json(data);
});

router.get("/posts", async (req, res) => {
  try {
    const data = await prisma.post.findMany({
      include: {
        users: true,
        comments: true,
        PostLike: true,
      },
      orderBy: { id: "desc" },
      take: 20,
    });
    res.json(data);
    // setTimeout(() => {
    //   res.json(data);
    // }, 0);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.post("/posts", auth, async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ msg: "content required" });
  }
  const user = res.locals.user;

  const post = await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });

  const data = await prisma.post.findFirst({
    where: { id: Number(post.id) },
    include: {
      users: true,
      comments: {
        include: { users: true, CommentLike: true },
      },
    },
  });

  res.json(data);
});

router.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.post.findFirst({
      where: { id: Number(id) },
      include: {
        users: true,
        comments: {
          include: { users: true, CommentLike: true },
        },
        PostLike: true,
      },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.delete("/posts/:id", auth, isOwner("post"), async (req, res) => {
  const { id } = req.params;
  await prisma.comment.deleteMany({ where: { postId: Number(id) } });
  await prisma.post.delete({ where: { id: Number(id) } });
  res.sendStatus(200);
});

router.post("/comments", auth, async (req, res) => {
  const { content, postId } = req.body;
  if (!content || !postId) {
    return;
    res.status(400).json({ msg: "content and postId required" });
  }
  const user = res.locals.user;
  const comment = await prisma.comment.create({
    data: {
      content,
      userId: Number(user.id),
      postId: Number(postId),
    },
  });
  comment.users = user;

  await addNoti({
    type: "comment",
    content: "reply your post",
    postId,
    userId: user.id,
  });

  res.json(comment);
});

router.delete("/comments/:id", auth, isOwner("comment"), async (req, res) => {
  const { id } = req.params;

  await prisma.comment.delete({ where: { id: Number(id) } });
  res.sendStatus(200);
});

// export default contentRouter = router;
const contentRouter = router;
export default contentRouter;
