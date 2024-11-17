import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { GetWeekPendingGoals } from "../../functions/get-week-pending-goals";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/pending-goals",
    {
      schema: {
        tags: ["goals"],
        description: "Get pending goals",
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
    async () => {
      const { pendingGoals } = await GetWeekPendingGoals();

      return { pendingGoals };
    }
  );
};
