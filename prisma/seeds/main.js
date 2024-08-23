import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import UserSeeder from "./UserSeeder.js";
import PostSeeder from "./PostSeeder.js";
import CommentSeeder from "./CommentSeeder.js";
import LikeSeeder from "./LikeSeeder.js";
async function main() {
  try {
    await UserSeeder();
    await PostSeeder();
    await CommentSeeder();
    await LikeSeeder();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
