import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { createGoal } from "../../functions/create-goal";
import { atuhenticateUserHook } from "../hooks/authenticate-user";

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/goals",
    {
      onRequest: [atuhenticateUserHook],
      schema: {
        tags: ["goals"],
        description: "Create a goal",
        body: z.object({
          userId: z.string(),
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { userId, title, desiredWeeklyFrequency } = request.body;

      await createGoal({
        userId,
        title,
        desiredWeeklyFrequency,
      });

      return reply.status(201).send();
    }
  );
};
