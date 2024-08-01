import express from "express";
import prisma from "../prismaClient.js"; // Add .js extension

const router = express.Router();

router.get("/posts", async (req, res) => {
  try {
    const data = await prisma.post.findMany({
      include: {
        users: true,
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

router.get("/posts/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.post.findFirst({
      where: { id: Number(id) },
      include: {
        users: true,
        comments: {
          include: { users: true },
        },
      },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.comment.deleteMany({ where: { postId: Number(id) } });
  await prisma.post.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

router.delete("/comments/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.comment.delete({ where: { id: Number(id) } });
  res.sendStatus(204);
});

// export default contentRouter = router;
const contentRouter = router;
export default contentRouter;
