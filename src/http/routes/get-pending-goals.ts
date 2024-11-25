import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { GetWeekPendingGoals } from "../../functions/get-week-pending-goals";
import { atuhenticateUserHook } from "../hooks/authenticate-user";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/pending-goals",
    {
      onRequest: [atuhenticateUserHook],
      schema: {
        tags: ["goals"],
        description: "Get pending goals",
        operationId: 'getPendingGoals',
        response: {
          200: z.object({
            pendingGoals: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                desiredWeekFrequency: z.number(),
                completionCount: z.number(),
              })
            ),
          }),
        },
      },
    },
    async (request) => {
      const userId = request.user.sub;

      const { pendingGoals } = await GetWeekPendingGoals({
        userId,
      });

      return { pendingGoals };
    }
  );
};
