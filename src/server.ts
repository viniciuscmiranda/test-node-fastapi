import fastify from "fastify";
import cors from "@fastify/cors";
import z from "zod";
import { PrismaClient, Prisma } from "@prisma/client";

const app = fastify();

app.register(cors, { origin: true }).then(() => {
  const prisma = new PrismaClient();

  app.get("/users", async () => {
    const users = await prisma.user.findMany();
    return { users };
  });

  app.post("/users", async (request, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    const { name, email } = createUserSchema.parse(request.body);

    await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    return reply.status(201).send();
  });

  app.delete("/users/:userId", async (request, reply) => {
    const deleteUserSchema = z.object({
      userId: z.string(),
    });

    const { userId } = deleteUserSchema.parse(request.params);

    try {
      await prisma.user.delete({ where: { id: userId } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          return reply.status(404).send("User not found.");
        }
      }

      throw err;
    }

    return reply.status(204).send();
  });
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    console.log("Server running.");
  });
