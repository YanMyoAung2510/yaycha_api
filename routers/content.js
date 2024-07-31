const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

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

module.exports = { contentRouter: router };
