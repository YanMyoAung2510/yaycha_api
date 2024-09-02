import prisma from "../prismaClient.js"; // Add .js extension
import express from "express";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/notis", auth, async (req, res) => {
  const user = res.locals.user;
  const notis = await prisma.noti.findMany({
    where: {
      posts: {
        userId: Number(user.id),
      },
    },
    include: {
      users: true,
    },
    orderBy: { id: "desc" },
    take: 20,
  });
  res.json(notis);
});

router.put("/notis/read", auth, async (req, res) => {
  const user = res.locals.user;
  await prisma.noti.updateMany({
    where: {
      posts: {
        userId: Number(user.id),
      },
    },
    data: {
      read: true,
    },
  });
  res.json({ msg: "Marked all notis read" });
});

router.put("/notis/read/:id", auth, async (req, res) => {
  const { id } = req.params;
  const noti = await prisma.noti.update({
    where: { id: id },
    data: { read: true },
  });
  res.json(noti);
});

//create noti

const addNoti = async ({ type, content, postId, userId }) => {
  const post = await prisma.post.findFirst({
    where: {
      id: Number(postId),
    },
  });
  if (post.userId === userId) return false;

  const noti = await prisma.noti.create({
    data: {
      type,
      content,
      postId: Number(postId),
      userId: Number(userId),
    },
  });
  //   return noti;
};

export { router as notiRouter };
