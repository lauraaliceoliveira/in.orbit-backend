import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { GetWeekSummary } from "../../functions/get-week-summary";
import z from "zod";
import { atuhenticateUserHook } from "../hooks/authenticate-user";

export const getWeekSummary: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/summary",
    {
      onRequest: [atuhenticateUserHook],
      schema: {
        tags: ["goals"],
        description: "Get week summary",
        response: {
          200: z.object({
            summary: z.object({
              completed: z.number(),
              total: z.number(),
              goalsPerDay: z.record(
                z.string(),
                z.array(
                  z.object({
                    id: z.string(),
                    title: z.string(),
                    completedAt: z.string(),
                  })
                )
              ),
            }),
          }),
        },
      },
    },
    async () => {
      const { summary } = await GetWeekSummary();

      return { summary };
    }
  );
};
